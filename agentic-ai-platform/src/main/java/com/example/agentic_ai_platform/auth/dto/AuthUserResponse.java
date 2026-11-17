package com.example.agentic_ai_platform.auth.dto;

import java.util.UUID;

public record AuthUserResponse(UUID userId, UUID tenantId, String email, String displayName,
        String accessToken, String tokenType, java.time.Instant accessTokenExpiresAt, String refreshToken) {
    public static AuthUserResponse from(AuthResponse response) {
        return new AuthUserResponse(response.userId(), response.tenantId(), response.email(), response.displayName(),
                response.accessToken(), response.tokenType(), response.accessTokenExpiresAt(), response.refreshToken());
    }
}
