package com.example.agentic_ai_platform.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "dms_tenants")
public class Tenant {
    @Id
    private UUID id;

    @Column(nullable = false, length = 160)
    private String name;

    protected Tenant() {}

    public UUID getId() { return id; }
}
