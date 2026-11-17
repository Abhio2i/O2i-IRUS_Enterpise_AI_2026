package com.example.agentic_ai_platform.marketing.repository;

import com.example.agentic_ai_platform.marketing.entity.MarketingContact;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketingContactRepository extends JpaRepository<MarketingContact, UUID> {
    List<MarketingContact> findAllByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    Optional<MarketingContact> findByTenantIdAndEmail(UUID tenantId, String email);
    boolean existsByTenantIdAndEmail(UUID tenantId, String email);
    List<MarketingContact> findAllByTenantIdAndIdIn(UUID tenantId, List<UUID> ids);
}
