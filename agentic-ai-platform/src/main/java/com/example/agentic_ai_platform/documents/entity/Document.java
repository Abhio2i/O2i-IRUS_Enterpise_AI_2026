package com.example.agentic_ai_platform.documents.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "dms_documents")
public class Document {
    @Id private UUID id;
    @Column(name="tenant_id", nullable=false) private UUID tenantId;
    @Column(name="original_filename", nullable=false) private String originalFilename;
    @Column(name="content_type", nullable=false) private String contentType;
    @Column(name="file_size", nullable=false) private long fileSize;
    @Column(name="document_type", nullable=false) private String documentType;
    @Column(nullable=false) private String source;
    @Column(name="uploaded_by", nullable=false) private String uploadedBy;
    @Column(name="content_sha256", nullable=false) private String contentSha256;
    @Column(name="extracted_text", nullable=false, columnDefinition="text") private String extractedText;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name="extracted_fields", nullable=false, columnDefinition="json") private Map<String,Object> extractedFields;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name="field_confidences", nullable=false, columnDefinition="json") private Map<String,Double> fieldConfidences;
    @Column(name="overall_confidence", nullable=false) private BigDecimal overallConfidence;
    @Column(nullable=false) private String status;
    @Column(name="flag_reason") private String flagReason;
    @Column(name="created_at", nullable=false) private Instant createdAt;
    protected Document() {}
    public Document(UUID id, UUID tenantId, String originalFilename, String contentType, long fileSize, String documentType, String source, String uploadedBy, String contentSha256, String extractedText, Map<String,Object> fields, Map<String,Double> confidences, BigDecimal overallConfidence, String status, String flagReason) {
        this.id=id; this.tenantId=tenantId; this.originalFilename=originalFilename; this.contentType=contentType; this.fileSize=fileSize; this.documentType=documentType; this.source=source; this.uploadedBy=uploadedBy; this.contentSha256=contentSha256; this.extractedText=extractedText; this.extractedFields=fields; this.fieldConfidences=confidences; this.overallConfidence=overallConfidence; this.status=status; this.flagReason=flagReason; this.createdAt=Instant.now();
    }
    public UUID getId(){return id;} public UUID getTenantId(){return tenantId;} public String getOriginalFilename(){return originalFilename;} public String getContentType(){return contentType;} public long getFileSize(){return fileSize;} public String getDocumentType(){return documentType;} public String getSource(){return source;} public String getUploadedBy(){return uploadedBy;} public String getContentSha256(){return contentSha256;} public String getExtractedText(){return extractedText;} public Map<String,Object> getExtractedFields(){return extractedFields;} public Map<String,Double> getFieldConfidences(){return fieldConfidences;} public BigDecimal getOverallConfidence(){return overallConfidence;} public String getStatus(){return status;} public String getFlagReason(){return flagReason;} public Instant getCreatedAt(){return createdAt;}
}
