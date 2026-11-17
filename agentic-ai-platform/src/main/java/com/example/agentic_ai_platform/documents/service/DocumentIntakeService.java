package com.example.agentic_ai_platform.documents.service;
import com.example.agentic_ai_platform.documents.dto.DocumentResponse;
import com.example.agentic_ai_platform.documents.dto.DocumentFileResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;
public interface DocumentIntakeService {
    DocumentResponse ingest(UUID tenantId, String user, MultipartFile file, String type, String source);
    List<DocumentResponse> list(UUID tenantId);
    DocumentResponse get(UUID tenantId, UUID documentId);
    DocumentFileResponse getOriginalFile(UUID tenantId, UUID documentId);
    void delete(UUID tenantId, UUID documentId);
}
