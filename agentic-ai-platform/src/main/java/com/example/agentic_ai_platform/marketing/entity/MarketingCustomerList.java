package com.example.agentic_ai_platform.marketing.entity;

import com.example.agentic_ai_platform.marketing.dto.CustomerListRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "mkt_customer_lists")
public class MarketingCustomerList {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private int contacts;

    @Column(name = "conversion_rate", nullable = false, precision = 5, scale = 2)
    private java.math.BigDecimal conversionRate;

    @Column(nullable = false, length = 80)
    private String segment;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "ai_generated", nullable = false)
    private boolean aiGenerated;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ManyToMany
    @JoinTable(name = "mkt_customer_list_contacts",
            joinColumns = @JoinColumn(name = "customer_list_id"),
            inverseJoinColumns = @JoinColumn(name = "contact_id"))
    private Set<MarketingContact> members = new HashSet<>();

    protected MarketingCustomerList() {}

    public MarketingCustomerList(UUID id, UUID tenantId, CustomerListRequest request) {
        this.id = id;
        this.tenantId = tenantId;
        this.createdAt = Instant.now();
        updateFrom(request);
    }

    public void updateFrom(CustomerListRequest request) {
        this.name = request.name().trim();
        this.description = request.description().trim();
        this.contacts = request.contacts();
        this.conversionRate = request.conversionRate();
        this.segment = request.segment().trim();
        this.status = request.status();
        this.aiGenerated = request.aiGenerated();
        this.updatedAt = Instant.now();
    }

    public void addMembers(Set<MarketingContact> contacts) {
        this.members.addAll(contacts);
        this.contacts = this.members.size();
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getContacts() { return contacts; }
    public java.math.BigDecimal getConversionRate() { return conversionRate; }
    public String getSegment() { return segment; }
    public String getStatus() { return status; }
    public boolean isAiGenerated() { return aiGenerated; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Set<MarketingContact> getMembers() { return members; }
}
