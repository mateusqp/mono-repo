CREATE TABLE app_user (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    cpf VARCHAR(14) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_user_cpf ON app_user(cpf);
CREATE INDEX idx_app_user_username ON app_user(username);

INSERT INTO app_user (username, name, email, cpf, role) 
VALUES ('admin', 'Admin User', 'admin@app.local', '00000000000', 'ADMIN');
