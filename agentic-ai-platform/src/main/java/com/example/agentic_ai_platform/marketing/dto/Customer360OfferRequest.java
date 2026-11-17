package com.example.agentic_ai_platform.marketing.dto;
import jakarta.validation.constraints.*;
public record Customer360OfferRequest(@NotBlank @Size(max=200) String title,@Size(max=1000) String rationale,@NotBlank @Pattern(regexp="UPSELL|CROSS_SELL|RETENTION|OTHER") String offerType,@NotBlank @Pattern(regexp="RECOMMENDED|ACCEPTED|DECLINED|EXPIRED") String status) {}
