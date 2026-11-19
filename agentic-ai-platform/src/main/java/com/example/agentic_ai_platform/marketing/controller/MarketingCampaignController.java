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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
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
    private final int batchSize;
    private final int pauseSeconds;
    private final ExecutorService executorService = Executors.newVirtualThreadPerTaskExecutor();

    private final Map<UUID, CampaignState> campaigns = new ConcurrentHashMap<>();

    public record SendBulkRequest(
            String campaignName,
            String targetDomain,
            String subject,
            String contentHtml,
            String senderName,
            String replyTo,
            String cc,
            String bcc,
            List<String> variables
    ) {}

    private String[] parseEmailList(String raw) {
        if (raw == null || raw.isBlank()) {
            return new String[0];
        }
        return Arrays.stream(raw.split("[,;\\s]+"))
                .map(String::trim)
                .filter(s -> !s.isBlank() && s.contains("@") && s.contains("."))
                .distinct()
                .toArray(String[]::new);
    }

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
            @Value("${app.marketing.allowed-senders:}") String allowedSendersConfig,
            @Value("${app.marketing.mail.rate-limit.batch-size:25}") int batchSize,
            @Value("${app.marketing.mail.rate-limit.pause-seconds:60}") int pauseSeconds) {
        this.mailSender = mailSender;
        this.customerLists = customerLists;
        this.fromAddress = fromAddress;
        this.mailHost = mailHost;
        this.allowedSendersConfig = allowedSendersConfig;
        this.batchSize = batchSize > 0 ? batchSize : 25;
        this.pauseSeconds = pauseSeconds >= 0 ? pauseSeconds : 60;
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
                "allowedSenders", allowed,
                "batchSize", batchSize,
                "pauseSeconds", pauseSeconds,
                "rateLimitNotice", batchSize + " emails per minute with " + pauseSeconds + "s cooldown (GoDaddy Safe Mode)"
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
            @RequestParam(required = false) String cc,
            @RequestParam(required = false) String bcc,
            @RequestParam(required = false) List<String> variables,
            @RequestPart(value = "attachment", required = false) MultipartFile attachment,
            JwtAuthenticationToken auth) {
        SendBulkRequest request = new SendBulkRequest(campaignName, targetDomain, subject, contentHtml, senderName, replyTo, cc, bcc, variables);
        UUID tenant = tenantId(auth);
        UUID campaignId = UUID.randomUUID();

        final String[] ccAddresses = parseEmailList(cc);
        final String[] bccAddresses = parseEmailList(bcc);

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

        int total = recipients.size();
        Instant now = Instant.now();

        // Safely extract attachment bytes synchronously before entering background worker
        final byte[] attachBytes;
        final String attachName;
        final String attachContentType;
        if (attachment != null && !attachment.isEmpty()) {
            if (attachment.getSize() > 10L * 1024 * 1024) {
                throw new IllegalArgumentException("Attachment exceeds 10 MiB");
            }
            try {
                attachBytes = attachment.getBytes();
                attachName = attachment.getOriginalFilename() == null ? "attachment" : attachment.getOriginalFilename().replaceAll("[\\\\/]", "_");
                attachContentType = attachment.getContentType() == null ? "application/octet-stream" : attachment.getContentType();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read attachment file: " + e.getMessage());
            }
        } else {
            attachBytes = null;
            attachName = null;
            attachContentType = null;
        }

        // Fast path: Single direct recipient (e.g. test email or proposal transmission)
        if (total == 1) {
            MarketingContactResponse contact = recipients.getFirst();
            int sent = 0;
            String lastError = null;
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
                if (ccAddresses.length > 0) {
                    helper.setCc(ccAddresses);
                }
                if (bccAddresses.length > 0) {
                    helper.setBcc(bccAddresses);
                }
                helper.setSubject(personalizedSubject);
                helper.setText(html, true);
                if (request.replyTo() != null && !request.replyTo().isBlank()) helper.setReplyTo(request.replyTo());
                if (attachBytes != null) {
                    helper.addAttachment(attachName, new ByteArrayResource(attachBytes), attachContentType);
                }

                if (mailHost != null && !mailHost.isBlank()) {
                    mailSender.send(message);
                    log.info("Dispatched single email via SMTP to {}", contact.email());
                } else {
                    log.info("SMTP_HOST not set: simulated single dispatch to {}", contact.email());
                }
                sent = 1;
            } catch (Exception ex) {
                lastError = ex.getMessage();
                log.error("Failed to send single email to {}: {}", contact.email(), ex.getMessage());
            }

            String status = (sent == 1) ? "COMPLETED" : "FAILED";
            CampaignState state = new CampaignState(
                    campaignId, tenant,
                    request.campaignName() != null ? request.campaignName() : "Target Outreach",
                    campaignTarget,
                    request.subject() != null ? request.subject() : "Executive Communication",
                    status, 1, sent, sent, 0, 0, (sent == 1 ? 0 : 1), now, Instant.now()
            );
            campaigns.put(campaignId, state);

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("campaignId", campaignId.toString());
            responseMap.put("campaignName", state.campaignName());
            responseMap.put("targetDomain", state.targetDomain());
            responseMap.put("status", status);
            responseMap.put("totalQueued", 1);
            responseMap.put("recipientCount", 1);
            responseMap.put("sent", sent);
            responseMap.put("failed", (sent == 1 ? 0 : 1));
            responseMap.put("dispatchedAt", now.toString());
            if (ccAddresses.length > 0) responseMap.put("cc", ccAddresses);
            if (bccAddresses.length > 0) responseMap.put("bcc", bccAddresses);
            if (lastError != null) responseMap.put("errorDetail", lastError);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
        }

        // Bulk Path: Asynchronous execution with GoDaddy rate-limiting (25 emails/batch + 60s cooldown)
        CampaignState initialState = new CampaignState(
                campaignId, tenant,
                request.campaignName() != null ? request.campaignName() : "Target Outreach",
                campaignTarget,
                request.subject() != null ? request.subject() : "Executive Communication",
                "SENDING", total, 0, 0, 0, 0, 0, now, null
        );
        campaigns.put(campaignId, initialState);

        executorService.submit(() -> {
            int sent = 0;
            int failed = 0;
            int batchCount = 0;
            for (int i = 0; i < recipients.size(); i++) {
                MarketingContactResponse contact = recipients.get(i);
                boolean emailSent = false;
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
                    if (ccAddresses.length > 0) {
                        helper.setCc(ccAddresses);
                    }
                    if (bccAddresses.length > 0) {
                        helper.setBcc(bccAddresses);
                    }
                    helper.setSubject(personalizedSubject);
                    helper.setText(html, true);
                    if (request.replyTo() != null && !request.replyTo().isBlank()) helper.setReplyTo(request.replyTo());
                    if (attachBytes != null) {
                        helper.addAttachment(attachName, new ByteArrayResource(attachBytes), attachContentType);
                    }

                    for (int attempt = 1; attempt <= 2; attempt++) {
                        try {
                            if (mailHost != null && !mailHost.isBlank()) {
                                mailSender.send(message);
                                log.info("Dispatched email ({}/{}) via SMTP to {}", i + 1, total, contact.email());
                            } else {
                                log.info("SMTP_HOST not set: simulated dispatch ({}/{}) to {}", i + 1, total, contact.email());
                            }
                            sent++;
                            emailSent = true;
                            break;
                        } catch (Exception ex) {
                            if (attempt == 1) {
                                log.warn("SMTP attempt 1 failed for {}, retrying in 2s... Reason: {}", contact.email(), ex.getMessage());
                                try { Thread.sleep(2000L); } catch (InterruptedException ignored) {}
                            } else {
                                failed++;
                                log.error("Failed to send email to {}: {}", contact.email(), ex.getMessage());
                            }
                        }
                    }
                } catch (Exception ex) {
                    failed++;
                    log.error("Failed to prepare email for {}: {}", contact.email(), ex.getMessage());
                }

                batchCount++;

                // Safe inter-email pacing (1.5s) to avoid GoDaddy socket resets
                if (emailSent && (i + 1) < recipients.size() && batchCount < batchSize) {
                    try {
                        Thread.sleep(1500L);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }

                // Real-time progress update
                CampaignState progressState = new CampaignState(
                        campaignId, tenant,
                        request.campaignName() != null ? request.campaignName() : "Target Outreach",
                        campaignTarget,
                        request.subject() != null ? request.subject() : "Executive Communication",
                        "SENDING", total, sent, sent, 0, 0, failed, now, null
                );
                campaigns.put(campaignId, progressState);

                // Rate limiting pause: every 25 emails, pause 60 seconds unless this was the last recipient
                if (batchCount >= batchSize && (i + 1) < recipients.size()) {
                    log.info("GoDaddy rate pacing triggered: {} emails sent in current minute. Cooling down for {} seconds before next batch...",
                            batchCount, pauseSeconds);
                    try {
                        Thread.sleep(pauseSeconds * 1000L);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.warn("Campaign {} email dispatch interrupted during cooldown", campaignId);
                        break;
                    }
                    batchCount = 0; // reset for next batch
                }
            }

            String finalStatus = (sent == total && total > 0) ? "COMPLETED" : (sent > 0 ? "PARTIAL" : "FAILED");
            CampaignState finalState = new CampaignState(
                    campaignId, tenant,
                    request.campaignName() != null ? request.campaignName() : "Target Outreach",
                    campaignTarget,
                    request.subject() != null ? request.subject() : "Executive Communication",
                    finalStatus, total, sent, sent, 0, 0, failed, now, Instant.now()
            );
            campaigns.put(campaignId, finalState);
            log.info("Campaign {} finished dispatching. Status: {}, Total: {}, Sent: {}, Failed: {}",
                    campaignId, finalStatus, total, sent, failed);
        });

        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("campaignId", campaignId.toString());
        responseMap.put("campaignName", initialState.campaignName());
        responseMap.put("targetDomain", initialState.targetDomain());
        responseMap.put("status", "SENDING");
        responseMap.put("totalQueued", total);
        responseMap.put("recipientCount", total);
        responseMap.put("sent", 0);
        responseMap.put("batchSize", batchSize);
        responseMap.put("pauseSeconds", pauseSeconds);
        responseMap.put("rateLimitPolicy", "GoDaddy Safe Mode: " + batchSize + " emails/min with " + pauseSeconds + "s pause between batches");
        responseMap.put("dispatchedAt", now.toString());
        if (ccAddresses.length > 0) responseMap.put("cc", ccAddresses);
        if (bccAddresses.length > 0) responseMap.put("bcc", bccAddresses);
        if (mailHost == null || mailHost.isBlank()) {
            responseMap.put("note", "SMTP_HOST not set on server; delivery simulated with rate limiting.");
        }
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(responseMap);
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<?> getStatus(@PathVariable UUID id, JwtAuthenticationToken auth) {
        CampaignState state = campaigns.get(id);
        if (state == null || !state.tenantId().equals(tenantId(auth))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Campaign not found");
        }

        Map<String, Object> map = new HashMap<>();
        map.put("campaignId", state.campaignId().toString());
        map.put("campaignName", state.campaignName());
        map.put("status", state.status());
        map.put("targetDomain", state.targetDomain());
        map.put("totalRecipients", state.totalRecipients());
        map.put("sentCount", state.sentCount());
        map.put("deliveredCount", state.deliveredCount());
        map.put("openedCount", 0);
        map.put("clickedCount", 0);
        map.put("bouncedCount", state.bouncedCount());
        map.put("dispatchedAt", state.dispatchedAt() != null ? state.dispatchedAt().toString() : "");
        map.put("completedAt", state.completedAt() != null ? state.completedAt().toString() : "");
        return ResponseEntity.ok(map);
    }

    private String extractDomainName(String email) {
        if (email == null || !email.contains("@")) return "Team";
        try {
            String domainPart = email.substring(email.indexOf("@") + 1).trim();
            int dotIdx = domainPart.indexOf(".");
            String name = (dotIdx > 0) ? domainPart.substring(0, dotIdx) : domainPart;
            if (name.isBlank() || name.equalsIgnoreCase("gmail") || name.equalsIgnoreCase("yahoo") || name.equalsIgnoreCase("hotmail") || name.equalsIgnoreCase("outlook")) {
                return "Team";
            }
            return Character.toUpperCase(name.charAt(0)) + (name.length() > 1 ? name.substring(1) : "");
        } catch (Exception e) {
            return "Team";
        }
    }

    private String personalizeHtml(String template, MarketingContactResponse contact, String senderName) {
        if (template == null) return "";
        String rawFirst = (contact.firstName() != null && !contact.firstName().isBlank() && !contact.firstName().equals("—")) ? contact.firstName().trim() : "";
        String rawLast = (contact.lastName() != null && !contact.lastName().isBlank() && !contact.lastName().equals("—")) ? contact.lastName().trim() : "";
        String fullName = (rawFirst + (!rawLast.isBlank() ? " " + rawLast : "")).trim();

        String rawComp = (contact.company() != null && !contact.company().isBlank() && !contact.company().equals("—"))
                ? contact.company().trim()
                : (contact.parentOrganization() != null && !contact.parentOrganization().isBlank() && !contact.parentOrganization().equals("—")
                        ? contact.parentOrganization().trim()
                        : "");

        // Smart auto-fallback: if company name is missing, automatically pick contact's personal name!
        String comp;
        if (!rawComp.isBlank()) {
            comp = rawComp;
        } else if (!fullName.isBlank()) {
            comp = fullName;
        } else {
            comp = extractDomainName(contact.email());
        }

        String fName = !rawFirst.isBlank() ? rawFirst : (!rawComp.isBlank() ? rawComp : comp);
        String lName = rawLast;
        String em = (contact.email() != null && !contact.email().isBlank()) ? contact.email().trim() : "";
        String sName = (senderName != null && !senderName.isBlank()) ? senderName.trim() : "Oxygen to Innovation";

        String result = template;
        result = result.replaceAll("(?i)\\{\\{firstName}}", html(fName))
                .replaceAll("(?i)\\{\\{lastName}}", html(lName))
                .replaceAll("(?i)\\{\\{company}}", html(comp))
                .replaceAll("(?i)\\{\\{companyName}}", html(comp))
                .replaceAll("(?i)\\{\\{organization}}", html(comp))
                .replaceAll("(?i)\\{\\{org}}", html(comp))
                .replaceAll("(?i)\\{\\{orgName}}", html(comp))
                .replaceAll("(?i)\\{\\{parentOrganization}}", html(comp))
                .replaceAll("(?i)\\{\\{email}}", html(em))
                .replaceAll("(?i)\\{\\{senderName}}", html(sName));
        return result.replaceAll("\\{\\{[a-zA-Z0-9_]+}}", "");
    }

    private String personalizeSubject(String template, MarketingContactResponse contact, String senderName) {
        if (template == null) return "";
        String rawFirst = (contact.firstName() != null && !contact.firstName().isBlank() && !contact.firstName().equals("—")) ? contact.firstName().trim() : "";
        String rawLast = (contact.lastName() != null && !contact.lastName().isBlank() && !contact.lastName().equals("—")) ? contact.lastName().trim() : "";
        String fullName = (rawFirst + (!rawLast.isBlank() ? " " + rawLast : "")).trim();

        String rawComp = (contact.company() != null && !contact.company().isBlank() && !contact.company().equals("—"))
                ? contact.company().trim()
                : (contact.parentOrganization() != null && !contact.parentOrganization().isBlank() && !contact.parentOrganization().equals("—")
                        ? contact.parentOrganization().trim()
                        : "");

        // Smart auto-fallback: if company name is missing, automatically pick contact's personal name!
        String comp;
        if (!rawComp.isBlank()) {
            comp = rawComp;
        } else if (!fullName.isBlank()) {
            comp = fullName;
        } else {
            comp = extractDomainName(contact.email());
        }

        String fName = !rawFirst.isBlank() ? rawFirst : (!rawComp.isBlank() ? rawComp : comp);
        String lName = rawLast;
        String em = (contact.email() != null && !contact.email().isBlank()) ? contact.email().trim() : "";
        String sName = (senderName != null && !senderName.isBlank()) ? senderName.trim() : "Oxygen to Innovation";

        String result = template;
        result = result.replaceAll("(?i)\\{\\{firstName}}", fName)
                .replaceAll("(?i)\\{\\{lastName}}", lName)
                .replaceAll("(?i)\\{\\{company}}", comp)
                .replaceAll("(?i)\\{\\{companyName}}", comp)
                .replaceAll("(?i)\\{\\{organization}}", comp)
                .replaceAll("(?i)\\{\\{org}}", comp)
                .replaceAll("(?i)\\{\\{orgName}}", comp)
                .replaceAll("(?i)\\{\\{parentOrganization}}", comp)
                .replaceAll("(?i)\\{\\{email}}", em)
                .replaceAll("(?i)\\{\\{senderName}}", sName);
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
