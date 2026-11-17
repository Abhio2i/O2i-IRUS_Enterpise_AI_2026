package com.example.agentic_ai_platform.marketing.dto;

import java.util.List;

public record ContactImportResponse(
        int imported,
        int duplicates,
        int invalid,
        int processed,
        List<RowError> errors) {
    public record RowError(int row, String message) {}
}
