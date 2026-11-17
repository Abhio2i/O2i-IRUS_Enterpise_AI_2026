CREATE TABLE dms_document_content (
    document_id BINARY(16) PRIMARY KEY,
    content LONGBLOB NOT NULL,
    CONSTRAINT fk_dms_document_content_document
        FOREIGN KEY (document_id) REFERENCES dms_documents(id) ON DELETE CASCADE
);
