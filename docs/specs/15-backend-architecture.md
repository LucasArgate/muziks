# Arquitetura de backend e API

## Stack e hospedagem

- **PoC:** lógica server em `apps/web` (API Routes / Server Actions) + Supabase — [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md).
- **Futuro:** `apps/api` dedicado com mesma convenção de pastas — [MONOREPO-TURBOREPO.md](../tech/MONOREPO-TURBOREPO.md).
- **Persistência:** PostgreSQL via `packages/db` (Drizzle); domínio conceitual em [03-domain-model.md](03-domain-model.md).
- **Releases:** imagens Docker versionadas — [DOCKER-REGISTRY-E-RELEASES.md](../tech/DOCKER-REGISTRY-E-RELEASES.md).

## Vertical Slice Architecture (não duplicar aqui)

O Muziks organiza API e backend por **caso de uso** (fatia vertical), no mesmo espírito do Atomic Design no cliente.

**Leitura obrigatória antes de criar handlers, rotas ou “services” globais:**

[VERTICAL-SLICE-ARCHITECTURE.md](../tech/VERTICAL-SLICE-ARCHITECTURE.md)

Resumo normativo:

| Regra | Detalhe |
|-------|---------|
| **Unidade de código** | Uma pasta por **intenção** (`vote-on-queue-item`, não `QueueService`) |
| **Compartilhado** | `packages/db`, `packages/types`, `packages/spotify`, `packages/utils` |
| **Complexidade** | Preferir **sub-slice** se há endpoint/ação/spec distintos; **strategy** se é variação de algoritmo na mesma intenção |
| **Documentação** | Specs descrevem comportamentos; strategies só na spec quando visíveis ao dono/config |

## Paridade com o frontend

| Camada | Frontend | Backend |
|--------|----------|---------|
| Organização por feature | `features/` + Atomic Design | `slices/<area>/<use-case>/` |
| Primitivos compartilhados | `packages/ui`, shadcn | `packages/db`, `utils`, adaptadores |

Ver [09-frontend-architecture.md](09-frontend-architecture.md) e [ATOMIC-DESIGN.md](../tech/ATOMIC-DESIGN.md).

## Integrações

- Playback MVP-B: slices em `playback/` (§9.4 do doc 06); SDK/`PlaybackManager` no cliente Master — [06-arquitetura-playback-spotify.md](../mvp/06-arquitetura-playback-spotify.md).
- Catálogo / Spotify / eventos: [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md), [03-viabilidade-integracao-spotify-eda.md](../mvp/03-viabilidade-integracao-spotify-eda.md).

## Qualidade

- `pnpm lint` no escopo alterado.
- **Não** criar arquivos de teste automatizados neste repositório (política do projeto).

## Documentação relacionada

| Documento | Uso |
|-----------|-----|
| [VERTICAL-SLICE-ARCHITECTURE.md](../tech/VERTICAL-SLICE-ARCHITECTURE.md) | Estudo completo: o quê, por quê, strategies vs sub-slices |
| [PROCESSO-DESENVOLVIMENTO.md](../tech/PROCESSO-DESENVOLVIMENTO.md) | Branches, CI/CD |
| [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md) | Comportamento da fila |
