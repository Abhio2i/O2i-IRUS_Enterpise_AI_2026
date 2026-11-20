package com.example.agentic_ai_platform.marketing.controller;

import com.example.agentic_ai_platform.marketing.entity.MarketingCampaignEvent;
import com.example.agentic_ai_platform.marketing.entity.MarketingCampaignReply;
import com.example.agentic_ai_platform.marketing.repository.MarketingCampaignEventRepository;
import com.example.agentic_ai_platform.marketing.repository.MarketingCampaignReplyRepository;
import com.example.agentic_ai_platform.marketing.service.EmailReplySyncService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class EmailTrackingController {
    private static final Logger log = LoggerFactory.getLogger(EmailTrackingController.class);

    // Standard 43-byte transparent 1x1 GIF
    private static final byte[] TRANSPARENT_1X1_GIF = Base64.getDecoder().decode(
            "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
    );

    private final MarketingCampaignEventRepository eventRepository;
    private final MarketingCampaignReplyRepository replyRepository;
    private final EmailReplySyncService replySyncService;

    public EmailTrackingController(MarketingCampaignEventRepository eventRepository,
                                   MarketingCampaignReplyRepository replyRepository,
                                   EmailReplySyncService replySyncService) {
        this.eventRepository = eventRepository;
        this.replyRepository = replyRepository;
        this.replySyncService = replySyncService;
    }

    /**
     * 1. Public 1x1 Open Tracking Pixel endpoint
     */
    @GetMapping(value = "/api/public/track/open/{campaignId}/{encodedEmail}.png", produces = "image/gif")
    public ResponseEntity<byte[]> trackOpen(
            @PathVariable String campaignId,
            @PathVariable String encodedEmail,
            HttpServletRequest request) {

        try {
            String email = decodeEmail(encodedEmail);
            UUID cId = null;
            try {
                cId = UUID.fromString(campaignId);
            } catch (Exception ignored) {}

            String ip = extractClientIp(request);
            String userAgent = request.getHeader("User-Agent");

            // Default local tenant ID if not resolved from context
            UUID tenantId = UUID.fromString("11111111-1111-1111-1111-111111111111");

            MarketingCampaignEvent event = new MarketingCampaignEvent(
                    UUID.randomUUID(), tenantId, cId, email, "OPEN", null, ip, userAgent
            );
            eventRepository.save(event);
            log.info("Recorded email OPEN event: email={}, campaignId={}, ip={}", email, campaignId, ip);
        } catch (Exception e) {
            log.warn("Failed to record open tracking event: {}", e.getMessage());
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("image/gif"));
        headers.setCacheControl("no-cache, no-store, must-revalidate, max-age=0");
        headers.setPragma("no-cache");
        headers.setExpires(0L);

        return new ResponseEntity<>(TRANSPARENT_1X1_GIF, headers, HttpStatus.OK);
    }

    /**
     * 2. Public Link Click Tracking Redirect endpoint
     */
    @GetMapping("/api/public/track/click")
    public ResponseEntity<Void> trackClick(
            @RequestParam(name = "c", required = false) String campaignId,
            @RequestParam(name = "e", required = false) String encodedEmail,
            @RequestParam(name = "url") String targetUrl,
            HttpServletRequest request,
            HttpServletResponse response) {

        try {
            String email = decodeEmail(encodedEmail);
            UUID cId = null;
            try {
                if (campaignId != null) cId = UUID.fromString(campaignId);
            } catch (Exception ignored) {}

            String ip = extractClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            UUID tenantId = UUID.fromString("11111111-1111-1111-1111-111111111111");

            MarketingCampaignEvent event = new MarketingCampaignEvent(
                    UUID.randomUUID(), tenantId, cId, email, "CLICK", targetUrl, ip, userAgent
            );
            eventRepository.save(event);
            log.info("Recorded email CLICK event: email={}, url={}, campaignId={}", email, targetUrl, campaignId);
        } catch (Exception e) {
            log.warn("Failed to record click tracking event: {}", e.getMessage());
        }

        String safeUrl = (targetUrl != null && !targetUrl.isBlank()) ? targetUrl : "https://www.o2i.tech";
        if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
            safeUrl = "https://" + safeUrl;
        }

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(safeUrl))
                .build();
    }

    /**
     * 3. Authenticated: List synchronized replies
     */
    @GetMapping("/api/marketing/replies")
    public ResponseEntity<Map<String, Object>> listReplies(JwtAuthenticationToken auth) {
        UUID tenantId = tenantId(auth);
        List<MarketingCampaignReply> replies = replyRepository.findAllByTenantIdOrderByReceivedAtDesc(tenantId);
        long unreadCount = replyRepository.countByTenantIdAndIsReadFalse(tenantId);

        Map<String, Object> resp = new HashMap<>();
        resp.put("replies", replies);
        resp.put("totalReplies", replies.size());
        resp.put("unreadReplies", unreadCount);
        return ResponseEntity.ok(resp);
    }

    /**
     * 4. Authenticated: Trigger IMAP sync on demand
     */
    @PostMapping("/api/marketing/replies/sync")
    public ResponseEntity<Map<String, Object>> syncReplies(JwtAuthenticationToken auth) {
        UUID tenantId = tenantId(auth);
        Map<String, Object> syncResult = replySyncService.syncReplies(tenantId);
        return ResponseEntity.ok(syncResult);
    }

    /**
     * 5. Authenticated: Mark reply as read
     */
    @PatchMapping("/api/marketing/replies/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id, JwtAuthenticationToken auth) {
        UUID tenantId = tenantId(auth);
        MarketingCampaignReply reply = replyRepository.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reply not found"));
        reply.setRead(true);
        replyRepository.save(reply);
        return ResponseEntity.noContent().build();
    }

    /**
     * 6. Authenticated: Summary of tracking events
     */
    @GetMapping("/api/marketing/tracking/summary")
    public ResponseEntity<Map<String, Object>> trackingSummary(JwtAuthenticationToken auth) {
        UUID tenantId = tenantId(auth);
        long totalOpens = eventRepository.countByTenantIdAndEventType(tenantId, "OPEN");
        long uniqueOpens = eventRepository.countUniqueRecipientsByEventType(tenantId, "OPEN");
        long totalClicks = eventRepository.countByTenantIdAndEventType(tenantId, "CLICK");
        long uniqueClicks = eventRepository.countUniqueRecipientsByEventType(tenantId, "CLICK");
        long totalReplies = replyRepository.countByTenantId(tenantId);
        long unreadReplies = replyRepository.countByTenantIdAndIsReadFalse(tenantId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalOpens", totalOpens);
        summary.put("uniqueOpens", uniqueOpens);
        summary.put("totalClicks", totalClicks);
        summary.put("uniqueClicks", uniqueClicks);
        summary.put("totalReplies", totalReplies);
        summary.put("unreadReplies", unreadReplies);
        return ResponseEntity.ok(summary);
    }

    /**
     * 7. Authenticated: Recent tracking events (Opens & Clicks live stream)
     */
    @GetMapping("/api/marketing/tracking/events")
    public ResponseEntity<List<MarketingCampaignEvent>> getTrackingEvents(JwtAuthenticationToken auth) {
        UUID tenantId = tenantId(auth);
        List<MarketingCampaignEvent> events = eventRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId);
        return ResponseEntity.ok(events);
    }

    private String decodeEmail(String encoded) {
        if (encoded == null || encoded.isBlank()) return "unknown@recipient.com";
        try {
            // handle base64 URL safe or regular
            String clean = encoded.replace("-", "+").replace("_", "/");
            while (clean.length() % 4 != 0) clean += "=";
            return new String(Base64.getDecoder().decode(clean), StandardCharsets.UTF_8).trim();
        } catch (Exception e) {
            return encoded.trim();
        }
    }

    private String extractClientIp(HttpServletRequest req) {
        String xf = req.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }

    private UUID tenantId(JwtAuthenticationToken auth) {
        try {
            return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim");
        }
    }
}
