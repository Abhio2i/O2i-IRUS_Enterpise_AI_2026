package com.example.agentic_ai_platform.marketing.entity;

import com.example.agentic_ai_platform.marketing.dto.Customer360Request;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="mkt_customer_accounts")
public class Customer360Account {
    @Id private UUID id;
    @Column(name="tenant_id", nullable=false) private UUID tenantId;
    @Column(nullable=false,length=200) private String name;
    @Column(length=253) private String domain;
    @Column(length=120) private String industry;
    @Column(nullable=false,length=40) private String tier;
    @Column(name="annual_contract_value",precision=19,scale=2) private java.math.BigDecimal annualContractValue;
    @Column(nullable=false,length=3) private String currency;
    @Column(name="health_score",precision=5,scale=2) private java.math.BigDecimal healthScore;
    @Column(name="churn_probability",precision=5,scale=2) private java.math.BigDecimal churnProbability;
    @Column(name="lead_score",precision=5,scale=2) private java.math.BigDecimal leadScore;
    @Column(name="customer_status",nullable=false,length=40) private String customerStatus;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    @Column(name="updated_at",nullable=false) private Instant updatedAt;
    protected Customer360Account() {}
    public Customer360Account(UUID id, UUID tenantId, Customer360Request r) { this.id=id; this.tenantId=tenantId; this.createdAt=Instant.now(); update(r); }
    public void update(Customer360Request r) { name=r.name().trim(); domain=r.domain(); industry=r.industry(); tier=r.tier(); annualContractValue=r.annualContractValue(); currency=r.currency(); healthScore=r.healthScore(); churnProbability=r.churnProbability(); leadScore=r.leadScore(); customerStatus=r.customerStatus(); updatedAt=Instant.now(); }
    public UUID getId(){return id;} public UUID getTenantId(){return tenantId;} public String getName(){return name;} public String getDomain(){return domain;} public String getIndustry(){return industry;} public String getTier(){return tier;} public java.math.BigDecimal getAnnualContractValue(){return annualContractValue;} public String getCurrency(){return currency;} public java.math.BigDecimal getHealthScore(){return healthScore;} public java.math.BigDecimal getChurnProbability(){return churnProbability;} public java.math.BigDecimal getLeadScore(){return leadScore;} public String getCustomerStatus(){return customerStatus;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
}
