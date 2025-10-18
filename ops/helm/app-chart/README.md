# Application Helm Chart

This directory will host the Kubernetes Helm chart that deploys the backend and frontend workloads.

## Values Files

- `values.yaml`
- `values-local.yaml`
- `values-des.yaml`
- `values-hom.yaml`
- `values-prod.yaml`

Populate each file with environment-specific overrides as the project evolves.

## Frontend runtime configuration

The chart can project a ConfigMap into the frontend container for runtime configuration files.

- Enable the resource with `frontend.config.enabled`.
- Provide file contents via `frontend.config.data` (keys map to filenames inside the ConfigMap).
- Control where the file is mounted with `frontend.config.mountPath` (defaults to `/usr/share/nginx/html/config/config.json`).
- Ensure the data map contains a key matching the basename of the mount path so the file can be mounted from the ConfigMap.

## Backend monitoring

- Configure the ServiceMonitor scrape path with `backend.monitoring.serviceMonitor.path` (defaults to `/actuator/prometheus`).
  This aligns with the backend's Spring Boot actuator configuration.
