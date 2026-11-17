CREATE TABLE dms_documents (
    id BINARY(16) PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    original_filename VARCHAR(512) NOT NULL,
    content_type VARCHAR(160) NOT NULL,
    file_size BIGINT NOT NULL,
    document_type VARCHAR(64) NOT NULL,
    source VARCHAR(320) NOT NULL,
    uploaded_by VARCHAR(320) NOT NULL,
    content_sha256 CHAR(64) NOT NULL,
    extracted_text TEXT NOT NULL,
    extracted_fields JSON NOT NULL,
    field_confidences JSON NOT NULL,
    overall_confidence NUMERIC(5,2) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL,
    flag_reason VARCHAR(1000),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_dms_documents_tenant FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id)
);
CREATE INDEX idx_dms_documents_tenant_created ON dms_documents(tenant_id, created_at DESC);
CREATE INDEX idx_dms_documents_tenant_hash ON dms_documents(tenant_id, content_sha256);
