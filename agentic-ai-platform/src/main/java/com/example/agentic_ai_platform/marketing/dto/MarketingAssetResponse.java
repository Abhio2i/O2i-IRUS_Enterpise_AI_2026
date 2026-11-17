package com.example.agentic_ai_platform.marketing.dto;

import com.example.agentic_ai_platform.documents.entity.Document;
import java.time.Instant;
import java.util.UUID;

public record MarketingAssetResponse(UUID id, String name, String contentType, long size, String type,
        String folder, Instant uploadedAt) {
    public static MarketingAssetResponse from(Document document) {
        return new MarketingAssetResponse(document.getId(), document.getOriginalFilename(), document.getContentType(),
                document.getFileSize(), document.getSource().contains("/") ? document.getSource().substring(document.getSource().indexOf('/') + 1) : document.getSource(),
                document.getSource().contains("/") ? document.getSource().substring(0, document.getSource().indexOf('/')) : "General", document.getCreatedAt());
    }
}
