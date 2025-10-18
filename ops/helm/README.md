# Helm Operations

Helm charts and deployment manifests that support the mono-repo applications.

## Render templates locally

You can inspect the rendered Kubernetes manifests without installing them by using [`helm template`](https://helm.sh/docs/helm/helm_template/):

```bash
helm template app ops/helm/app-chart \
  --namespace <target-namespace> \
  --values ops/helm/app-chart/values.yaml
```

Override files such as `values-des.yaml`, `values-hom.yaml`, and `values-prod.yaml` can be layered by adding extra `--values` flags.
