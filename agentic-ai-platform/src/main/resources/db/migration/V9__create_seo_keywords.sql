CREATE TABLE mkt_seo_keywords (
 id BINARY(16) PRIMARY KEY, tenant_id BINARY(16) NOT NULL, keyword VARCHAR(255) NOT NULL,
 target_page VARCHAR(2048), current_rank INT, previous_rank INT, search_volume INT,
 difficulty INT, intent VARCHAR(32) NOT NULL DEFAULT 'INFORMATIONAL', status VARCHAR(24) NOT NULL DEFAULT 'TRACKING',
 meta_title VARCHAR(70), meta_description VARCHAR(170), ai_recommendation TEXT,
 created_at TIMESTAMP(6) NOT NULL, updated_at TIMESTAMP(6) NOT NULL,
 CONSTRAINT fk_mkt_seo_tenant FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id),
 CONSTRAINT uq_mkt_seo_tenant_keyword UNIQUE (tenant_id, keyword),
 CONSTRAINT chk_mkt_seo_rank CHECK (current_rank IS NULL OR current_rank > 0),
 CONSTRAINT chk_mkt_seo_volume CHECK (search_volume IS NULL OR search_volume >= 0),
 CONSTRAINT chk_mkt_seo_difficulty CHECK (difficulty IS NULL OR difficulty BETWEEN 0 AND 100)
);
CREATE INDEX idx_mkt_seo_tenant_keyword ON mkt_seo_keywords(tenant_id, keyword);
INSERT IGNORE INTO mkt_seo_keywords(id,tenant_id,keyword,target_page,current_rank,previous_rank,search_volume,difficulty,intent,status,created_at,updated_at) VALUES
(UUID_TO_BIN('f0000000-0000-0000-0000-000000000001'),UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),'enterprise AI operations','https://example.com/enterprise-ai',12,15,2400,68,'COMMERCIAL','TRACKING',NOW(6),NOW(6)),
(UUID_TO_BIN('f0000000-0000-0000-0000-000000000002'),UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),'document processing automation','https://example.com/document-automation',8,9,1900,54,'COMMERCIAL','TRACKING',NOW(6),NOW(6)),
(UUID_TO_BIN('f0000000-0000-0000-0000-000000000003'),UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),'AI workflow automation platform','https://example.com/workflow-automation',21,18,3200,73,'COMMERCIAL','TRACKING',NOW(6),NOW(6)),
(UUID_TO_BIN('f0000000-0000-0000-0000-000000000004'),UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),'intelligent document processing','https://example.com/idp',6,7,4400,61,'INFORMATIONAL','TRACKING',NOW(6),NOW(6)),
(UUID_TO_BIN('f0000000-0000-0000-0000-000000000005'),UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),'enterprise process mining software','https://example.com/process-mining',17,20,1300,77,'COMMERCIAL','TRACKING',NOW(6),NOW(6)),
(UUID_TO_BIN('f0000000-0000-0000-0000-000000000006'),UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),'AI document management system','https://example.com/document-management',9,11,2700,59,'COMMERCIAL','TRACKING',NOW(6),NOW(6)),
(UUID_TO_BIN('f0000000-0000-0000-0000-000000000007'),UUID_TO_BIN('11111111-1111-1111-1111-111111111111'),'automated invoice processing','https://example.com/invoice-automation',4,5,3600,48,'TRANSACTIONAL','TRACKING',NOW(6),NOW(6));
