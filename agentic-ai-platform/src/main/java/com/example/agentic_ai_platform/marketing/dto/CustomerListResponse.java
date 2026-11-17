package com.example.agentic_ai_platform.marketing.dto;

import com.example.agentic_ai_platform.marketing.entity.MarketingCustomerList;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CustomerListResponse(
        UUID id,
        String name,
        String description,
        int contacts,
        BigDecimal conversionRate,
        String segment,
        String status,
        boolean aiGenerated,
        Instant createdAt,
        Instant updatedAt) {

    public static CustomerListResponse from(MarketingCustomerList customerList) {
        return new CustomerListResponse(
                customerList.getId(),
                customerList.getName(),
                customerList.getDescription(),
                customerList.getContacts(),
                customerList.getConversionRate(),
                customerList.getSegment(),
                customerList.getStatus(),
                customerList.isAiGenerated(),
                customerList.getCreatedAt(),
                customerList.getUpdatedAt());
    }
}
