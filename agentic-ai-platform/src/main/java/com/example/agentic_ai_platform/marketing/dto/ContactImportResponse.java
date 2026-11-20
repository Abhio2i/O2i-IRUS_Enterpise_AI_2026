package com.example.agentic_ai_platform.marketing.dto;

import java.util.List;
import java.util.UUID;

public record ContactImportResponse(
        int imported,
        int duplicates,
        int invalid,
        int processed,
        List<RowError> errors,
        UUID folderId,
        String folderName,
        int listMemberCount) {

    public ContactImportResponse(int imported, int duplicates, int invalid, int processed, List<RowError> errors) {
        this(imported, duplicates, invalid, processed, errors, null, null, imported);
    }

    public ContactImportResponse(int imported, int duplicates, int invalid, int processed, List<RowError> errors, UUID folderId, String folderName) {
        this(imported, duplicates, invalid, processed, errors, folderId, folderName, imported);
    }

    public record RowError(int row, String message) {}
}
