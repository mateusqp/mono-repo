# Mono-Repo Deployment Blueprint (Spring Boot + React/Vite)

## Overview

This document specifies the baseline structure for a **mono-repo** integrating a **Spring Boot 3.x (Java 21)** backend and a **React + Vite + TypeScript** frontend.
The setup targets four environments — `local`, `des`, `hom`, and `prod` — using **GitLab CI**, **Helm**, **ArgoCD**, **Vault**, **Harbor**, **Prometheus/Grafana**, and **Keycloak**.

## Quickstart

1. **Backend service** – explore the scaffold under [`apps/backend`](./apps/backend/README.md) to begin the Spring Boot implementation.
2. **Frontend client** – review [`apps/frontend`](./apps/frontend/README.md) for guidance on bootstrapping the React + Vite project.
3. **Helm chart** – configure deployment manifests via [`ops/helm/app-chart`](./ops/helm/app-chart/README.md), including environment-specific values files such as `values-local.yaml` and `values-prod.yaml`.

---

## 1. Repository Layout

```
/apps
  /backend      # Spring Boot application (JWT resource server)
  /frontend     # React/Vite application (OIDC client)
/ops
  /helm
    /app-chart
      /templates
      values.yaml
      values-local.yaml
      values-des.yaml
      values-hom.yaml
      values-prod.yaml
/.gitlab-ci.yml
/README.md
```

### External Config Repo (watched by ArgoCD)

```
/environments
  /local/values.yaml
  /des/values.yaml
  /hom/values.yaml
  /prod/values.yaml
/apps/app-argo-app.yaml
```

The **GitLab Runner** builds and pushes Docker images to **Harbor**, then commits image tags into the **config-repo**, which ArgoCD syncs to the cluster.

---

## 2. Environments and FQDNs

| Env  | Namespace | Backend FQDN | Frontend FQDN | Keycloak Realm |
|------|------------|--------------|----------------|----------------|
| local | `app-local` | localhost via docker-compose | localhost | shared realm |
| des | `app-des` | `https://app.tkg-des.nuvem.unicamp.br` | same host | shared realm |
| hom | `app-hom` | `https://app.tkg-hom.nuvem.unicamp.br` | same host | shared realm |
| prod | `app-prod` | `https://app.unicamp.br` | same host | shared realm |

---

## 3. Keycloak Integration

- **Single Realm** shared across environments.
- **Backend:** acts as *Resource Server (JWT)*.
- **Frontend:** OIDC Authorization Code + PKCE via `keycloak-js` or `oidc-client-ts`.

### Backend `application.yml`
```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: ${KC_ISSUER_URI}
```

Variables supplied via Helm → ConfigMap/Secret.

---

## 4. Registry and Images

- Registry: `harbor.example.com/project/`
- Images:  
  - `app-backend`  
  - `app-frontend`
- Tag pattern: `v${CI_COMMIT_TAG:-0.0.0}-${CI_COMMIT_SHORT_SHA}`
- Harbor robot account for GitLab Runner
- Retention/cleanup policies configurable per environment

---

## 5. Helm Chart Highlights

```
ops/helm/app-chart/
  Chart.yaml
  templates/
    backend-deployment.yaml
    backend-service.yaml
    backend-configmap.yaml
    backend-secret.yaml
    backend-servicemonitor.yaml
    frontend-deployment.yaml
    frontend-service.yaml
    frontend-configmap.yaml
    ingress.yaml
    externalsecret-backend.yaml
    externalsecret-frontend.yaml
```

- Separate deployments for backend and frontend  
- Ingress via **NGINX** controller  
- Prometheus **ServiceMonitor** fixed at `/actuator/prometheus`  
- External Secrets from Vault (see §8)

---

## 6. Observability

- Prometheus & Grafana managed by platform (not bundled)
- Chart exposes metrics via:
  - `/actuator/prometheus` endpoint
  - `ServiceMonitor` and optional alert rules
- Optional Grafana dashboard ConfigMaps can be included

---

## 7. GitLab CI/CD Pipeline

**Stages:** `build`, `test`, `package`, `push`, `update-config-repo`

Main responsibilities:
- Build → Test → Package backend/frontend
- Push Docker images to Harbor
- Clone config-repo, update image tags, push commit

Promotion DES→HOM→PROD occurs by **merge** updating `values.yaml` in the config-repo.

---

## 8. Vault & External Secrets

- Cluster already includes **External Secrets Operator**
- Authentication likely via ArgoCD ServiceAccount
- Example:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-backend-secrets
spec:
  secretStoreRef:
    kind: ClusterSecretStore
    name: vault-store
  target:
    name: app-backend-secrets
  data:
    - secretKey: KC_CLIENT_SECRET
      remoteRef:
        key: secret/data/app/keycloak
        property: client-secret
```

---

## 9. ArgoCD Application (Config Repo)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app-des
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://gitlab.com/<group>/<config-repo>.git
    targetRevision: main
    path: environments/des
    helm:
      valueFiles: [values.yaml]
  destination:
    server: https://kubernetes.default.svc
    namespace: app-des
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions: [CreateNamespace=true]
```

---

## 10. Environment-Specific Values (Example – DES)

```yaml
nameOverride: app

image:
  backend:
    repository: harbor.example.com/project/app-backend
    tag: "latest"
  frontend:
    repository: harbor.example.com/project/app-frontend
    tag: "latest"

ingress:
  enabled: true
  className: nginx
  hosts:
    backend: identifica.tkg-des.nuvem.unicamp.br
    frontend: identifica.tkg-des.nuvem.unicamp.br
  tls:
    enabled: true
    secretName: app-des-tls

keycloak:
  issuerUri: "https://keycloak.unicamp.br/realms/main"
  clientId: "app-client"

env:
  backend:
    KC_ISSUER_URI: "{{ .Values.keycloak.issuerUri }}"
    KC_CLIENT_ID: "{{ .Values.keycloak.clientId }}"
  frontend:
    VITE_OIDC_AUTHORITY: "{{ .Values.keycloak.issuerUri }}"
    VITE_OIDC_CLIENT_ID: "{{ .Values.keycloak.clientId }}"
    VITE_OIDC_REDIRECT_URI: "https://identifica.tkg-des.nuvem.unicamp.br/callback"
    VITE_OIDC_SILENT_REDIRECT_URI: "https://identifica.tkg-des.nuvem.unicamp.br/silent-renew.html"
    VITE_OIDC_POST_LOGOUT_REDIRECT_URI: "https://identifica.tkg-des.nuvem.unicamp.br/"

monitoring:
  enabled: true
  serviceMonitor:
    interval: 30s
```

---

## 11. Dockerfiles

**Backend**

```dockerfile
FROM eclipse-temurin:21-jre AS run
WORKDIR /app
COPY build/libs/*.jar app.jar
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC"
EXPOSE 8080
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar app.jar"]
```

**Frontend**

```dockerfile
FROM node:20 AS build
WORKDIR /src
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /src/dist /usr/share/nginx/html
```

---

## 12. Local Development

- `.env` + `docker-compose.yml`  
- Local Postgres container
- Backend & Frontend mapped to localhost ports
- No ArgoCD/K8s interaction required

---

## 13. TLS & Certificates

- Managed by platform via **Cert-Manager / Let’s Encrypt**
- Helm values reference `secretName` only

---

## 14. Runtime Configuration (Frontend)

`config.json` mounted by ConfigMap into `/usr/share/nginx/html/config/config.json`, e.g.:

```json
{
  "VITE_OIDC_AUTHORITY": "https://keycloak.unicamp.br/realms/main",
  "VITE_OIDC_CLIENT_ID": "app-client",
  "VITE_API_BASE_URL": "https://identifica.tkg-des.nuvem.unicamp.br/api"
}
```

---

## 15. Security & CORS

- Backend: conservative CORS; only same-origin hosts permitted
- JWT validation via Keycloak issuer
- HTTPS enforced across all environments

---

## 16. Summary of Integration Points

| Component | Managed by | Notes |
|------------|-------------|-------|
| ArgoCD | Platform | Syncs config-repo |
| Vault | Platform | External Secrets via ESO |
| Harbor | Platform | Robot Account used in CI |
| NGINX Ingress | Platform | TLS via Cert-Manager |
| Prometheus/Grafana | Platform | app exposes `/actuator/prometheus` |
| Kong | Platform | optional API gateway integration |

---

## 17. Next Steps

1. Implement Helm chart skeletons and CI scripts as described.  
2. Validate External Secrets connectivity from ArgoCD namespace.  
3. Configure Harbor robot account and CI variables (`HARBOR_USER`, `HARBOR_PASSWORD`).  
4. Register Keycloak client ID `app-client` per environment.  
5. Create initial `config-repo` with ArgoCD `Application` manifests.  
6. Test deployment on `des` namespace through ArgoCD sync.

---

*Document version 1.0 — prepared for future GitLab hosted mono-repo deployment.*
