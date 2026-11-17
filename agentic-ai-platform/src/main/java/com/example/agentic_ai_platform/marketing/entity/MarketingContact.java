package com.example.agentic_ai_platform.marketing.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "mkt_contacts", uniqueConstraints = @UniqueConstraint(
        name = "uq_mkt_contacts_tenant_email", columnNames = {"tenant_id", "email"}))
public class MarketingContact {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(name = "first_name", length = 120)
    private String firstName;

    @Column(name = "last_name", length = 120)
    private String lastName;

    @Column(length = 200)
    private String company;

    @Column(length = 160)
    private String title;

    @Column(length = 120)
    private String industry;

    @Column(length = 120)
    private String country;

    @Column(name = "annual_revenue", precision = 19, scale = 2)
    private BigDecimal annualRevenue;

    @Column(name = "customer_status", length = 80)
    private String customerStatus;

    @Column(name = "churn_probability", precision = 5, scale = 2)
    private BigDecimal churnProbability;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected MarketingContact() {}

    public MarketingContact(UUID id, UUID tenantId, String email, String firstName, String lastName,
            String company, String title, String industry, String country, BigDecimal annualRevenue,
            String customerStatus, BigDecimal churnProbability) {
        this.id = id;
        this.tenantId = tenantId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.company = company;
        this.title = title;
        this.industry = industry;
        this.country = country;
        this.annualRevenue = annualRevenue;
        this.customerStatus = customerStatus;
        this.churnProbability = churnProbability;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getCompany() { return company; }
    public String getTitle() { return title; }
    public String getIndustry() { return industry; }
    public String getCountry() { return country; }
    public BigDecimal getAnnualRevenue() { return annualRevenue; }
    public String getCustomerStatus() { return customerStatus; }
    public BigDecimal getChurnProbability() { return churnProbability; }
    public Instant getCreatedAt() { return createdAt; }
}
