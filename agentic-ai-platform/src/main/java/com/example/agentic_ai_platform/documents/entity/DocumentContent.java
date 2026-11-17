package com.example.agentic_ai_platform.documents.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.util.UUID;

@Entity
@Table(name = "dms_document_content")
public class DocumentContent {
    @Id
    @Column(name = "document_id")
    private UUID documentId;

    @Lob
    @Column(nullable = false, columnDefinition = "longblob")
    private byte[] content;

    protected DocumentContent() {}

    public DocumentContent(UUID documentId, byte[] content) {
        this.documentId = documentId;
        this.content = content;
    }

    public byte[] getContent() {
        return content;
    }
}
