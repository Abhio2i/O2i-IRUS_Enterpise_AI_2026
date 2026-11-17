package com.example.agentic_ai_platform.auth.dto;

import java.time.Instant;
import java.util.UUID;

public record AuthResponse(String accessToken, String tokenType, Instant accessTokenExpiresAt, String refreshToken,
        UUID userId, UUID tenantId, String email, String displayName) {}
