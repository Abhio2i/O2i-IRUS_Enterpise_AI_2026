package com.example.agentic_ai_platform.marketing.dto;

import com.example.agentic_ai_platform.marketing.entity.MarketingContact;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MarketingContactResponse(
        UUID id,
        String email,
        String firstName,
        String lastName,
        String company,
        String title,
        String industry,
        String country,
        BigDecimal annualRevenue,
        String customerStatus,
        BigDecimal churnProbability,
        String category,
        String type,
        String parentOrganization,
        String siteRole,
        String phone,
        String address,
        String city,
        String postalCode,
        String region,
        String website,
        String contactCheck,
        String source,
        String notes,
        Instant createdAt) {

    public MarketingContactResponse(UUID id, String email, String firstName, String lastName,
            String company, String title, String industry, String country, BigDecimal annualRevenue,
            String customerStatus, BigDecimal churnProbability, Instant createdAt) {
        this(id, email, firstName, lastName, company, title, industry, country, annualRevenue,
                customerStatus, churnProbability, null, null, null, null, null, null, null, null,
                null, null, null, null, null, createdAt);
    }

    public static MarketingContactResponse from(MarketingContact contact) {
        return new MarketingContactResponse(
                contact.getId(), contact.getEmail(), contact.getFirstName(), contact.getLastName(),
                contact.getCompany(), contact.getTitle(), contact.getIndustry(), contact.getCountry(),
                contact.getAnnualRevenue(), contact.getCustomerStatus(), contact.getChurnProbability(),
                contact.getCategory(), contact.getType(), contact.getParentOrganization(),
                contact.getSiteRole(), contact.getPhone(), contact.getAddress(), contact.getCity(),
                contact.getPostalCode(), contact.getRegion(), contact.getWebsite(),
                contact.getContactCheck(), contact.getSource(), contact.getNotes(),
                contact.getCreatedAt());
    }
}
