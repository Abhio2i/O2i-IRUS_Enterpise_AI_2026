package com.example.agentic_ai_platform.marketing.repository;

import com.example.agentic_ai_platform.marketing.entity.MarketingCustomerList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.agentic_ai_platform.marketing.entity.MarketingContact;

public interface MarketingCustomerListRepository extends JpaRepository<MarketingCustomerList, UUID> {
    List<MarketingCustomerList> findAllByTenantIdOrderByUpdatedAtDesc(UUID tenantId);
    Optional<MarketingCustomerList> findByIdAndTenantId(UUID id, UUID tenantId);

    @Query("select distinct c from MarketingCustomerList l join l.members c "
            + "where l.id = :id and l.tenantId = :tenantId and c.tenantId = :tenantId "
            + "order by c.createdAt desc")
    List<MarketingContact> findMembersByListAndTenant(@Param("id") UUID id, @Param("tenantId") UUID tenantId);
}
