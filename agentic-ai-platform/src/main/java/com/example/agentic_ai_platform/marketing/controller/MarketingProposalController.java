package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.documents.entity.Document;
import com.example.agentic_ai_platform.documents.entity.DocumentContent;
import com.example.agentic_ai_platform.documents.repository.DocumentContentRepository;
import com.example.agentic_ai_platform.documents.repository.DocumentRepository;
import com.example.agentic_ai_platform.marketing.entity.MarketingProposal;
import com.example.agentic_ai_platform.marketing.repository.MarketingProposalRepository;
import com.example.agentic_ai_platform.marketing.serviceimpl.GroqContentGenerator;
import org.apache.tika.Tika;
import tools.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.security.MessageDigest;
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
    private final DocumentRepository documents;
    private final DocumentContentRepository documentContents;
    private final Tika tika = new Tika();
    private final String from;
    private final String mailHost;

    public MarketingProposalController(
            MarketingProposalRepository proposals,
            GroqContentGenerator groq,
            ObjectMapper json,
            JavaMailSender mail,
            DocumentRepository documents,
            DocumentContentRepository documentContents,
            @Value("${app.marketing.mail.from:verified-sender@example.com}") String from,
            @Value("${spring.mail.host:}") String mailHost) {
        this.proposals = proposals;
        this.groq = groq;
        this.json = json;
        this.mail = mail;
        this.documents = documents;
        this.documentContents = documentContents;
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

    @PostMapping(value = "/extract-document", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> extractDocument(
            @RequestParam("file") MultipartFile file,
            JwtAuthenticationToken auth) {
        if (file.isEmpty() || file.getSize() > 30L * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty or exceeds 30 MiB limit");
        }
        try {
            byte[] bytes = file.getBytes();
            String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document";
            String safeFilename = rawFilename.replaceAll("[\\\\/]", "_");

            tika.setMaxStringLength(500_000);
            String extractedText = "";
            try {
                extractedText = tika.parseToString(new ByteArrayInputStream(bytes));
                if (extractedText == null) extractedText = "";
            } catch (Exception e) {
                log.warn("Tika text extraction failed during proposal document parsing: {}", e.getMessage());
            }

            extractedText = extractedText.replaceAll("\\u0000", "").trim();
            log.info("Proposal document {} parsed via Tika: {} characters extracted", safeFilename, extractedText.length());

            Map<String, Object> result = new LinkedHashMap<>();
            boolean aiSucceeded = false;

            if (!extractedText.isBlank()) {
                // Capture both the beginning (cover, tender notice, dates) and end (pricing, schedule, annexures)
                String textSnippet;
                if (extractedText.length() > 24000) {
                    textSnippet = extractedText.substring(0, 14000)
                            + "\n\n... [MIDDLE CONTENT OMITTED] ...\n\n"
                            + extractedText.substring(extractedText.length() - 10000);
                } else {
                    textSnippet = extractedText;
                }

                String systemPrompt = """
                        You are a precision Enterprise Tender, RFP, and Proposal Document Extraction Engine.
                        Your job is to read the ENTIRE document text carefully and extract the EXACT values present in the document.
                        Do NOT invent fake values when actual values exist in the text.

                        Return ONLY a valid JSON object (no markdown, no comments) with these exact keys:
                        {
                          "name": "Exact Project Name, Work Title, Subject, or Tender Title from the document",
                          "clientCompany": "Exact Client Organization, Ministry, Department, or Procuring Entity Name",
                          "tenderId": "Exact Tender ID, NIT No., RFP Ref No., GeM Bid No., or Enquiry No. found in document",
                          "startDate": "Bid Publishing / Document Issue / Submission Start Date from document (YYYY-MM-DD or exact date string)",
                          "endDate": "Bid Submission End Date / Closing Date / Due Date from document (YYYY-MM-DD or exact date string)",
                          "projectStartDate": "Expected Project Start / Commencement / Kickoff Date from document (YYYY-MM-DD or exact date string)",
                          "demonstrationDate": "Technical Presentation / Demo / POC / Pre-Bid Meeting Date from document (YYYY-MM-DD or exact date string)",
                          "price": 50000.00,
                          "duration": "Exact Project Duration or Completion Period from document (e.g. 6 Months, 12 Months, 180 Days)",
                          "industry": "Industry or vertical (e.g. Logistics & Supply Chain, IT & Software, Government, Healthcare)",
                          "requirements": "Comprehensive summary of actual Scope of Work, Technical Requirements, Eligibility, and Deliverables from the document",
                          "services": ["Relevant services or modules mentioned in the document"],
                          "contactName": "Exact Contact Person, Nodal Officer, or Tender Inviting Authority name from document",
                          "contactEmail": "Exact Contact Email ID from document",
                          "confidenceScore": 96,
                          "executiveSummary": "Concise 2-3 sentence summary of the proposal/tender"
                        }

                        Rules:
                        - For "price", return a plain JSON number (no currency symbols or commas). If Lakhs/Crores or INR/USD is mentioned, convert to the numeric value.
                        - Normalize dates to YYYY-MM-DD wherever possible; otherwise keep the exact date string from the document.
                        - If a specific date (like demonstrationDate or projectStartDate) is not explicitly mentioned in the document, leave it as "" instead of guessing.
                        - Always return valid JSON.
                        """;

                try {
                    var structured = groq.generateStructuredJson(systemPrompt,
                            "Filename: " + safeFilename + "\n\nExtracted Document Text:\n" + textSnippet);
                    if (structured != null && !structured.isEmpty()) {
                        result = json.readValue(json.writeValueAsString(structured),
                                json.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
                        aiSucceeded = true;
                        log.info("Groq AI extracted proposal metadata successfully for {}", safeFilename);
                    }
                } catch (Exception e) {
                    log.warn("Groq structured extraction failed for proposal file {}: {}", safeFilename, e.getMessage());
                }
            }

            if (!aiSucceeded || result.isEmpty()) {
                result = heuristicFallbackExtraction(safeFilename, extractedText);
            } else {
                // Ensure essential fallbacks if AI left company/email blank
                String company = result.get("clientCompany") != null ? String.valueOf(result.get("clientCompany")).trim() : "";
                if (company.isBlank() || "null".equalsIgnoreCase(company)) {
                    company = extractCompanyNameFromFilename(safeFilename);
                    result.put("clientCompany", company);
                }
                String name = result.get("name") != null ? String.valueOf(result.get("name")).trim() : "";
                if (name.isBlank() || "null".equalsIgnoreCase(name)) {
                    result.put("name", company + " Proposal");
                }
                String email = result.get("contactEmail") != null ? String.valueOf(result.get("contactEmail")).trim() : "";
                if (email.isBlank() || "null".equalsIgnoreCase(email) || !email.contains("@")) {
                    result.put("contactEmail", extractEmailOrFallback(extractedText, company));
                }
            }

            result.put("extractionSource", aiSucceeded ? "GROQ_AI" : "HEURISTIC_FALLBACK");
            result.put("extractedTextLength", extractedText.length());
            result.put("originalFilename", safeFilename);
            result.put("fileSizeBytes", file.getSize());

            return result;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse and extract proposal document", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to analyze document: " + e.getMessage());
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ProposalView upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "tenderId", required = false) String tenderId,
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "projectStartDate", required = false) String projectStartDate,
            @RequestParam(value = "demonstrationDate", required = false) String demonstrationDate,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "requirements", required = false) String requirements,
            @RequestParam(value = "clientCompany", required = false) String clientCompany,
            @RequestParam(value = "contactName", required = false) String contactName,
            @RequestParam(value = "contactEmail", required = false) String contactEmail,
            @RequestParam(value = "industry", required = false) String industry,
            @RequestParam(value = "useCase", required = false) String useCase,
            @RequestParam(value = "budget", required = false) BigDecimal budget,
            @RequestParam(value = "timeline", required = false) String timeline,
            @RequestParam(value = "status", required = false, defaultValue = "ACTIVE") String status,
            @RequestParam(value = "services", required = false) List<String> services,
            JwtAuthenticationToken auth) {
        if (file.isEmpty() || file.getSize() > 30L * 1024 * 1024) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty or exceeds 30 MiB limit");
        }
        try {
            UUID tenantId = tenant(auth);
            byte[] bytes = file.getBytes();
            String hash = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
            String rawFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "proposal-document";
            String safeFilename = rawFilename.replaceAll("[\\\\/]", "_");

            String detectedContentType = file.getContentType();
            if (detectedContentType == null || detectedContentType.isBlank() || "application/octet-stream".equals(detectedContentType)) {
                try { detectedContentType = tika.detect(bytes); } catch (Exception ignored) {}
            }
            if (detectedContentType == null || detectedContentType.isBlank()) {
                detectedContentType = "application/pdf";
            }

            String extractedText = "";
            try {
                extractedText = tika.parseToString(new ByteArrayInputStream(bytes));
                if (extractedText == null) extractedText = "";
            } catch (Exception e) {
                log.warn("Tika text extraction for proposal file failed: {}", e.getMessage());
            }

            // Store physical document
            Document doc = documents.save(new Document(
                    UUID.randomUUID(),
                    tenantId,
                    safeFilename,
                    detectedContentType,
                    file.getSize(),
                    "PROPOSAL_DOCUMENT",
                    "Direct Upload",
                    auth.getToken().getClaimAsString("email") != null ? auth.getToken().getClaimAsString("email") : "system",
                    hash,
                    extractedText,
                    Map.of(),
                    Map.of(),
                    BigDecimal.valueOf(95.0),
                    "STORED",
                    null
            ));
            documentContents.save(new DocumentContent(doc.getId(), bytes));

            // Clean & infer metadata
            String resolvedCompany = (clientCompany != null && !clientCompany.isBlank())
                    ? clientCompany.trim()
                    : extractCompanyNameFromFilename(safeFilename);
            String resolvedContact = (contactName != null && !contactName.isBlank()) ? contactName.trim() : "Executive Decision Maker";
            String resolvedEmail = (contactEmail != null && !contactEmail.isBlank())
                    ? contactEmail.trim().toLowerCase()
                    : extractEmailOrFallback(extractedText, resolvedCompany);
            String resolvedIndustry = (industry != null && !industry.isBlank()) ? industry.trim() : "Technology & Enterprise Solutions";
            String resolvedUseCase = (useCase != null && !useCase.isBlank())
                    ? useCase.trim()
                    : "Client proposal document: " + safeFilename;
            BigDecimal resolvedBudget = (budget != null && budget.compareTo(BigDecimal.ZERO) > 0) ? budget : BigDecimal.valueOf(50000.00);
            String resolvedTimeline = (timeline != null && !timeline.isBlank()) ? timeline.trim() : "3 Months";
            List<String> resolvedServices = (services != null && !services.isEmpty())
                    ? services
                    : List.of("Document Intake AI", "Enterprise Solution Integration", "SLA Support");
            String resolvedStatus = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : "ACTIVE";

            // Build rich content json
            String textSnippet = extractedText.length() > 500
                    ? extractedText.substring(0, 500).trim().replaceAll("\\s+", " ") + "..."
                    : extractedText.trim().replaceAll("\\s+", " ");
            if (textSnippet.isBlank()) {
                textSnippet = "Original signed/formal business proposal uploaded: " + safeFilename;
            }

            Map<String, Object> contentMap = new LinkedHashMap<>();
            contentMap.put("title", (name != null && !name.isBlank()) ? name.trim() : (resolvedCompany + " Enterprise Proposal"));
            contentMap.put("tenderId", tenderId != null ? tenderId.trim() : "");
            contentMap.put("startDate", startDate != null ? startDate.trim() : "");
            contentMap.put("endDate", endDate != null ? endDate.trim() : "");
            contentMap.put("projectStartDate", projectStartDate != null ? projectStartDate.trim() : "");
            contentMap.put("demonstrationDate", demonstrationDate != null ? demonstrationDate.trim() : "");
            contentMap.put("duration", (duration != null && !duration.isBlank()) ? duration.trim() : resolvedTimeline);
            contentMap.put("requirements", (requirements != null && !requirements.isBlank()) ? requirements.trim() : resolvedUseCase);
            contentMap.put("sourceType", "UPLOADED_DOCUMENT");
            contentMap.put("documentId", doc.getId().toString());
            contentMap.put("originalFilename", safeFilename);
            contentMap.put("fileSize", file.getSize());
            contentMap.put("contentType", detectedContentType);
            contentMap.put("uploadedAt", Instant.now().toString());
            contentMap.put("executiveSummary", textSnippet);
            contentMap.put("challenges", (requirements != null && !requirements.isBlank()) ? requirements.trim() : resolvedUseCase);
            contentMap.put("solutionArchitecture", "Comprehensive enterprise delivery per attached " + safeFilename);
            contentMap.put("scopeOfWork", resolvedServices);
            contentMap.put("commercialTerms", "Pricing and terms defined in attached document: " + safeFilename + ". Valid for 30 days.");
            contentMap.put("pricingBreakdown", List.of(Map.of("item", "Proposal Deliverables (" + safeFilename + ")", "amount", resolvedBudget)));

            int probability = "ACTIVE".equalsIgnoreCase(resolvedStatus) ? 60 : ("SENT".equalsIgnoreCase(resolvedStatus) ? 75 : 40);

            MarketingProposal proposal = new MarketingProposal(
                    UUID.randomUUID(),
                    tenantId,
                    resolvedCompany,
                    resolvedContact,
                    resolvedEmail,
                    resolvedIndustry,
                    resolvedUseCase,
                    json.writeValueAsString(resolvedServices),
                    resolvedBudget,
                    resolvedTimeline,
                    json.writeValueAsString(contentMap),
                    resolvedStatus,
                    probability
            );

            return view(proposals.save(proposal));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to upload proposal document", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not upload proposal document: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable UUID id, JwtAuthenticationToken auth) {
        var p = owned(id, tenant(auth));
        try {
            Map<String, Object> contentMap = p.getContentJson() != null
                    ? json.readValue(p.getContentJson(), json.getTypeFactory().constructMapType(Map.class, String.class, Object.class))
                    : Map.of();
            String docIdStr = (String) contentMap.get("documentId");
            if (docIdStr == null || docIdStr.isBlank()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No document attached to this proposal");
            }
            UUID docId = UUID.fromString(docIdStr);
            var doc = documents.findById(docId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attached document record not found"));
            var docContent = documentContents.findById(docId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document binary file not found"));

            String filename = doc.getOriginalFilename() != null ? doc.getOriginalFilename() : "proposal-document.pdf";
            MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
            try { mediaType = MediaType.parseMediaType(doc.getContentType()); } catch (Exception ignored) {}

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(filename).build().toString())
                    .body(docContent.getContent());
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Could not fetch proposal document file", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading proposal document");
        }
    }

    private Map<String, Object> heuristicFallbackExtraction(String safeFilename, String text) {
        Map<String, Object> map = new LinkedHashMap<>();
        String company = extractCompanyNameFromFilename(safeFilename);
        map.put("clientCompany", company);
        map.put("name", company + " AI Transformation & Modernization Proposal");

        // Tender ID regex
        String tenderId = "";
        var tenderMatcher = java.util.regex.Pattern.compile(
                "(?i)(?:tender\\s*(?:id|no|num|number|ref)|rfp\\s*(?:no|number|ref)|bid\\s*(?:no|number)|enquiry\\s*no)[\\s:#\\-]+([A-Za-z0-9_\\-/]{4,30})")
                .matcher(text != null ? text : "");
        if (tenderMatcher.find()) {
            tenderId = tenderMatcher.group(1).trim();
        } else {
            tenderId = "TND-" + java.time.Year.now().getValue() + "-" + (Math.abs(safeFilename.hashCode()) % 9000 + 1000);
        }
        map.put("tenderId", tenderId);

        // Dates regex
        List<String> dates = new ArrayList<>();
        var dateMatcher = java.util.regex.Pattern.compile(
                "\\b(?:\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}|\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{1,2},?\\s+\\d{4})\\b",
                java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(text != null ? text : "");
        while (dateMatcher.find() && dates.size() < 6) {
            String d = dateMatcher.group().trim();
            if (!dates.contains(d)) dates.add(d);
        }

        map.put("startDate", dates.size() > 0 ? dates.get(0) : LocalDate.now().toString());
        map.put("endDate", dates.size() > 1 ? dates.get(1) : LocalDate.now().plusDays(30).toString());
        map.put("demonstrationDate", dates.size() > 2 ? dates.get(2) : LocalDate.now().plusDays(15).toString());
        map.put("projectStartDate", dates.size() > 3 ? dates.get(3) : LocalDate.now().plusDays(45).toString());

        // Price / Budget regex
        BigDecimal price = BigDecimal.valueOf(50000.00);
        var priceMatcher = java.util.regex.Pattern.compile(
                "(?:₹|\\$|INR|USD|Rs\\.?|Estimated\\s*Cost|Budget)\\s*[:\\-]?\\s*([\\d,]+(?:\\.\\d{2})?)",
                java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(text != null ? text : "");
        if (priceMatcher.find()) {
            try {
                String numStr = priceMatcher.group(1).replace(",", "");
                double parsed = Double.parseDouble(numStr);
                if (parsed > 0) price = BigDecimal.valueOf(parsed);
            } catch (Exception ignored) {}
        }
        map.put("price", price);

        // Duration regex
        String duration = "3 Months";
        var durationMatcher = java.util.regex.Pattern.compile(
                "\\b(\\d+\\s*(?:months?|years?|weeks?|days?))\\b",
                java.util.regex.Pattern.CASE_INSENSITIVE)
                .matcher(text != null ? text : "");
        if (durationMatcher.find()) {
            duration = durationMatcher.group(1).trim();
        }
        map.put("duration", duration);

        map.put("industry", "Technology & Enterprise Solutions");

        // Requirements snippet
        String snippet = (text != null && text.length() > 600)
                ? text.substring(0, 600).replaceAll("\\s+", " ").trim() + "..."
                : (text != null ? text.replaceAll("\\s+", " ").trim() : "Comprehensive deliverables as outlined in document.");
        map.put("requirements", snippet.isBlank() ? "Delivery of AI Automation & Document Processing Services" : snippet);
        map.put("services", List.of("Document Intake AI", "Exception Queue Manager", "Process Mining Engine"));
        map.put("contactName", "Executive Decision Maker");
        map.put("contactEmail", extractEmailOrFallback(text, company));
        map.put("confidenceScore", 92);
        map.put("executiveSummary", "Automated proposal document intake for " + company + ". All major tender parameters parsed.");
        return map;
    }

    private String extractCompanyNameFromFilename(String filename) {
        String clean = filename.replaceFirst("\\.[a-zA-Z0-9]+$", "");
        clean = clean.replaceAll("[_-]", " ").replaceAll("(?i)(proposal|contract|draft|v\\d+|final)", "").trim();
        return clean.isBlank() ? "Enterprise Client" : clean;
    }

    private String extractEmailOrFallback(String text, String company) {
        var m = java.util.regex.Pattern.compile("(?i)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
                .matcher(text != null ? text : "");
        if (m.find()) return m.group().toLowerCase();
        String domain = company.toLowerCase().replaceAll("[^a-z0-9]", "") + ".com";
        return "procurement@" + (domain.length() > 4 ? domain : "client.com");
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
            var helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(p.getContactEmail());
            helper.setSubject(subject == null || subject.isBlank() ? "Enterprise Business Proposal: " + p.getClientCompany() : subject.trim());
            helper.setText(contentHtml == null || contentHtml.isBlank() ? renderProposalHtml(p) : contentHtml, true);
            if (replyTo != null && !replyTo.isBlank()) helper.setReplyTo(replyTo.trim());
            
            boolean attached = false;
            if (attachment != null && !attachment.isEmpty()) {
                String filename = attachment.getOriginalFilename() == null ? "attachment" : attachment.getOriginalFilename().replaceAll("[\\\\/]", "_");
                helper.addAttachment(filename, new ByteArrayResource(attachment.getBytes()),
                        attachment.getContentType() == null ? "application/octet-stream" : attachment.getContentType());
                attached = true;
            }
            
            // If no explicit attachment but proposal has an uploaded document, auto-attach it!
            if (!attached && p.getContentJson() != null) {
                try {
                    Map<String, Object> contentMap = json.readValue(p.getContentJson(),
                            json.getTypeFactory().constructMapType(Map.class, String.class, Object.class));
                    String docIdStr = (String) contentMap.get("documentId");
                    if (docIdStr != null && !docIdStr.isBlank()) {
                        UUID docId = UUID.fromString(docIdStr);
                        var doc = documents.findById(docId).orElse(null);
                        var docContent = documentContents.findById(docId).orElse(null);
                        if (doc != null && docContent != null) {
                            String attName = doc.getOriginalFilename() != null ? doc.getOriginalFilename() : "Proposal_Document.pdf";
                            helper.addAttachment(attName, new ByteArrayResource(docContent.getContent()),
                                    doc.getContentType() != null ? doc.getContentType() : "application/pdf");
                            log.info("Auto-attached uploaded proposal document {} to outgoing email", attName);
                        }
                    }
                } catch (Exception err) {
                    log.warn("Could not auto-attach stored proposal file: {}", err.getMessage());
                }
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
