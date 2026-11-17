CREATE TABLE mkt_customer_lists (
    id BINARY(16) PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    contacts INT NOT NULL,
    conversion_rate DECIMAL(5,2) NOT NULL,
    segment VARCHAR(80) NOT NULL,
    status VARCHAR(32) NOT NULL,
    ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_mkt_customer_lists_tenant
        FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id),
    CONSTRAINT chk_mkt_customer_lists_contacts CHECK (contacts >= 0),
    CONSTRAINT chk_mkt_customer_lists_conversion CHECK (conversion_rate >= 0 AND conversion_rate <= 100),
    CONSTRAINT chk_mkt_customer_lists_status CHECK (status IN ('ACTIVE', 'BUILDING'))
);

CREATE INDEX idx_mkt_customer_lists_tenant_updated
    ON mkt_customer_lists(tenant_id, updated_at DESC);
