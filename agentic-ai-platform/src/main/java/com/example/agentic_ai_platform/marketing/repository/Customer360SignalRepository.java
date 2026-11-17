package com.example.agentic_ai_platform.marketing.repository;
import com.example.agentic_ai_platform.marketing.entity.Customer360Signal; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface Customer360SignalRepository extends JpaRepository<Customer360Signal,UUID>{List<Customer360Signal> findAllByTenantIdAndAccountIdOrderByObservedAtDesc(UUID tenant,UUID account);}
