# Config Repo

Este repositório armazena os manifests e valores Helm da aplicação por ambiente, servindo como fonte de verdade para o Argo CD.

## Estrutura

```
config-repo/
├── apps/
│   └── app-argo-app.yaml
└── environments/
    ├── des/
    │   └── values.yaml
    ├── hom/
    │   └── values.yaml
    ├── local/
    │   └── values.yaml
    └── prod/
        └── values.yaml
```

## Fluxo de promoção

1. Desenvolvedores abrem Pull Requests com alterações em `environments/des/values.yaml`. Após revisão, o merge na branch `main` promove a configuração para o ambiente **DES**.
2. Para promover para **HOM**, abre-se um novo Pull Request que faz merge das mesmas mudanças (ou um cherry-pick) de `des` para `hom`. O merge atualiza `environments/hom/values.yaml`.
3. A promoção para **PROD** segue o mesmo padrão: um Pull Request que replica as alterações aprovadas em HOM para `environments/prod/values.yaml`.

Sempre mantenha as branches sincronizadas na ordem `DES → HOM → PROD`, garantindo que apenas configurações já validadas avancem para ambientes superiores.

## Atualização de tags pelo pipeline

O pipeline de entrega contínua observa a branch `main`. Quando uma nova imagem é publicada, ele atualiza automaticamente as chaves `backend.image.tag` e `frontend.image.tag` nos arquivos `values.yaml` correspondentes ao ambiente alvo e cria um Pull Request. Após o merge:

- O pipeline executa um job que abre um commit atualizando o ambiente seguinte com a nova tag, preparando o próximo passo da promoção.
- O Argo CD detecta a alteração e sincroniza o ambiente configurado com `selfHeal` e `prune` ativos, garantindo que o estado do cluster reflita o repositório.

Caso seja necessário promover manualmente, basta editar o arquivo `values.yaml` do próximo ambiente e seguir o fluxo de merge descrito acima.
