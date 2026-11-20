package com.example.agentic_ai_platform.marketing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mkt_campaign_replies")
public class MarketingCampaignReply {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "campaign_id")
    private UUID campaignId;

    @Column(name = "contact_id")
    private UUID contactId;

    @Column(name = "sender_email", nullable = false, length = 320)
    private String senderEmail;

    @Column(name = "sender_name", length = 200)
    private String senderName;

    @Column(name = "recipient_email", nullable = false, length = 320)
    private String recipientEmail;

    @Column(length = 500)
    private String subject;

    @Column(length = 1000)
    private String snippet;

    @Column(name = "body_text", columnDefinition = "LONGTEXT")
    private String bodyText;

    @Column(name = "body_html", columnDefinition = "LONGTEXT")
    private String bodyHtml;

    @Column(name = "message_id", length = 255)
    private String messageId;

    @Column(name = "in_reply_to", length = 255)
    private String inReplyTo;

    @Column(name = "school_name", length = 200)
    private String schoolName;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public MarketingCampaignReply() {}

    public MarketingCampaignReply(UUID id, UUID tenantId, UUID campaignId, UUID contactId,
                                  String senderEmail, String senderName, String recipientEmail,
                                  String subject, String snippet, String bodyText, String bodyHtml,
                                  String messageId, String inReplyTo, String schoolName, Instant receivedAt) {
        this.id = id != null ? id : UUID.randomUUID();
        this.tenantId = tenantId;
        this.campaignId = campaignId;
        this.contactId = contactId;
        this.senderEmail = senderEmail != null ? senderEmail.toLowerCase().trim() : "";
        this.senderName = senderName;
        this.recipientEmail = recipientEmail != null ? recipientEmail.toLowerCase().trim() : "";
        this.subject = subject;
        this.snippet = snippet;
        this.bodyText = bodyText;
        this.bodyHtml = bodyHtml;
        this.messageId = messageId;
        this.inReplyTo = inReplyTo;
        this.schoolName = schoolName;
        this.isRead = false;
        this.receivedAt = receivedAt != null ? receivedAt : Instant.now();
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public UUID getCampaignId() { return campaignId; }
    public UUID getContactId() { return contactId; }
    public String getSenderEmail() { return senderEmail; }
    public String getSenderName() { return senderName; }
    public String getRecipientEmail() { return recipientEmail; }
    public String getSubject() { return subject; }
    public String getSnippet() { return snippet; }
    public String getBodyText() { return bodyText; }
    public String getBodyHtml() { return bodyHtml; }
    public String getMessageId() { return messageId; }
    public String getInReplyTo() { return inReplyTo; }
    public String getSchoolName() { return schoolName; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }
    public Instant getReceivedAt() { return receivedAt; }
    public Instant getCreatedAt() { return createdAt; }
}
