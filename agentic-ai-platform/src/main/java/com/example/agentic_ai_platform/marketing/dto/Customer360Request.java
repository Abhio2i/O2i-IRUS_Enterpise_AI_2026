package com.example.agentic_ai_platform.marketing.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record Customer360Request(
        @NotBlank @Size(max=200) String name,
        @Size(max=253) String domain,
        @Size(max=120) String industry,
        @NotBlank @Pattern(regexp="TIER_1|MID_MARKET|GROWTH|OTHER") String tier,
        @DecimalMin("0") @Digits(integer=17, fraction=2) BigDecimal annualContractValue,
        @NotBlank @Pattern(regexp="[A-Z]{3}") String currency,
        @DecimalMin("0") @DecimalMax("100") @Digits(integer=3, fraction=2) BigDecimal healthScore,
        @DecimalMin("0") @DecimalMax("100") @Digits(integer=3, fraction=2) BigDecimal churnProbability,
        @DecimalMin("0") @DecimalMax("100") @Digits(integer=3, fraction=2) BigDecimal leadScore,
        @NotBlank @Pattern(regexp="ACTIVE|AT_RISK|CHURNED|PROSPECT") String customerStatus) {}
