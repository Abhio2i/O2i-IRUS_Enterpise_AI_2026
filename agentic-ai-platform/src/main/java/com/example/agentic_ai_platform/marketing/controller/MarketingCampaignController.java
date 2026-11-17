package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.marketing.dto.MarketingContactResponse;
import com.example.agentic_ai_platform.marketing.service.MarketingCustomerListService;
import jakarta.mail.internet.MimeMessage;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/marketing/campaigns")
public class MarketingCampaignController {

    private static final Logger log = LoggerFactory.getLogger(MarketingCampaignController.class);

    private final JavaMailSender mailSender;
    private final MarketingCustomerListService customerLists;
    private final String fromAddress;
    private final String mailHost;
    private final String allowedSendersConfig;

    private final Map<UUID, CampaignState> campaigns = new ConcurrentHashMap<>();

    public record SendBulkRequest(
            String campaignName,
            String targetDomain,
            String subject,
            String contentHtml,
            String senderName,
            String replyTo,
            List<String> variables
    ) {}

    public record CampaignState(
            UUID campaignId,
            UUID tenantId,
            String campaignName,
            String targetDomain,
            String subject,
            String status,
            int totalRecipients,
            int sentCount,
            int deliveredCount,
            int openedCount,
            int clickedCount,
            int bouncedCount,
            Instant dispatchedAt,
            Instant completedAt
    ) {}

    public MarketingCampaignController(
            JavaMailSender mailSender,
            MarketingCustomerListService customerLists,
            @Value("${spring.mail.from:verified-sender@example.com}") String fromAddress,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${app.marketing.allowed-senders:}") String allowedSendersConfig) {
        this.mailSender = mailSender;
        this.customerLists = customerLists;
        this.fromAddress = fromAddress;
        this.mailHost = mailHost;
        this.allowedSendersConfig = allowedSendersConfig;
    }

    @GetMapping
    public List<CampaignState> listCampaigns(JwtAuthenticationToken auth) {
        UUID tenant = tenantId(auth);
        return campaigns.values().stream()
                .filter(c -> c.tenantId().equals(tenant))
                .sorted((a, b) -> b.dispatchedAt().compareTo(a.dispatchedAt()))
                .toList();
    }

    @GetMapping("/sender-config")
    public Map<String, Object> getSenderConfig(JwtAuthenticationToken auth) {
        List<String> allowed = new ArrayList<>();
        if (fromAddress != null && !fromAddress.isBlank()) {
            allowed.add(fromAddress.trim());
        }
        if (allowedSendersConfig != null && !allowedSendersConfig.isBlank()) {
            for (String sender : allowedSendersConfig.split(",")) {
                String trimmed = sender.trim();
                if (!trimmed.isEmpty() && !allowed.contains(trimmed)) {
                    allowed.add(trimmed);
                }
            }
        }
        return Map.of(
                "smtpConfigured", mailHost != null && !mailHost.isBlank(),
                "defaultSender", fromAddress != null ? fromAddress.trim() : "verified-sender@example.com",
                "allowedSenders", allowed
        );
    }

    @PostMapping("/send-bulk")
    public ResponseEntity<?> sendBulk(@RequestParam String campaignName, @RequestParam(required = false) String targetDomain,
            @RequestParam(required = false) UUID targetListId,
            @RequestParam(required = false) String directEmail,
            @RequestParam(required = false) String directFirstName,
            @RequestParam(required = false) String directLastName,
            @RequestParam(required = false) String directCompany,
            @RequestParam String subject, @RequestParam String contentHtml,
            @RequestParam(required = false) String fromEmail, @RequestParam(required = false) String senderName,
            @RequestParam(required = false) String replyTo,
            @RequestParam(required = false) List<String> variables,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment,
            JwtAuthenticationToken auth) {
        SendBulkRequest request = new SendBulkRequest(campaignName, targetDomain, subject, contentHtml, senderName, replyTo, variables);
        UUID tenant = tenantId(auth);
        UUID campaignId = UUID.randomUUID();

        String effectiveFrom = (fromEmail != null && !fromEmail.isBlank()) ? fromEmail.trim() : fromAddress.trim();

        List<MarketingContactResponse> recipients;
        String campaignTarget;

        if (directEmail != null && !directEmail.isBlank()) {
            String fName = (directFirstName != null && !directFirstName.isBlank()) ? directFirstName.trim() : "Valued Customer";
            String lName = (directLastName != null && !directLastName.isBlank()) ? directLastName.trim() : "";
            String comp = (directCompany != null && !directCompany.isBlank()) ? directCompany.trim() : "Oxygen to Innovation";
            recipients = List.of(new MarketingContactResponse(
                    UUID.randomUUID(), directEmail.trim(), fName, lName, comp,
                    "Lead", "General", "Global", null, "ACTIVE", java.math.BigDecimal.ZERO, Instant.now()
            ));
            campaignTarget = directEmail.trim();
        } else if (targetListId != null) {
            recipients = customerLists.members(tenant, targetListId);
            campaignTarget = "list:" + targetListId;
        } else if (targetDomain != null && !targetDomain.isBlank()) {
            String domain = targetDomain.trim().toLowerCase();
            recipients = customerLists.contacts(tenant).stream().filter(c -> c.email() != null
                    && c.email().toLowerCase().endsWith("@" + domain)).toList();
            campaignTarget = domain;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a target domain, saved list, or enter a direct recipient email");
        }

        if (recipients.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No contacts found for the selected audience");
        }

        int sent = 0;
        int total = recipients.size();
        String lastError = null;

        for (MarketingContactResponse contact : recipients) {
            try {
                String html = personalizeHtml(request.contentHtml(), contact, request.senderName());
                String personalizedSubject = personalizeSubject(request.subject() == null ? "" : request.subject(), contact, request.senderName());
                var message = mailSender.createMimeMessage();
                var helper = new MimeMessageHelper(message, "UTF-8");
                if (request.senderName() != null && !request.senderName().isBlank()) {
                    helper.setFrom(effectiveFrom, request.senderName());
                } else {
                    helper.setFrom(effectiveFrom);
                }
                helper.setTo(contact.email());
                helper.setSubject(personalizedSubject);
                helper.setText(html, true);
                if (request.replyTo() != null && !request.replyTo().isBlank()) helper.setReplyTo(request.replyTo());
                if (attachment != null && !attachment.isEmpty()) {
                    if (attachment.getSize() > 10L * 1024 * 1024) throw new IllegalArgumentException("Attachment exceeds 10 MiB");
                    String filename = attachment.getOriginalFilename() == null ? "attachment" : attachment.getOriginalFilename().replaceAll("[\\\\/]", "_");
                    helper.addAttachment(filename, new ByteArrayResource(attachment.getBytes()),
                            attachment.getContentType() == null ? "application/octet-stream" : attachment.getContentType());
                }

                if (mailHost != null && !mailHost.isBlank()) {
                    mailSender.send(message);
                    log.info("Dispatched email via SMTP to {}", contact.email());
                } else {
                    log.info("SMTP_HOST not set: simulated dispatch to {}", contact.email());
                }
                sent++;
            } catch (Exception ex) {
                lastError = ex.getMessage();
                log.error("Failed to send email to {}: {}", contact.email(), ex.getMessage());
            }
        }

        int bounced = total - sent;
        Instant now = Instant.now();
        String status;
        if (sent == total && total > 0) {
            status = "COMPLETED";
        } else if (sent > 0) {
            status = "PARTIAL";
        } else {
            status = "FAILED";
        }

        CampaignState state = new CampaignState(
                campaignId,
                tenant,
                request.campaignName() != null ? request.campaignName() : "Target Outreach",
                campaignTarget,
                request.subject() != null ? request.subject() : "Executive Communication",
                status,
                total,
                sent,
                sent,
                0,
                0,
                bounced,
                now,
                Instant.now()
        );
        campaigns.put(campaignId, state);

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("campaignId", campaignId.toString());
        responseMap.put("campaignName", state.campaignName());
        responseMap.put("targetDomain", state.targetDomain());
        responseMap.put("status", state.status());
        responseMap.put("totalQueued", total);
        responseMap.put("recipientCount", total);
        responseMap.put("sent", sent);
        responseMap.put("failed", bounced);
        responseMap.put("dispatchedAt", now.toString());
        if (lastError != null) {
            responseMap.put("errorDetail", lastError);
        } else if (mailHost == null || mailHost.isBlank()) {
            responseMap.put("note", "SMTP_HOST not set on server; delivery simulated successfully.");
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getStatus(@PathVariable UUID id, JwtAuthenticationToken auth) {
        CampaignState state = campaigns.get(id);
        if (state == null || !state.tenantId().equals(tenantId(auth))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign not found");
        }

        return ResponseEntity.ok(Map.ofEntries(
                Map.entry("campaignId", state.campaignId().toString()),
                Map.entry("campaignName", state.campaignName()),
                Map.entry("status", state.status()),
                Map.entry("targetDomain", state.targetDomain()),
                Map.entry("totalRecipients", state.totalRecipients()),
                Map.entry("sentCount", state.sentCount()),
                Map.entry("deliveredCount", state.deliveredCount()),
                Map.entry("openedCount", 0),
                Map.entry("clickedCount", 0),
                Map.entry("bouncedCount", state.bouncedCount()),
                Map.entry("dispatchedAt", state.dispatchedAt().toString()),
                Map.entry("completedAt", state.completedAt().toString())
        ));
    }

    private String personalizeHtml(String template, MarketingContactResponse contact, String senderName) {
        if (template == null) return "";
        String fName = (contact.firstName() != null && !contact.firstName().isBlank()) ? contact.firstName().trim() : "Valued Customer";
        String lName = (contact.lastName() != null && !contact.lastName().isBlank()) ? contact.lastName().trim() : "";
        String comp = (contact.company() != null && !contact.company().isBlank()) ? contact.company().trim() : "Oxygen to Innovation";
        String em = (contact.email() != null && !contact.email().isBlank()) ? contact.email().trim() : "";
        String sName = (senderName != null && !senderName.isBlank()) ? senderName.trim() : "Oxygen to Innovation";

        String result = template;
        result = result.replace("{{firstName}}", html(fName))
                .replace("{{lastName}}", html(lName))
                .replace("{{company}}", html(comp))
                .replace("{{email}}", html(em))
                .replace("{{senderName}}", html(sName));
        return result.replaceAll("\\{\\{[a-zA-Z0-9_]+}}", "");
    }

    private String personalizeSubject(String template, MarketingContactResponse contact, String senderName) {
        if (template == null) return "";
        String fName = (contact.firstName() != null && !contact.firstName().isBlank()) ? contact.firstName().trim() : "Valued Customer";
        String lName = (contact.lastName() != null && !contact.lastName().isBlank()) ? contact.lastName().trim() : "";
        String comp = (contact.company() != null && !contact.company().isBlank()) ? contact.company().trim() : "Oxygen to Innovation";
        String em = (contact.email() != null && !contact.email().isBlank()) ? contact.email().trim() : "";
        String sName = (senderName != null && !senderName.isBlank()) ? senderName.trim() : "Oxygen to Innovation";

        String result = template;
        result = result.replace("{{firstName}}", fName)
                .replace("{{lastName}}", lName)
                .replace("{{company}}", comp)
                .replace("{{email}}", em)
                .replace("{{senderName}}", sName);
        return result.replaceAll("\\{\\{[a-zA-Z0-9_]+}}", "").trim();
    }

    private String html(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    private UUID tenantId(JwtAuthenticationToken auth) {
        try {
            return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim");
        }
    }
}
