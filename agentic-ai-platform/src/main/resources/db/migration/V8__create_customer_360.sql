CREATE TABLE IF NOT EXISTS mkt_customer_accounts (
    id BINARY(16) PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    name VARCHAR(200) NOT NULL,
    domain VARCHAR(253),
    industry VARCHAR(120),
    tier VARCHAR(40) NOT NULL,
    annual_contract_value DECIMAL(19,2),
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    health_score DECIMAL(5,2),
    churn_probability DECIMAL(5,2),
    lead_score DECIMAL(5,2),
    customer_status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_mkt_customer_accounts_tenant FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id),
    CONSTRAINT uq_mkt_customer_accounts_tenant_name UNIQUE (tenant_id, name),
    INDEX idx_mkt_customer_accounts_tenant_name (tenant_id, name),
    INDEX idx_mkt_customer_accounts_tenant_health (tenant_id, health_score)
);

CREATE TABLE IF NOT EXISTS mkt_customer_360_signals (
    id BINARY(16) PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    account_id BINARY(16) NOT NULL,
    signal_type VARCHAR(40) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    source VARCHAR(80),
    observed_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_mkt_360_signals_tenant FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id),
    CONSTRAINT fk_mkt_360_signals_account FOREIGN KEY (account_id) REFERENCES mkt_customer_accounts(id) ON DELETE CASCADE,
    INDEX idx_mkt_360_signals_account_date (tenant_id, account_id, observed_at DESC)
);

CREATE TABLE IF NOT EXISTS mkt_customer_360_offers (
    id BINARY(16) PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    account_id BINARY(16) NOT NULL,
    title VARCHAR(200) NOT NULL,
    rationale VARCHAR(1000),
    offer_type VARCHAR(40) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'RECOMMENDED',
    created_at TIMESTAMP(6) NOT NULL,
    CONSTRAINT fk_mkt_360_offers_tenant FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id),
    CONSTRAINT fk_mkt_360_offers_account FOREIGN KEY (account_id) REFERENCES mkt_customer_accounts(id) ON DELETE CASCADE,
    INDEX idx_mkt_360_offers_account (tenant_id, account_id, created_at DESC)
);

-- Seed initial enterprise accounts for default development tenant
INSERT IGNORE INTO mkt_customer_accounts (id, tenant_id, name, domain, industry, tier, annual_contract_value, currency, health_score, churn_probability, lead_score, customer_status, created_at, updated_at) VALUES
(UUID_TO_BIN('c0000000-0000-0000-0000-000000000001'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 'Scania Logistics Nordic', 'scania.com', 'Heavy Transport & Fleet', 'TIER_1', 420000.00, 'USD', 92.00, 8.00, 88.00, 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN('c0000000-0000-0000-0000-000000000002'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 'Valmet Industrial Systems', 'valmet.com', 'Industrial Equipment', 'MID_MARKET', 185000.00, 'USD', 54.00, 72.00, 68.00, 'AT_RISK', NOW(), NOW()),
(UUID_TO_BIN('c0000000-0000-0000-0000-000000000003'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 'Konecranes Global Freight', 'konecranes.com', 'Port Crane & Cargo Handling', 'TIER_1', 610000.00, 'USD', 89.00, 11.00, 94.00, 'ACTIVE', NOW(), NOW()),
(UUID_TO_BIN('c0000000-0000-0000-0000-000000000004'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), 'Fjord Maritime Cargo', 'fjordmaritime.no', 'Maritime Shipping', 'GROWTH', 95000.00, 'USD', 78.00, 38.00, 82.00, 'ACTIVE', NOW(), NOW());

INSERT IGNORE INTO mkt_customer_360_signals (id, tenant_id, account_id, signal_type, description, source, observed_at) VALUES
(UUID_TO_BIN('d0000000-0000-0000-0000-000000000001'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000001'), 'USAGE', 'High API query volume; Viewed Enterprise Security SLA whitepaper 4 times.', 'API telemetry', NOW()),
(UUID_TO_BIN('d0000000-0000-0000-0000-000000000002'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000002'), 'USAGE', 'Decrease in document intake frequency; Multiple unresolved exceptions.', 'System Metrics', NOW()),
(UUID_TO_BIN('d0000000-0000-0000-0000-000000000003'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000003'), 'ENGAGEMENT', 'HR leadership explored Team Value Contribution Graph documentation.', 'Portal Analytics', NOW()),
(UUID_TO_BIN('d0000000-0000-0000-0000-000000000004'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000004'), 'USAGE', 'Reached 92% of monthly document quota 10 days before cycle renewal.', 'Quota Monitor', NOW());

INSERT IGNORE INTO mkt_customer_360_offers (id, tenant_id, account_id, title, rationale, offer_type, status, created_at) VALUES
(UUID_TO_BIN('e0000000-0000-0000-0000-000000000001'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000001'), 'Process Mining Real-Time Kafka Connector', 'High API usage suggests expansion opportunity', 'CROSS_SELL', 'RECOMMENDED', NOW()),
(UUID_TO_BIN('e0000000-0000-0000-0000-000000000002'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000002'), 'Retention Offer: 20% discount on Dedicated Support Engineer', 'Protect $185,000 ARR from churn risk', 'RETENTION', 'RECOMMENDED', NOW()),
(UUID_TO_BIN('e0000000-0000-0000-0000-000000000003'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000003'), 'Full Multi-Pillar Strategy & Knowledge Assistant Suite', 'High engagement across enterprise teams', 'UPSELL', 'RECOMMENDED', NOW()),
(UUID_TO_BIN('e0000000-0000-0000-0000-000000000004'), UUID_TO_BIN('11111111-1111-1111-1111-111111111111'), UUID_TO_BIN('c0000000-0000-0000-0000-000000000004'), 'Ingestion Gateway upgrade to 100k docs/mo', 'Quota exhaustion imminent', 'UPSELL', 'RECOMMENDED', NOW());
