# Backend Service

Spring Boot 3 application configured as an OAuth2 resource server backed by PostgreSQL.

## Requisitos

- Java 21
- Maven 3.9+
- Docker (opcional, para empacotar a aplicação)

## Configuração

As variáveis abaixo são lidas pelo `application.yml` para configurar o ambiente de execução:

| Variável | Descrição | Valor padrão |
| --- | --- | --- |
| `DB_URL` | URL JDBC do banco Postgres | `jdbc:postgresql://localhost:5432/backend` |
| `DB_USERNAME` | Usuário do banco | `backend` |
| `DB_PASSWORD` | Senha do banco | `backend` |
| `KC_ISSUER_URI` | Issuer do provedor OpenID Connect (Keycloak) | — |
| `KC_JWK_SET_URI` | URI do JWK Set (opcional) | `${KC_ISSUER_URI}/protocol/openid-connect/certs` |
| `KC_CLIENT_ID` | Audience esperada no JWT | — |
| `KC_ALLOWED_ORIGINS` | Lista (separada por vírgula) de origens permitidas no CORS | `https://example.com` |
| `KC_ALLOWED_METHODS` | Métodos HTTP permitidos no CORS | `GET` |
| `KC_ALLOWED_HEADERS` | Cabeçalhos permitidos no CORS | `Authorization,Content-Type` |

> **Nota:** Defina `KC_ISSUER_URI` e `KC_CLIENT_ID` para ativar a validação do JWT provido pelo Keycloak.

## Executando localmente

Compile e execute a aplicação com o Maven:

```bash
mvn spring-boot:run
```

Para gerar o artefato empacotado em um *fat jar*:

```bash
mvn clean package
```

Rode a suíte de testes:

```bash
mvn test
```

Após iniciar, o endpoint protegido estará disponível em `GET /api/hello` (requer um JWT válido). Os endpoints do actuator expõem
 `GET /actuator/health` e `GET /actuator/prometheus`.

## Docker

Gere o jar e construa a imagem Docker:

```bash
mvn clean package
docker build -t backend-app .
```

Se o jar final possuir um nome diferente, ajuste o argumento `JAR_FILE` ao construir a imagem:

```bash
docker build -t backend-app --build-arg JAR_FILE=target/meu-app.jar .
```

Execute o contêiner:

```bash
docker run --rm -p 8080:8080 --env-file .env backend-app
```

## Observabilidade

O actuator expõe métricas compatíveis com Prometheus em `/actuator/prometheus`. Ajuste as variáveis de ambiente para limitar o acesso via CORS conforme necessário.
