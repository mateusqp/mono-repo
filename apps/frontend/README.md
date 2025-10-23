# Frontend application

This project contains a Vite + React single-page application written in TypeScript. It uses
[`oidc-client-ts`](https://github.com/authts/oidc-client-ts) to authenticate users against the
blueprint identity provider and demonstrates silent token renewal and route protection.

## Getting started

```bash
cd apps/frontend
npm install
npm run dev
npm test
```

The development server listens on port `5173` by default. Override OIDC settings with environment
variables prefixed with `VITE_` in a `.env.local` file or shell exports:

```bash
VITE_OIDC_AUTHORITY="http://keycloak:8080/realms/app-local"
VITE_OIDC_CLIENT_ID="app-frontend"
VITE_OIDC_REDIRECT_URI="http://localhost:5173/callback"
VITE_OIDC_SILENT_REDIRECT_URI="http://localhost:5173/silent-renew"
VITE_OIDC_POST_LOGOUT_REDIRECT_URI="http://localhost:5173/"
VITE_OIDC_SCOPE="openid profile email"
```

When running through `docker compose` the Keycloak realm imported from
[`ops/keycloak/realm-local.json`](../../ops/keycloak/realm-local.json) already contains a public
client named `app-frontend` with PKCE enforcement and the redirect URIs above. The default users can
sign in with password `Senha123`; see the repository root [`README.md`](../../README.md) for the full list of
test accounts and attributes (`cpf`, `matricula`, `unidade`).

## Runtime configuration

The app fetches `/config/config.json` before rendering so deployments can adjust identity settings
without rebuilding the bundle. The default file lives in `public/config/config.json` and is copied to
`dist/config/config.json` during the build.

To provide a custom file at runtime (for example in Kubernetes), create a ConfigMap and mount it to
`/usr/share/nginx/html/config/config.json` inside the container:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: web
  labels:
    app.kubernetes.io/name: frontend
    app.kubernetes.io/component: web
    app.kubernetes.io/part-of: mono-repo
    app.kubernetes.io/managed-by: sre
    app.kubernetes.io/environment: production
    app.kubernetes.io/team: frontend
    app.kubernetes.io/owner: platform
    app.kubernetes.io/contact: sre@example.com
spec:
  data:
    config.json: |
      {
        "oidc": {
          "authority": "https://identity.example.com/realms/demo",
          "clientId": "frontend",
          "redirectUri": "https://app.example.com/callback",
          "silentRedirectUri": "https://app.example.com/silent-renew",
          "postLogoutRedirectUri": "https://app.example.com/",
          "scope": "openid profile email offline_access"
        }
      }
```

Any value from `config.json` can be overridden with the matching `import.meta.env` variable at runtime.

## Available scripts

- `npm run dev` – start the local development server.
- `npm run build` – type-check and build production assets in `dist/`.
- `npm run preview` – preview the production build.
- `npm run lint` – run ESLint.
- `npm run format` – apply Prettier to supported files.
- `npm test` – execute the Vitest suite (use `npm test -- --ci --watch=false` in CI environments).

## Docker image

A multi-stage Dockerfile builds the application using Node.js and serves the generated assets with
Nginx 1.27. Mount the runtime configuration file (for example via ConfigMap above) so it is available
at `/usr/share/nginx/html/config/config.json` when the container starts.
