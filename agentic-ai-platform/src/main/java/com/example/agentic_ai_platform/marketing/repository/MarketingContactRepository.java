package com.example.agentic_ai_platform.marketing.repository;

import com.example.agentic_ai_platform.marketing.entity.MarketingContact;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MarketingContactRepository extends JpaRepository<MarketingContact, UUID> {
    List<MarketingContact> findAllByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    Optional<MarketingContact> findByTenantIdAndEmail(UUID tenantId, String email);
    boolean existsByTenantIdAndEmail(UUID tenantId, String email);
    List<MarketingContact> findAllByTenantIdAndIdIn(UUID tenantId, List<UUID> ids);

    @Modifying
    @Query("DELETE FROM MarketingContact c WHERE c.tenantId = :tenantId")
    void deleteAllByTenantId(@Param("tenantId") UUID tenantId);

    @Modifying
    @Query("DELETE FROM MarketingContact c WHERE c.tenantId = :tenantId AND c.id = :id")
    void deleteByTenantIdAndId(@Param("tenantId") UUID tenantId, @Param("id") UUID id);
}
