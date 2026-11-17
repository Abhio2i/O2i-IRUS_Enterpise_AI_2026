package com.example.agentic_ai_platform.documents.repository;

import com.example.agentic_ai_platform.documents.entity.DocumentContent;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentContentRepository extends JpaRepository<DocumentContent, UUID> {}
