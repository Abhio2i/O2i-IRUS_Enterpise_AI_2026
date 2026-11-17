CREATE TABLE mkt_contacts (
    id BINARY(16) PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    email VARCHAR(320) NOT NULL,
    first_name VARCHAR(120),
    last_name VARCHAR(120),
    company VARCHAR(200),
    title VARCHAR(160),
    industry VARCHAR(120),
    country VARCHAR(120),
    annual_revenue DECIMAL(19,2),
    customer_status VARCHAR(80),
    churn_probability DECIMAL(5,2),
    created_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_mkt_contacts_tenant
        FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id),
    CONSTRAINT uq_mkt_contacts_tenant_email UNIQUE (tenant_id, email),
    CONSTRAINT chk_mkt_contacts_revenue CHECK (annual_revenue IS NULL OR annual_revenue >= 0),
    CONSTRAINT chk_mkt_contacts_churn CHECK (churn_probability IS NULL OR (churn_probability >= 0 AND churn_probability <= 100))
);

CREATE INDEX idx_mkt_contacts_tenant ON mkt_contacts(tenant_id);

CREATE TABLE mkt_customer_list_contacts (
    customer_list_id BINARY(16) NOT NULL,
    contact_id BINARY(16) NOT NULL,
    PRIMARY KEY (customer_list_id, contact_id),
    CONSTRAINT fk_mkt_list_contacts_list
        FOREIGN KEY (customer_list_id) REFERENCES mkt_customer_lists(id) ON DELETE CASCADE,
    CONSTRAINT fk_mkt_list_contacts_contact
        FOREIGN KEY (contact_id) REFERENCES mkt_contacts(id) ON DELETE CASCADE
);

CREATE INDEX idx_mkt_list_contacts_contact ON mkt_customer_list_contacts(contact_id);
