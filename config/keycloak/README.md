# Keycloak Configuration

Este diretório contém a configuração do realm do Keycloak para a aplicação.

## Realm: app

O realm `app` é importado automaticamente quando o Keycloak inicia.

### Clientes configurados:

- **app-frontend**: Cliente público para a aplicação React
  - Redirect URIs: `http://localhost:5173/*`
  - Web Origins: `http://localhost:5173`

- **app-backend**: Cliente bearer-only para a API Spring Boot

### Usuário padrão:

- **Username**: admin
- **Password**: admin
- **Email**: admin@app.local
- **Roles**: user, admin

## Acesso ao Console Admin

- URL: http://localhost:8081
- Username: admin
- Password: admin

## Endpoints importantes

- Realm: http://localhost:8081/realms/app
- OpenID Configuration: http://localhost:8081/realms/app/.well-known/openid-configuration
- Token Endpoint: http://localhost:8081/realms/app/protocol/openid-connect/token
- Authorization Endpoint: http://localhost:8081/realms/app/protocol/openid-connect/auth
