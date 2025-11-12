# Helm Chart - Aplicação Genérica

Este é um Helm chart umbrella que gerencia o deployment completo da aplicação genérica (backend, frontend e database).

## Estrutura

```
helm/
├── Chart.yaml                 # Chart principal (umbrella)
├── values.yaml                # Valores padrão
├── values-dev.yaml            # Valores para desenvolvimento
├── values-homolog.yaml        # Valores para homologação
├── values-prod.yaml           # Valores para produção
├── templates/
│   └── registry-secret.yaml   # Secret do registry (Vault)
├── app-backend/               # Subchart do backend
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
├── app-frontend/              # Subchart do frontend
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
└── app-database/              # Subchart do database
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
```

## Uso

### Instalar dependências

```bash
helm dependency update
```

### Deploy em desenvolvimento

```bash
helm install app . -f values-dev.yaml -n app-dev --create-namespace
```

### Deploy em homologação

```bash
helm install app . -f values-homolog.yaml -n app-hom --create-namespace
```

### Deploy em produção

```bash
helm install app . -f values-prod.yaml -n app-prod --create-namespace
```

### Atualizar deployment

```bash
helm upgrade app . -f values-dev.yaml -n app-dev
```

### Desinstalar

```bash
helm uninstall app -n app-dev
```

## Componentes

### Backend (Spring Boot)
- Deployment com configuração de recursos
- Service NodePort
- Ingress no path `/api`
- ConfigMap e Secrets via Vault
- Security context configurado

### Frontend (React/Vite)
- Deployment com Nginx
- Service ClusterIP
- Ingress no path `/`
- ConfigMap e Secrets via Vault
- Security context configurado

### Database (PostgreSQL)
- Deployment com persistência
- Service NodePort
- PVC com NFS storage
- ConfigMap e Secrets via Vault
- Security context configurado

## Configuração

### Habilitar/Desabilitar componentes

No `values.yaml`:

```yaml
backend:
  enabled: true

frontend:
  enabled: true

database:
  enabled: true  # Desabilitar em produção se usar RDS
```

### Configurar domínio

```yaml
global:
  domain: app.tkg-des.nuvem.unicamp.br
```

### Configurar imagens

```yaml
global:
  registry: harbor.example.com/project

# Em cada subchart
image:
  repository: app-backend
  tag: "v1.0.0"
```

## Integração com Vault

Todos os secrets são gerenciados via Vault usando o operador VaultStaticSecret:

- Registry pull secret: `registry-pull-secret`
- Backend secrets: `app/backend`
- Frontend secrets: `app/frontend`
- Database secrets: `app/database`

## Integração com ArgoCD

Este chart é projetado para ser usado com ArgoCD. Crie uma Application:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-dev
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://gitlab.com/org/repo.git
    targetRevision: main
    path: helm
    helm:
      valueFiles:
        - values-dev.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: app-dev
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```
