# Arquitetura de frontend

## Stack fixa

- **Monorepo:** Turborepo + `pnpm` — ver [MONOREPO-TURBOREPO.md](../tech/MONOREPO-TURBOREPO.md).
- **App participante:** Next.js (App Router) em `apps/web` — host `muziks.app/{slug}`.
- **App master (Spotify):** Next.js em `apps/player` (placeholder) — host `player.muziks.app/{slug}`.
- **Blog:** Next.js em `apps/blog` — host `blog.muziks.com.br` (deploy Vercel separado).
- **Legado:** `player.muziks.app/{slug}` concentrava a experiência antiga; o split atual mantém `muziks.app` para participante e reserva `player.muziks.app` para o master — ver [16-ui-player-e-fila.md](16-ui-player-e-fila.md).
- **UI:** React 18 + TypeScript.
- **Estilo:** Tailwind CSS.
- **Componentes:** shadcn/ui em `packages/ui` (primitivos) e composição em `apps/web` — [ATOMIC-DESIGN.md](../tech/ATOMIC-DESIGN.md).
- **Pacotes:** `pnpm` ([AGENTS.md](../../AGENTS.md)).

O empacotador do app é o **Next.js** (não Vite standalone). Utilitários compartilhados ficam em `packages/utils`; tipos em `packages/types`.

## Atomic Design (não duplicar aqui)

A convenção de pastas **atoms → pages** e a relação com shadcn estão em [ATOMIC-DESIGN.md](../tech/ATOMIC-DESIGN.md). Agentes e devs devem ler esse arquivo antes de criar componentes.

No monorepo, a árvore Atomic Design vive principalmente em **`packages/ui`** (átomos/moléculas reutilizáveis) e em **`apps/web/src`** (organismos, templates e páginas do participante). O master em `apps/player` reutiliza `packages/ui` quando existir.

## Rotas e hosts

| Host | App | Rota típica | Responsabilidade |
|------|-----|-------------|------------------|
| `muziks.app` | `apps/web` | `/[slug]` | Hero, fila, votos, busca, pilha de avatares — [16-ui-player-e-fila.md](16-ui-player-e-fila.md) |
| `player.muziks.app` | `apps/player` | `/[slug]` | Login Spotify, playback, sessão do dono — [06-arquitetura-playback-spotify.md](../mvp/06-arquitetura-playback-spotify.md) |
| `blog.muziks.com.br` | `apps/blog` | `/` | Conteúdo institucional |

QR e deep links de descoberta **devem** apontar para `muziks.app/{slug}` ([05-discovery-and-access.md](05-discovery-and-access.md)).

## Convenções complementares (Muziks)

Estas pastas **complementam** o Atomic Design dentro de `apps/web` (caminhos relativos ao app):

| Caminho sugerido | Uso |
|------------------|-----|
| `app/` | Rotas App Router (ex.: `app/[slug]/`, `app/(owner)/`) |
| `src/lib/` ou import de `@muziks/utils` | Utilitários puros |
| `src/hooks/` | Hooks reutilizáveis sem UI |
| `src/features/<nome>/` | Fatias verticais de UI (ex.: `features/player-queue/`) — espelham `slices/` do backend ([15-backend-architecture.md](15-backend-architecture.md)) |
| `packages/ui` | Primitivos shadcn; sem regra de negócio do Muziks |

## Alias

- `@/` → raiz `src/` do app (`apps/web`) ou conforme `tsconfig` do package.
- Imports entre packages: `@muziks/ui`, `@muziks/types`, etc.

## Integração com backend

- PoC: Server Actions e API Routes em `apps/web` + Supabase — [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md).
- Leitura da fila: polling HTTP 3–5 s (não WebSocket por participante no salão).
- Playback (MVP-B): `features/playback/` — [06-arquitetura-playback-spotify.md](../mvp/06-arquitetura-playback-spotify.md).
- Outras integrações abertas: [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md).

## Qualidade

- Alterações de código: `pnpm lint` no escopo alterado (`turbo run lint --filter=...`).
- **Não** criar arquivos de teste automatizados neste repositório (política do projeto).

## Separação de responsabilidades

- **`packages/ui` / `components/ui/`:** apenas primitivos shadcn; sem regra de negócio do Muziks.
- **Regras de negócio e composição de fluxo:** organismos/páginas em `apps/web` + camada de dados — ver [03-domain-model.md](03-domain-model.md).

## Documentação relacionada

| Documento | Uso |
|-----------|-----|
| [ESPECIFICACAO-FRONTEND.md](../tech/ESPECIFICACAO-FRONTEND.md) | PWA, requisitos de cliente |
| [PROCESSO-DESENVOLVIMENTO.md](../tech/PROCESSO-DESENVOLVIMENTO.md) | Branches, ambientes, CI |
| [05-discovery-and-access.md](05-discovery-and-access.md) | Slug, link, QR |
| [16-ui-player-e-fila.md](16-ui-player-e-fila.md) | Layout player participante, hero, fila, avatares |
