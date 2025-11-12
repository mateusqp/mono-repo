-- Adicionar campos de auditoria na tabela app_user
ALTER TABLE app_user
    ADD COLUMN created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    ADD COLUMN updated_by VARCHAR(255) NOT NULL DEFAULT 'system';

-- Criar tabela de revisões (Envers)
CREATE TABLE revinfo (
    rev SERIAL PRIMARY KEY,
    revtstmp BIGINT NOT NULL
);

-- Criar tabela de auditoria para app_user
CREATE TABLE app_user_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    username VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255),
    cpf VARCHAR(255),
    role VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    PRIMARY KEY (id, rev),
    FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE INDEX idx_app_user_aud_rev ON app_user_aud(rev);
CREATE INDEX idx_app_user_aud_revtype ON app_user_aud(revtype);
