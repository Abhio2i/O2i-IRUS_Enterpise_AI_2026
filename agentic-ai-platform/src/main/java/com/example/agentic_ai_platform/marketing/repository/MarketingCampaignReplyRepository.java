package com.example.agentic_ai_platform.marketing.repository;

import com.example.agentic_ai_platform.marketing.entity.MarketingCampaignReply;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MarketingCampaignReplyRepository extends JpaRepository<MarketingCampaignReply, UUID> {
    long countByTenantId(UUID tenantId);

    long countByTenantIdAndIsReadFalse(UUID tenantId);

    boolean existsByTenantIdAndMessageId(UUID tenantId, String messageId);

    List<MarketingCampaignReply> findAllByTenantIdOrderByReceivedAtDesc(UUID tenantId);

    List<MarketingCampaignReply> findAllByTenantIdAndCampaignIdOrderByReceivedAtDesc(UUID tenantId, UUID campaignId);

    Optional<MarketingCampaignReply> findByTenantIdAndId(UUID tenantId, UUID id);
}
