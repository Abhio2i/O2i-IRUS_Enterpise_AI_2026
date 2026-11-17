package com.example.agentic_ai_platform.marketing.repository;
import com.example.agentic_ai_platform.marketing.entity.Customer360Offer; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface Customer360OfferRepository extends JpaRepository<Customer360Offer,UUID>{List<Customer360Offer> findAllByTenantIdAndAccountIdOrderByCreatedAtDesc(UUID tenant,UUID account);}
