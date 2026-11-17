package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.marketing.entity.MarketingProposal;
import com.example.agentic_ai_platform.marketing.repository.MarketingProposalRepository;
import com.example.agentic_ai_platform.marketing.serviceimpl.GroqContentGenerator;
import tools.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/marketing/proposals")
public class MarketingProposalController {
    private static final Logger log = LoggerFactory.getLogger(MarketingProposalController.class);

    private final MarketingProposalRepository proposals;
    private final GroqContentGenerator groq;
    private final ObjectMapper json;
    private final JavaMailSender mail;
    private final String from;
    private final String mailHost;

    public MarketingProposalController(
            MarketingProposalRepository proposals,
            GroqContentGenerator groq,
            ObjectMapper json,
            JavaMailSender mail,
            @Value("${app.marketing.mail.from:verified-sender@example.com}") String from,
            @Value("${spring.mail.host:}") String mailHost) {
        this.proposals = proposals;
        this.groq = groq;
        this.json = json;
        this.mail = mail;
        this.from = from;
        this.mailHost = mailHost;
    }

    public record ProposalInput(
            @NotBlank @Size(max=200) String clientCompany,
            @NotBlank @Size(max=160) String contactName,
            @NotBlank @Email @Size(max=320) String contactEmail,
            @NotBlank @Size(max=160) String industry,
            @NotBlank @Size(max=1000) String useCase,
            @NotEmpty List<@NotBlank String> services,
            @NotNull @DecimalMin("0.01") BigDecimal budget,
            @NotBlank @Size(max=160) String timeline,
            Map<String, Object> content
    ) {}

    public record ProposalEdit(
            Map<String, Object> content,
            String status,
            @Min(0) @Max(100) Integer winProbability,
            String nextAction,
            LocalDate followUpDate
    ) {}

    public record ProposalView(
            UUID id,
            String clientCompany,
            String contactName,
            String contactEmail,
            String industry,
            String useCase,
            List<String> services,
            BigDecimal budget,
            String timeline,
            Map<String, Object> content,
            String status,
            int winProbability,
            String nextAction,
            LocalDate followUpDate,
            Instant sentAt,
            Instant updatedAt
    ) {}

    private UUID tenant(JwtAuthenticationToken auth) {
        try {
            return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant claim is missing");
        }
    }

    private ProposalView view(MarketingProposal p) {
        try {
            List<String> servicesList = p.getServicesJson() != null
                    ? json.readValue(p.getServicesJson(), json.getTypeFactory().constructCollectionType(List.class, String.class))
                    : List.of();
            Map<String, Object> contentMap = p.getContentJson() != null
                    ? json.readValue(p.getContentJson(), json.getTypeFactory().constructMapType(Map.class, String.class, Object.class))
                    : Map.of();
            return new ProposalView(
                    p.getId(),
                    p.getClientCompany(),
                    p.getContactName(),
                    p.getContactEmail(),
                    p.getIndustry(),
                    p.getUseCase(),
                    servicesList,
                    p.getBudget(),
                    p.getTimeline(),
                    contentMap,
                    p.getStatus(),
                    p.getWinProbability(),
                    p.getNextAction(),
                    p.getFollowUpDate(),
                    p.getSentAt(),
                    p.getUpdatedAt()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse proposal json", e);
        }
    }

    private MarketingProposal owned(UUID id, UUID t) {
        return proposals.findByIdAndTenantId(id, t)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposal not found"));
    }

    @GetMapping
    public List<ProposalView> list(JwtAuthenticationToken auth) {
        return proposals.findAllByTenantIdOrderByUpdatedAtDesc(tenant(auth)).stream()
                .map(this::view)
                .toList();
    }

    @GetMapping("/{id}")
    public ProposalView get(@PathVariable UUID id, JwtAuthenticationToken auth) {
        return view(owned(id, tenant(auth)));
    }

    @PostMapping("/generate")
    public Map<String, Object> generate(@Valid @RequestBody ProposalInput in) {
        String prompt = "Create a client-ready enterprise business proposal as JSON with keys: " +
                "executiveSummary (string), challenges (string), solutionArchitecture (string), " +
                "scopeOfWork (array of strings), milestones (array of {phase, duration, deliverables}), " +
                "pricingBreakdown (array of {item, amount}), roiEstimate (string), commercialTerms (string). " +
                "Do not invent guaranteed ROI; label assumptions clearly. " +
                "Client: " + in.clientCompany() + "; Contact: " + in.contactName() + "; Industry: " + in.industry() +
                "; Use case: " + in.useCase() + "; Services: " + String.join(", ", in.services()) +
                "; Budget: $" + in.budget() + "; Timeline: " + in.timeline();

        var structured = groq.generateStructuredJson(
                "You write accurate enterprise proposals. Return a non-empty JSON object with keys: executiveSummary (string), challenges (string), solutionArchitecture (string), scopeOfWork (array of strings), milestones (array of objects with phase, duration, deliverables), pricingBreakdown (array of objects with item and amount), roiEstimate (string with assumptions, never promise unsupported outcomes), commercialTerms (string). Do not wrap JSON in markdown fences.",
                prompt);
        try {
            return json.readValue(json.writeValueAsString(structured), json.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
        } catch (Exception e) {
            log.error("Could not serialize structured proposal output", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Groq returned invalid proposal content. Please retry.");
        }
    }

    @PostMapping
    public ProposalView create(@Valid @RequestBody ProposalInput in, JwtAuthenticationToken auth) {
        try {
            String services = json.writeValueAsString(in.services());
            String content;
            if (in.content() != null && !in.content().isEmpty()) {
                content = json.writeValueAsString(in.content());
            } else {
                content = json.writeValueAsString(Map.of(
                        "executiveSummary", in.clientCompany() + " Enterprise Solution Proposal",
                        "challenges", in.useCase(),
                        "solutionArchitecture", "Modular Agentic AI Platform",
                        "scopeOfWork", in.services(),
                        "milestones", List.of(),
                        "pricingBreakdown", List.of(Map.of("item", "Platform Integration", "amount", in.budget())),
                        "roiEstimate", "Calculated post-pilot validation",
                        "commercialTerms", "Valid for 30 days"
                ));
            }
            MarketingProposal p = new MarketingProposal(
                    UUID.randomUUID(),
                    tenant(auth),
                    in.clientCompany(),
                    in.contactName(),
                    in.contactEmail(),
                    in.industry(),
                    in.useCase(),
                    services,
                    in.budget(),
                    in.timeline(),
                    content
            );
            return view(proposals.save(p));
        } catch (Exception e) {
            log.error("Could not create proposal: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not create proposal");
        }
    }

    @PutMapping("/{id}")
    public ProposalView update(@PathVariable UUID id, @Valid @RequestBody ProposalEdit edit, JwtAuthenticationToken auth) {
        var p = owned(id, tenant(auth));
        try {
            String contentJson = edit.content() != null ? json.writeValueAsString(edit.content()) : p.getContentJson();
            p.update(
                    contentJson,
                    edit.status(),
                    edit.winProbability() == null ? p.getWinProbability() : edit.winProbability(),
                    edit.nextAction(),
                    edit.followUpDate()
            );
            return view(proposals.save(p));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not update proposal");
        }
    }

    @PostMapping("/{id}/send")
    public ProposalView send(@PathVariable UUID id,
            @RequestParam(required=false) String subject,
            @RequestParam(required=false) String contentHtml,
            @RequestParam(required=false) String replyTo,
            @RequestPart(value="attachment", required=false) MultipartFile attachment,
            JwtAuthenticationToken auth) {
        var p = owned(id, tenant(auth));
        if (mailHost == null || mailHost.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SMTP is not configured; proposal was not sent");
        }
        if (attachment != null && attachment.getSize() > 10L * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Attachment exceeds 10 MiB");
        }
        try {
            var message = mail.createMimeMessage();
            var helper = new MimeMessageHelper(message, attachment != null && !attachment.isEmpty(), "UTF-8");
            helper.setFrom(from);
            helper.setTo(p.getContactEmail());
            helper.setSubject(subject == null || subject.isBlank() ? "Enterprise Business Proposal: " + p.getClientCompany() : subject.trim());
            helper.setText(contentHtml == null || contentHtml.isBlank() ? renderProposalHtml(p) : contentHtml, true);
            if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo.trim());
            if (attachment != null && !attachment.isEmpty()) {
                String filename = attachment.getOriginalFilename() == null ? "attachment" : attachment.getOriginalFilename().replaceAll("[\\\\/]", "_");
                helper.addAttachment(filename, new ByteArrayResource(attachment.getBytes()),
                        attachment.getContentType() == null ? "application/octet-stream" : attachment.getContentType());
            }
            mail.send(message);
        } catch (Exception e) {
            log.error("Proposal email dispatch failed for proposal {}", id, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Email could not be sent; proposal remains unsent");
        }
        p.markSent();
        return view(proposals.save(p));
    }

    private String renderProposalHtml(MarketingProposal proposal) {
        try {
            Map<String,Object> content = json.readValue(proposal.getContentJson(), json.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
            StringBuilder html = new StringBuilder("<html><body style='font-family:Arial,sans-serif;color:#243044;max-width:760px;margin:auto;line-height:1.6'>")
                    .append("<h1>Enterprise Business Proposal</h1><p>Prepared for <strong>").append(escape(proposal.getClientCompany())).append("</strong></p>");
            appendSection(html,"Executive Summary",content.get("executiveSummary"));
            appendSection(html,"Challenges",content.get("challenges"));
            appendSection(html,"Proposed Solution Architecture",content.get("solutionArchitecture"));
            appendSection(html,"Scope of Work & Deliverables",content.get("scopeOfWork"));
            appendSection(html,"Milestones",content.get("milestones"));
            appendSection(html,"Investment",content.get("pricingBreakdown"));
            html.append("<h2>Total Contract Value</h2><p>").append(escape(proposal.getBudget().toPlainString())).append("</p>");
            appendSection(html,"ROI Estimate",content.get("roiEstimate"));
            appendSection(html,"Commercial Terms",content.get("commercialTerms"));
            return html.append("<p>We would be pleased to schedule a review call to discuss next steps.</p></body></html>").toString();
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Saved proposal content is invalid"); }
    }
    private void appendSection(StringBuilder html,String title,Object value){if(value!=null)html.append("<h2>").append(escape(title)).append("</h2><div>").append(escape(String.valueOf(value)).replace("\n","<br>" )).append("</div>");}
    private String escape(String value){return value.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;").replace("'","&#39;");}

    @GetMapping("/pipeline")
    public Map<String, Object> pipeline(JwtAuthenticationToken auth) {
        var all = proposals.findAllByTenantIdOrderByUpdatedAtDesc(tenant(auth));
        var open = all.stream().filter(p -> !Set.of("ACCEPTED", "REJECTED").contains(p.getStatus())).toList();
        long activeNegotiations = all.stream().filter(p -> "NEGOTIATION".equalsIgnoreCase(p.getStatus())).count();
        BigDecimal total = BigDecimal.ZERO;
        BigDecimal weighted = BigDecimal.ZERO;
        for (var p : open) {
            total = total.add(p.getBudget());
            weighted = weighted.add(p.getBudget().multiply(BigDecimal.valueOf(p.getWinProbability()))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP));
        }
        return Map.of(
                "totalProposals", all.size(),
                "grossPipeline", total,
                "grossPipelineValue", total,
                "weightedPipeline", weighted,
                "weightedPipelineValue", weighted,
                "activeNegotiations", activeNegotiations
        );
    }
}
