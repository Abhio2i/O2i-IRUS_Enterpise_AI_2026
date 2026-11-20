package com.example.agentic_ai_platform.marketing.repository;

import com.example.agentic_ai_platform.marketing.entity.MarketingCampaignEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketingCampaignEventRepository extends JpaRepository<MarketingCampaignEvent, UUID> {
    long countByTenantIdAndEventType(UUID tenantId, String eventType);

    long countByTenantIdAndCampaignIdAndEventType(UUID tenantId, UUID campaignId, String eventType);

    @Query("SELECT COUNT(DISTINCT e.contactEmail) FROM MarketingCampaignEvent e WHERE e.tenantId = :tenantId AND e.eventType = :eventType")
    long countUniqueRecipientsByEventType(@Param("tenantId") UUID tenantId, @Param("eventType") String eventType);

    @Query("SELECT COUNT(DISTINCT e.contactEmail) FROM MarketingCampaignEvent e WHERE e.tenantId = :tenantId AND e.campaignId = :campaignId AND e.eventType = :eventType")
    long countUniqueRecipientsByCampaignAndEventType(@Param("tenantId") UUID tenantId, @Param("campaignId") UUID campaignId, @Param("eventType") String eventType);

    List<MarketingCampaignEvent> findAllByTenantIdOrderByCreatedAtDesc(UUID tenantId);

    List<MarketingCampaignEvent> findAllByTenantIdAndCampaignIdOrderByCreatedAtDesc(UUID tenantId, UUID campaignId);
}
