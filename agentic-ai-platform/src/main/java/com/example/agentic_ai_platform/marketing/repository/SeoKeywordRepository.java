package com.example.agentic_ai_platform.marketing.repository;
import com.example.agentic_ai_platform.marketing.entity.SeoKeyword; import java.util.*; import org.springframework.data.jpa.repository.JpaRepository;
public interface SeoKeywordRepository extends JpaRepository<SeoKeyword,UUID>{List<SeoKeyword> findAllByTenantIdOrderByKeywordAsc(UUID tenantId); Optional<SeoKeyword> findByTenantIdAndId(UUID tenantId,UUID id);}
