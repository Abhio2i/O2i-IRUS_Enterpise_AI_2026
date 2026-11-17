package com.example.agentic_ai_platform.auth.repository;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.agentic_ai_platform.auth.entity.Tenant;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {}
