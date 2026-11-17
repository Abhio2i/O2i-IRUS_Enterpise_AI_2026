package com.example.agentic_ai_platform.marketing.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CustomerListRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 1000) String description,
        @NotNull @PositiveOrZero Integer contacts,
        @NotNull @DecimalMin("0.00") @DecimalMax("100.00") @Digits(integer = 3, fraction = 2) BigDecimal conversionRate,
        @NotBlank @Size(max = 80) String segment,
        @NotBlank @Pattern(regexp = "ACTIVE|BUILDING") String status,
        boolean aiGenerated) {}
