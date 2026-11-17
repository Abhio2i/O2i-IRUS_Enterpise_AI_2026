package com.example.agentic_ai_platform.marketing.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record Customer360Response(UUID id, String name, String domain, String industry, String tier,
        BigDecimal annualContractValue, String currency, BigDecimal healthScore, String healthBand,
        BigDecimal churnProbability, String churnBand, BigDecimal leadScore, String customerStatus,
        Instant createdAt, Instant updatedAt) {}
