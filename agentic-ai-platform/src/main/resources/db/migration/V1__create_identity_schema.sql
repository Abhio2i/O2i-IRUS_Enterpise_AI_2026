CREATE TABLE dms_tenants (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

CREATE TABLE iam_users (
    id BINARY(16) PRIMARY KEY,
    tenant_id BINARY(16) NOT NULL,
    email VARCHAR(320) NOT NULL,
    display_name VARCHAR(160) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_iam_users_tenant FOREIGN KEY (tenant_id) REFERENCES dms_tenants(id),
    CONSTRAINT uq_iam_users_tenant_email UNIQUE (tenant_id, email)
);

CREATE TABLE iam_refresh_sessions (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP(6) NOT NULL,
    revoked_at TIMESTAMP(6),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_refresh_sessions_user FOREIGN KEY (user_id) REFERENCES iam_users(id)
);

CREATE INDEX idx_iam_refresh_sessions_user_id ON iam_refresh_sessions(user_id);
