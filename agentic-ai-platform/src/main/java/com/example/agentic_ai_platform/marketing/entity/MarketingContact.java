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

    @Column(length = 160)
    private String category;

    @Column(length = 160)
    private String type;

    @Column(name = "parent_organization", length = 255)
    private String parentOrganization;

    @Column(name = "site_role", length = 160)
    private String siteRole;

    @Column(length = 80)
    private String phone;

    @Column(length = 255)
    private String address;

    @Column(length = 120)
    private String city;

    @Column(name = "postal_code", length = 40)
    private String postalCode;

    @Column(length = 120)
    private String region;

    @Column(length = 255)
    private String website;

    @Column(name = "contact_check", length = 120)
    private String contactCheck;

    @Column(length = 160)
    private String source;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected MarketingContact() {}

    public MarketingContact(UUID id, UUID tenantId, String email, String firstName, String lastName,
            String company, String title, String industry, String country, BigDecimal annualRevenue,
            String customerStatus, BigDecimal churnProbability) {
        this(id, tenantId, email, firstName, lastName, company, title, industry, country,
                annualRevenue, customerStatus, churnProbability,
                null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    public MarketingContact(UUID id, UUID tenantId, String email, String firstName, String lastName,
            String company, String title, String industry, String country, BigDecimal annualRevenue,
            String customerStatus, BigDecimal churnProbability, String category, String type,
            String parentOrganization, String siteRole, String phone, String address, String city,
            String postalCode, String region, String website, String contactCheck, String source,
            String notes) {
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
        this.category = category;
        this.type = type;
        this.parentOrganization = parentOrganization;
        this.siteRole = siteRole;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.postalCode = postalCode;
        this.region = region;
        this.website = website;
        this.contactCheck = contactCheck;
        this.source = source;
        this.notes = notes;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getTitle() { return title; }
    public String getIndustry() { return industry; }
    public String getCountry() { return country; }
    public BigDecimal getAnnualRevenue() { return annualRevenue; }
    public String getCustomerStatus() { return customerStatus; }
    public void setCustomerStatus(String customerStatus) { this.customerStatus = customerStatus; }
    public BigDecimal getChurnProbability() { return churnProbability; }
    public String getCategory() { return category; }
    public String getType() { return type; }
    public String getParentOrganization() { return parentOrganization; }
    public String getSiteRole() { return siteRole; }
    public String getPhone() { return phone; }
    public String getAddress() { return address; }
    public String getCity() { return city; }
    public String getPostalCode() { return postalCode; }
    public String getRegion() { return region; }
    public String getWebsite() { return website; }
    public String getContactCheck() { return contactCheck; }
    public String getSource() { return source; }
    public String getNotes() { return notes; }
    public Instant getCreatedAt() { return createdAt; }
}
