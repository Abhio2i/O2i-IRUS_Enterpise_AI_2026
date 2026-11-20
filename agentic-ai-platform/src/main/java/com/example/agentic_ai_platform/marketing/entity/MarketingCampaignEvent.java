package com.example.agentic_ai_platform.marketing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mkt_campaign_events")
public class MarketingCampaignEvent {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "campaign_id")
    private UUID campaignId;

    @Column(name = "contact_email", nullable = false, length = 320)
    private String contactEmail;

    @Column(name = "event_type", nullable = false, length = 32)
    private String eventType; // OPEN, CLICK

    @Column(name = "target_url", length = 1000)
    private String targetUrl;

    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public MarketingCampaignEvent() {}

    public MarketingCampaignEvent(UUID id, UUID tenantId, UUID campaignId, String contactEmail,
                                  String eventType, String targetUrl, String ipAddress, String userAgent) {
        this.id = id != null ? id : UUID.randomUUID();
        this.tenantId = tenantId;
        this.campaignId = campaignId;
        this.contactEmail = contactEmail != null ? contactEmail.toLowerCase().trim() : "";
        this.eventType = eventType;
        this.targetUrl = targetUrl;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getCampaignId() { return campaignId; }
    public String getContactEmail() { return contactEmail; }
    public String getEventType() { return eventType; }
    public String getTargetUrl() { return targetUrl; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public Instant getCreatedAt() { return createdAt; }
}
