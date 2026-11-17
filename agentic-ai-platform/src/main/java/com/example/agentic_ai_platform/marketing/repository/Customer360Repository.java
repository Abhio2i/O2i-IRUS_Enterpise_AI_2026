package com.example.agentic_ai_platform.marketing.repository;
import com.example.agentic_ai_platform.marketing.entity.Customer360Account;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface Customer360Repository extends JpaRepository<Customer360Account,UUID> {
 List<Customer360Account> findAllByTenantId(UUID tenantId);
 Optional<Customer360Account> findByTenantIdAndId(UUID tenantId, UUID id);
}
