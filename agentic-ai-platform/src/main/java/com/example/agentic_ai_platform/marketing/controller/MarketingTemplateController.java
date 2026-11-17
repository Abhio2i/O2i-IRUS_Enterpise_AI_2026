package com.example.agentic_ai_platform.marketing.controller;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/marketing/templates")
public class MarketingTemplateController {
    public record TemplateRecord(
            UUID id,
            UUID tenantId,
            String name,
            String subject,
            String contentHtml,
            String contentText,
            String industry,
            String tone,
            Instant createdAt
    ) {}

    public record CreateTemplateRequest(
            String name,
            String subject,
            String contentHtml,
            String contentText,
            String industry,
            String tone
    ) {}

    private final Map<UUID, TemplateRecord> templates = new ConcurrentHashMap<>();

    public MarketingTemplateController() {
        // Pre-seed some default enterprise templates
        UUID defaultId1 = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID defaultId2 = UUID.fromString("00000000-0000-0000-0000-000000000002");
        templates.put(defaultId1, new TemplateRecord(
                defaultId1,
                null,
                "Automotive Executive Outreach",
                "Optimising Supply Chain Latency",
                "<p>Hi {{firstName}},</p><p>For {{company}}, accelerating manufacturing cycles and reducing ERP data latency is mission-critical.</p><p>We would love to share a 10-minute briefing tailored to your team.</p>",
                "Hi {{firstName}},\n\nFor {{company}}, accelerating manufacturing cycles and reducing ERP data latency is mission-critical.\n\nWe would love to share a 10-minute briefing tailored to your team.",
                "Automotive",
                "EXECUTIVE",
                Instant.now()
        ));
        templates.put(defaultId2, new TemplateRecord(
                defaultId2,
                null,
                "Technology & Cloud Modernization",
                "Scalable Architecture Assessment",
                "<p>Hi {{firstName}},</p><p>Exploring modernized microservices architecture for {{company}}.</p><p>Let's connect for an engineering sync.</p>",
                "Hi {{firstName}},\n\nExploring modernized microservices architecture for {{company}}.\n\nLet's connect for an engineering sync.",
                "Technology",
                "TECHNICAL",
                Instant.now()
        ));
    }

    @GetMapping
    public List<TemplateRecord> list(JwtAuthenticationToken auth) {
        UUID tenant = tenantId(auth);
        return templates.values().stream()
                .filter(t -> t.tenantId() == null || t.tenantId().equals(tenant))
                .sorted(Comparator.comparing(TemplateRecord::createdAt).reversed())
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TemplateRecord create(@RequestBody CreateTemplateRequest request, JwtAuthenticationToken auth) {
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Template name is required");
        }
        UUID tenant = tenantId(auth);
        UUID id = UUID.randomUUID();
        TemplateRecord record = new TemplateRecord(
                id,
                tenant,
                request.name(),
                request.subject() != null ? request.subject() : "",
                request.contentHtml() != null ? request.contentHtml() : "",
                request.contentText() != null ? request.contentText() : "",
                request.industry() != null ? request.industry() : "All",
                request.tone() != null ? request.tone() : "PROFESSIONAL",
                Instant.now()
        );
        templates.put(id, record);
        return record;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id, JwtAuthenticationToken auth) {
        UUID tenant = tenantId(auth);
        TemplateRecord record = templates.get(id);
        if (record != null && (record.tenantId() == null || record.tenantId().equals(tenant))) {
            templates.remove(id);
        }
    }

    private UUID tenantId(JwtAuthenticationToken auth) {
        try {
            return UUID.fromString(auth.getToken().getClaimAsString("tenant_id"));
        } catch (RuntimeException exception) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token has no valid tenant_id claim");
        }
    }
}

