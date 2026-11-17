package com.example.agentic_ai_platform.marketing.dto;
import jakarta.validation.constraints.*;
public record SeoKeywordRequest(@NotBlank @Size(max=255) String keyword,@Size(max=2048) String targetPage,@PositiveOrZero Integer searchVolume,@Min(0) @Max(100) Integer difficulty,@NotBlank @Pattern(regexp="INFORMATIONAL|NAVIGATIONAL|COMMERCIAL|TRANSACTIONAL") String intent) {}
