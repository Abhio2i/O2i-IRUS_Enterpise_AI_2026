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
        Instant createdAt) {

    public static MarketingContactResponse from(MarketingContact contact) {
        return new MarketingContactResponse(contact.getId(), contact.getEmail(), contact.getFirstName(),
                contact.getLastName(), contact.getCompany(), contact.getTitle(), contact.getIndustry(),
                contact.getCountry(), contact.getAnnualRevenue(), contact.getCustomerStatus(),
                contact.getChurnProbability(), contact.getCreatedAt());
    }
}
