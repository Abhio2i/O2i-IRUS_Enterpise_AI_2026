package com.example.agentic_ai_platform.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "iam_users")
public class PlatformUser {
    @Id
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(name = "display_name", nullable = false, length = 160)
    private String displayName;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(nullable = false, length = 32)
    private String role;

    @Column(nullable = false)
    private boolean enabled;

    protected PlatformUser() {}

    public PlatformUser(UUID id, UUID tenantId, String email, String displayName, String passwordHash) {
        this.id = id;
        this.tenantId = tenantId;
        this.email = email;
        this.displayName = displayName;
        this.passwordHash = passwordHash;
        this.role = "USER";
        this.enabled = true;
    }

    public UUID getId() { return id; }
    public UUID getTenantId() { return tenantId; }
    public String getEmail() { return email; }
    public String getDisplayName() { return displayName; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public boolean isEnabled() { return enabled; }
}
