package com.example.agentic_ai_platform.documents.dto;

import com.example.agentic_ai_platform.documents.entity.Document;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record DocumentResponse(UUID id, String name, String contentType, long size, String type, String source,
        String uploadedBy, String extractedText, Map<String,Object> extractedFields,
        Map<String,Double> fieldConfidences, BigDecimal overallConfidence, String status,
        String flagReason, Instant time) {
    public static DocumentResponse from(Document d) {
        return new DocumentResponse(d.getId(), d.getOriginalFilename(), d.getContentType(), d.getFileSize(),
                d.getDocumentType(), d.getSource(), d.getUploadedBy(), d.getExtractedText(), d.getExtractedFields(),
                d.getFieldConfidences(), d.getOverallConfidence(), d.getStatus(), d.getFlagReason(), d.getCreatedAt());
    }
}
