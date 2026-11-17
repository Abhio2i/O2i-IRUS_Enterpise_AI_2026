package com.example.agentic_ai_platform.marketing.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name="mkt_proposals")
public class MarketingProposal {
    @Id private UUID id;
    @Column(name="tenant_id", nullable=false) private UUID tenantId;
    @Column(name="client_company", nullable=false) private String clientCompany;
    @Column(name="contact_name", nullable=false) private String contactName;
    @Column(name="contact_email", nullable=false) private String contactEmail;
    @Column(nullable=false) private String industry;
    @Column(name="use_case", nullable=false, length=1000) private String useCase;
    @Column(name="services_json", nullable=false, columnDefinition="TEXT") private String servicesJson;
    @Column(nullable=false, precision=15, scale=2) private BigDecimal budget;
    @Column(nullable=false) private String timeline;
    @Column(name="content_json", nullable=false, columnDefinition="LONGTEXT") private String contentJson;
    @Column(nullable=false) private String status;
    @Column(name="win_probability", nullable=false) private int winProbability;
    @Column(name="next_action") private String nextAction;
    @Column(name="follow_up_date") private LocalDate followUpDate;
    @Column(name="sent_at") private Instant sentAt;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    @Column(name="updated_at", nullable=false) private Instant updatedAt;
    protected MarketingProposal() {}
    public MarketingProposal(UUID id, UUID tenantId, String company, String name, String email, String industry, String useCase, String servicesJson, BigDecimal budget, String timeline, String contentJson) {
        this(id, tenantId, company, name, email, industry, useCase, servicesJson, budget, timeline, contentJson, "DRAFT", 25);
    }
    public MarketingProposal(UUID id, UUID tenantId, String company, String name, String email, String industry, String useCase, String servicesJson, BigDecimal budget, String timeline, String contentJson, String status, int winProbability) {
        this.id=id; this.tenantId=tenantId; this.clientCompany=company; this.contactName=name; this.contactEmail=email; this.industry=industry; this.useCase=useCase; this.servicesJson=servicesJson; this.budget=budget; this.timeline=timeline; this.contentJson=contentJson;
        this.status = (status != null && !status.isBlank()) ? status.trim().toUpperCase() : "ACTIVE";
        this.winProbability = winProbability > 0 ? winProbability : ("ACTIVE".equalsIgnoreCase(this.status) ? 60 : 25);
        this.createdAt=Instant.now(); this.updatedAt=this.createdAt;
    }
    public UUID getId(){return id;} public UUID getTenantId(){return tenantId;} public String getClientCompany(){return clientCompany;} public String getContactName(){return contactName;} public String getContactEmail(){return contactEmail;} public String getIndustry(){return industry;} public String getUseCase(){return useCase;} public String getServicesJson(){return servicesJson;} public BigDecimal getBudget(){return budget;} public String getTimeline(){return timeline;} public String getContentJson(){return contentJson;} public String getStatus(){return status;} public int getWinProbability(){return winProbability;} public String getNextAction(){return nextAction;} public LocalDate getFollowUpDate(){return followUpDate;} public Instant getSentAt(){return sentAt;} public Instant getUpdatedAt(){return updatedAt;}
    public void setStatus(String status){if(status!=null&&!status.isBlank()){this.status=status.trim().toUpperCase();this.updatedAt=Instant.now();}}
    public void update(String contentJson, String status, int probability, String action, LocalDate followUp){this.contentJson=contentJson; if(status!=null)this.status=status; this.winProbability=probability; this.nextAction=action; this.followUpDate=followUp; this.updatedAt=Instant.now();}
    public void markSent(){this.status="SENT";this.sentAt=Instant.now();this.updatedAt=this.sentAt;}
}
