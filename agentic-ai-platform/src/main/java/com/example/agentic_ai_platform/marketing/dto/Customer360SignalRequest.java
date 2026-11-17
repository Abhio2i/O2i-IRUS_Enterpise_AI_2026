package com.example.agentic_ai_platform.marketing.dto;
import jakarta.validation.constraints.*;
import java.time.Instant;
public record Customer360SignalRequest(@NotBlank @Pattern(regexp="USAGE|ENGAGEMENT|SUPPORT|DOCUMENT|OTHER") String signalType,@NotBlank @Size(max=1000) String description,@Size(max=80) String source,Instant observedAt) {}
