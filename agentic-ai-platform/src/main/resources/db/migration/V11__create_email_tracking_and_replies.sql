CREATE TABLE IF NOT EXISTS mkt_campaign_events (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    campaign_id BINARY(16) NULL,
    contact_email VARCHAR(320) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    target_url VARCHAR(1000) NULL,
    ip_address VARCHAR(100) NULL,
    user_agent VARCHAR(500) NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_event_tenant_campaign (tenant_id, campaign_id),
    INDEX idx_event_email (contact_email),
    INDEX idx_event_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mkt_campaign_replies (
    id BINARY(16) NOT NULL PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    campaign_id BINARY(16) NULL,
    contact_id BINARY(16) NULL,
    sender_email VARCHAR(320) NOT NULL,
    sender_name VARCHAR(200) NULL,
    recipient_email VARCHAR(320) NOT NULL,
    subject VARCHAR(500) NULL,
    snippet VARCHAR(1000) NULL,
    body_text LONGTEXT NULL,
    body_html LONGTEXT NULL,
    message_id VARCHAR(255) NULL,
    in_reply_to VARCHAR(255) NULL,
    school_name VARCHAR(200) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    received_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    INDEX idx_reply_tenant_time (tenant_id, received_at),
    INDEX idx_reply_sender (sender_email),
    INDEX idx_reply_campaign (campaign_id),
    UNIQUE INDEX uq_reply_message_id (tenant_id, message_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
