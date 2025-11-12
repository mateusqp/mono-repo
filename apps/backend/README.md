# Backend Service

Spring Boot application with Keycloak authentication and database-managed authorization.

## Architecture

- **Authentication**: Keycloak (OIDC/OAuth2)
- **Authorization**: Database-managed roles (USER, ADMIN)
- **Database**: PostgreSQL with Flyway migrations

## How it works

1. User authenticates via Keycloak
2. JWT token is validated by Spring Security
3. `CustomJwtAuthenticationConverter` extracts user info from JWT
4. User is created/updated in local database automatically
5. User's role from database is converted to Spring Security authorities
6. Endpoints can use `@PreAuthorize("hasRole('ADMIN')")` for authorization

## Default Users

- **admin** (CPF: 00000000000) - Role: ADMIN

## Endpoints

- `GET /api/hello` - Authenticated users
- `GET /api/admin` - Admin only
- `GET /api/users/me` - Get current user info
- `GET /api/users` - List all users (admin only)

## Running

```bash
mvn spring-boot:run
```

## Testing with Keycloak

1. Login with Keycloak user (username: admin, password: admin)
2. User will be automatically created in database with USER role
3. To promote to ADMIN, update database directly or create admin endpoint
