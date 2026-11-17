package com.example.agentic_ai_platform.auth.dto;

import java.util.UUID;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthRequests {
    private AuthRequests() {}

    public record Register(@NotNull UUID tenantId, @Email @NotBlank @Size(max = 320) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(max = 160) String displayName) {}

    public record Login(@NotNull UUID tenantId, @Email @NotBlank @Size(max = 320) String email,
            @NotBlank String password) {}

}
