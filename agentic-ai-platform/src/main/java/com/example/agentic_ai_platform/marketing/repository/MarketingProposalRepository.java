package com.example.agentic_ai_platform.marketing.repository;
import com.example.agentic_ai_platform.marketing.entity.MarketingProposal;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MarketingProposalRepository extends JpaRepository<MarketingProposal, UUID> {
    List<MarketingProposal> findAllByTenantIdOrderByUpdatedAtDesc(UUID tenantId);
    Optional<MarketingProposal> findByIdAndTenantId(UUID id, UUID tenantId);
}
