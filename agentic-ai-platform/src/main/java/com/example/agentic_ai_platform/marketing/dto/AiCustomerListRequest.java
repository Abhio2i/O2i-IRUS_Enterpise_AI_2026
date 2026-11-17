package com.example.agentic_ai_platform.marketing.dto;

import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AiCustomerListRequest(
        @jakarta.validation.constraints.NotBlank @Size(min = 5, max = 1000) String prompt,
        @Size(max = 160) String name,
        UUID sourceListId) {
    public AiCustomerListRequest(String prompt, String name) { this(prompt, name, null); }
}
