package com.example.agentic_ai_platform.auth.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.agentic_ai_platform.auth.entity.PlatformUser;

public interface PlatformUserRepository extends JpaRepository<PlatformUser, UUID> {
    Optional<PlatformUser> findByTenantIdAndEmail(UUID tenantId, String email);
    boolean existsByTenantIdAndEmail(UUID tenantId, String email);
}
