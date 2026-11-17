package com.example.agentic_ai_platform.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "iam_refresh_sessions")
public class RefreshSession {
    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected RefreshSession() {}

    public RefreshSession(UUID id, UUID userId, String tokenHash, Instant expiresAt) {
        this.id = id;
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public boolean isValidAt(Instant now) { return revokedAt == null && expiresAt.isAfter(now); }
    public void rotate(String newTokenHash, Instant newExpiry) {
        tokenHash = newTokenHash;
        expiresAt = newExpiry;
    }
    public void revoke(Instant now) { revokedAt = now; }
}
