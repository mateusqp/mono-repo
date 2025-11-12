# Padrões de Desenvolvimento - Backend

## Estrutura de Pacotes

```
com.example.backend/
├── config/          # @Configuration
├── controller/      # @RestController
├── service/         # @Service
├── repository/      # @Repository (JPA)
├── domain/          # @Entity
├── dto/             # record (Java 21)
├── exception/       # RuntimeException + @RestControllerAdvice
└── enums/           # enum
```

## Padrões Obrigatórios

### 1. Domain (Entidades JPA)

```java
@Entity
@Table(name = "users")
@Audited
@Getter @Setter
@NoArgsConstructor
public class User extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
}
```

**Obrigatório:**
- ID: `UUID` com `GenerationType.UUID`
- Lombok: `@Getter @Setter @NoArgsConstructor`
- Auditoria: `extends Auditable` + `@Audited`
- Tabela: `snake_case`

**Auditable fornece:**
- `createdAt` / `updatedAt` (LocalDateTime)
- `createdBy` / `updatedBy` (String)
- Histórico automático em tabela `{entity}_aud`

### 2. DTO (Data Transfer Objects)

```java
public record UserDTO(
    UUID id,
    String name,
    String email
) {}

public record CreateUserRequest(
    @NotBlank String name,
    @Email String email
) {}
```

**Obrigatório:**
- Usar `record` (Java 21)
- Sufixos: `Request`, `Response`, `DTO`
- Validação: Bean Validation annotations

### 3. Repository

```java
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
}
```

**Obrigatório:**
- Extends `JpaRepository<Entity, UUID>`
- Query methods Spring Data ou `@Query`

### 4. Service

```java
@Service
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    public List<User> findAll() {
        return userRepository.findAll();
    }
    
    @Transactional
    public User create(CreateUserRequest request) {
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        return userRepository.save(user);
    }
}
```

**Obrigatório:**
- `@Service` + `@Transactional(readOnly = true)` na classe
- Injeção via construtor com `final`
- `@Transactional` em métodos de escrita

### 5. Controller

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    @GetMapping
    public ResponseEntity<List<UserDTO>> list() {
        return ResponseEntity.ok(userService.findAll());
    }
    
    @PostMapping
    public ResponseEntity<UserDTO> create(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable UUID id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
```

**Obrigatório:**
- `@RestController` + `@RequestMapping("/api/...")`
- Injeção via construtor com `final`
- Retornar `ResponseEntity<T>`
- `@Valid` em request bodies
- `@PathVariable` com tipo `UUID` para IDs

### 6. Exception

```java
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(UUID id) {
        super("User not found: " + id);
    }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getMessage()));
    }
}

public record ErrorResponse(String message) {}
```

**Obrigatório:**
- Extends `RuntimeException`
- Handler: `@RestControllerAdvice`
- ErrorResponse: `record`

### 7. Config

```java
@Configuration
public class WebConfig {
    
    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }
}
```

**Obrigatório:**
- `@Configuration`
- Beans via métodos `@Bean`
- Propriedades: `@Value` ou `@ConfigurationProperties`

### 8. Enums

```java
public enum UserRole {
    ADMIN,
    USER;
}
```

**Obrigatório:**
- Constantes: `UPPER_CASE`
- Em entidades: `@Enumerated(EnumType.STRING)`

## Migrations (Flyway)

### Gerar Timestamp

```bash
# Linux/Mac
date +V%Y%m%d%H%M%S

# Windows PowerShell
"V" + (Get-Date -Format "yyyyMMddHHmmss")
```

### Nomenclatura

```
src/main/resources/db/migration/V20250128143022__create_users_table.sql
```

### Template

```sql
-- V20250128143022__create_users_table.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system'
);

CREATE INDEX idx_users_email ON users(email);

-- Tabela de auditoria (Envers)
CREATE TABLE users_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    name VARCHAR(255),
    email VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    PRIMARY KEY (id, rev),
    FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE INDEX idx_users_aud_rev ON users_aud(rev);
```

**Obrigatório:**
- ID: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- Colunas: `snake_case`
- Auditoria: `created_at`, `updated_at`, `created_by`, `updated_by`
- Histórico: tabela `{entity}_aud` com FK para `revinfo`
- Índices em colunas de busca

**Tabela revinfo (criar uma vez):**
```sql
CREATE TABLE revinfo (
    rev SERIAL PRIMARY KEY,
    revtstmp BIGINT NOT NULL
);
```

## Regras de Nomenclatura

- Java: `PascalCase` (classes), `camelCase` (métodos/variáveis), `UPPER_SNAKE_CASE` (constantes)
- SQL: `snake_case` (tabelas/colunas)
- Endpoints: `/api/resource-name`

## Segurança (Keycloak)

```java
// Proteger endpoint
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin")
public ResponseEntity<String> adminOnly() {
    return ResponseEntity.ok("Admin content");
}

// Obter usuário atual
public String getCurrentUsername() {
    return SecurityContextHolder.getContext().getAuthentication().getName();
}
```
