# Mono-Repo Deployment Blueprint (Spring Boot + React/Vite)

## Overview

Estrutura de **mono-repo** integrando **Spring Boot 3.x (Java 21)** backend e **React + Vite + TypeScript** frontend.
Suporta três ambientes — `dev`, `hom` e `prod` — usando **GitLab CI**, **Helm Umbrella**, **ArgoCD**, **Vault**, **Harbor** e **Keycloak**.

## Quickstart

1. **Backend** – [`apps/backend`](./apps/backend/)
2. **Frontend** – [`apps/frontend`](./apps/frontend/)
3. **Helm** – [`helm/`](./helm/README.md) com umbrella chart e subcharts

## Desenvolvimento Local

```bash
cp .env.example .env
docker compose up --build
```

**Serviços:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- PostgreSQL: localhost:5432
- Keycloak: http://localhost:8180

---

## Estrutura

```
mono-repo/
├── apps/
│   ├── backend/          # Spring Boot 3 + Java 21
│   └── frontend/         # React + Vite + TypeScript
├── config/
│   └── keycloak/         # Realm imports
├── helm/                 # Helm umbrella chart
│   ├── app-backend/      # Subchart backend
│   ├── app-frontend/     # Subchart frontend
│   ├── app-database/     # Subchart database
│   ├── values.yaml
│   ├── values-dev.yaml
│   ├── values-homolog.yaml
│   └── values-prod.yaml
├── .gitlab-ci.yml
├── docker-compose.yml
└── README.md
```

---

## Ambientes

| Ambiente | Namespace | Domínio | Branch | TLS |
|----------|-----------|---------|--------|-----|
| Dev | `app` | `app.tkg-des.nuvem.unicamp.br` | `develop` | Não |
| Hom | `app` | `app.tkg-hom.nuvem.unicamp.br` | `hom` | Não |
| Prod | `app` | `app.unicamp.br` | `main` | Sim |

---

## GitLab CI/CD

### Pipeline

**Stages:** `build` → `test` → `package` → `push` → `update-config-repo`

**Estratégia por ambiente:**
- Build com `.env` específico (`.env.dev`, `.env.hom`, `.env.prod`)
- Push de imagens com Kaniko para `registry.nuvem.unicamp.br`
- Tag: `${CI_COMMIT_SHA}`
- Atualização automática do config repo com `yq`

### Variáveis Necessárias

| Variável | Descrição |
|----------|----------|
| `HARBOR_USER` | Usuário do registry |
| `HARBOR_PASSWORD` | Senha do registry |
| `CONFIG_REPO_URL` | URL do repositório de configuração ArgoCD |

---

## Helm

### Estrutura Umbrella

Chart principal (`helm/Chart.yaml`) com 3 subcharts:
- `app-backend` - Spring Boot deployment
- `app-frontend` - React/Vite com Nginx
- `app-database` - PostgreSQL (apenas dev/hom)

### Deploy

```bash
helm dependency update helm/
helm install app helm/ -f helm/values-dev.yaml -n app --create-namespace
```

### Componentes

**Backend:**
- Deployment + Service (NodePort)
- Ingress path `/api`
- ConfigMap + Vault secrets

**Frontend:**
- Deployment + Service (ClusterIP)
- Ingress path `/`
- ConfigMap + Vault secrets

**Database:**
- Deployment + Service + PVC
- Desabilitado em produção

---

## Vault

Secrets gerenciados via `VaultStaticSecret` (Vault Secrets Operator):

```yaml
apiVersion: secrets.hashicorp.com/v1beta1
kind: VaultStaticSecret
metadata:
  name: app-backend-vault-secret
spec:
  mount: project-des
  path: app/backend
  type: kv-v2
  refreshAfter: 1h
```

**Paths:**
- Backend: `app/backend`
- Frontend: `app/frontend`
- Database: `app/database`
- Registry: `registry-pull-secret`

---

## ArgoCD

Criar Application no ArgoCD apontando para o config repo:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-dev
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://gitlab.com/org/config-repo.git
    targetRevision: main
    path: app
    helm:
      valueFiles: [values-dev.yaml]
  destination:
    server: https://kubernetes.default.svc
    namespace: app
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## Customização

Para adaptar este scaffolding ao seu projeto:

1. Substituir `app` pelo nome do projeto em:
   - `.gitlab-ci.yml` (registry, image names)
   - `helm/Chart.yaml` e subcharts
   - `helm/values*.yaml`
   - `.env*` (URLs)

2. Ajustar domínios nos `values-*.yaml`

3. Configurar variáveis no GitLab CI/CD

4. Criar secrets no Vault
