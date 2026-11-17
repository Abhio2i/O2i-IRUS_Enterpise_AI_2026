package com.example.agentic_ai_platform.documents.repository;
import com.example.agentic_ai_platform.documents.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    boolean existsByTenantIdAndContentSha256(UUID tenantId, String hash);
    List<Document> findAllByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
