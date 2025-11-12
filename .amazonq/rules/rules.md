# Regras de Desenvolvimento - Backend Spring Boot

## Estrutura Obrigatória

Sempre organize código em:
- `config/` - @Configuration
- `controller/` - @RestController
- `service/` - @Service
- `repository/` - @Repository (JPA)
- `domain/` - @Entity
- `dto/` - record (Java 21)
- `exception/` - RuntimeException + @RestControllerAdvice
- `enums/` - enum

## Padrões de Código

### Domain (Entidades)
```java
@Entity
@Table(name = "table_name")
@Audited
@Getter @Setter
@NoArgsConstructor
public class Entity extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
}
```
- ID sempre UUID
- Extends Auditable
- @Audited para histórico
- Tabelas em snake_case

### DTO
```java
public record EntityDTO(UUID id, String field) {}
public record CreateEntityRequest(@NotBlank String field) {}
```
- Usar record
- Sufixos: Request, Response, DTO
- Bean Validation annotations

### Repository
```java
@Repository
public interface EntityRepository extends JpaRepository<Entity, UUID> {}
```
- Extends JpaRepository<Entity, UUID>

### Service
```java
@Service
@Transactional(readOnly = true)
public class EntityService {
    private final EntityRepository repository;
    
    public EntityService(EntityRepository repository) {
        this.repository = repository;
    }
    
    @Transactional
    public Entity create(CreateEntityRequest request) {}
}
```
- @Transactional(readOnly = true) na classe
- @Transactional em métodos de escrita
- Injeção via construtor com final

### Controller
```java
@RestController
@RequestMapping("/api/entities")
public class EntityController {
    private final EntityService service;
    
    public EntityController(EntityService service) {
        this.service = service;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EntityDTO> getById(@PathVariable UUID id) {}
    
    @PostMapping
    public ResponseEntity<EntityDTO> create(@Valid @RequestBody CreateEntityRequest request) {}
}
```
- Endpoints sempre /api/...
- ResponseEntity<T>
- @Valid em request bodies
- @PathVariable UUID para IDs

### Exception
```java
public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(UUID id) {
        super("Entity not found: " + id);
    }
}

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handle(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getMessage()));
    }
}

public record ErrorResponse(String message) {}
```

### Enums
```java
public enum Status {
    ACTIVE,
    INACTIVE;
}
```
- UPPER_CASE
- @Enumerated(EnumType.STRING) em entidades

## Migrations (Flyway)

### Gerar timestamp:
```bash
# PowerShell
"V" + (Get-Date -Format "yyyyMMddHHmmss")
```

### Template:
```sql
-- V20250128143022__create_table_name.sql
CREATE TABLE table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    field VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL DEFAULT 'system',
    updated_by VARCHAR(255) NOT NULL DEFAULT 'system'
);

CREATE INDEX idx_table_name_field ON table_name(field);

CREATE TABLE table_name_aud (
    id UUID NOT NULL,
    rev INTEGER NOT NULL,
    revtype SMALLINT,
    field VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    PRIMARY KEY (id, rev),
    FOREIGN KEY (rev) REFERENCES revinfo(rev)
);

CREATE INDEX idx_table_name_aud_rev ON table_name_aud(rev);
```

## Nomenclatura

- Classes: PascalCase
- Métodos/variáveis: camelCase
- Constantes: UPPER_SNAKE_CASE
- Tabelas/colunas SQL: snake_case
- Endpoints: /api/resource-name

## Segurança

```java
@PreAuthorize("hasRole('ADMIN')")
@GetMapping("/admin")
public ResponseEntity<String> adminOnly() {}

// Obter usuário
SecurityContextHolder.getContext().getAuthentication().getName()
```
