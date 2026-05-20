# Ambientes e URLs públicas (`NEXT_PUBLIC_*_APP_URL`)

Três variáveis definem as URLs canônicas de cada app no monorepo. O código **não** usa domínio fixo de produção — cada deploy lê o valor do escopo Vercel (**Production** ou **Preview** / staging).

| Variável | Pacote | Papel |
|----------|--------|--------|
| `NEXT_PUBLIC_WEB_APP_URL` | `@muziks/web` | Participante — fila, votos, OAuth (`muziks.app`) |
| `NEXT_PUBLIC_PLAYER_APP_URL` | `@muziks/player` | Master Spotify — playback, OAuth player (`player.muziks.app`) |
| `NEXT_PUBLIC_LANDING_APP_URL` | `@muziks/landing` | Site institucional — SEO, `/og`, sitemap (`muziks.com.br`) |

Implementação: `apps/web/src/config/env.ts`, `apps/player/src/config/app-urls.ts`, `apps/landing/src/config/app-urls.ts`.

---

## Matriz staging vs produção

| App | Production | Preview / staging |
|-----|------------|-------------------|
| **Web** | `https://muziks.app` | `https://staging.muziks.app` |
| **Player** | `https://player.muziks.app` | `https://staging-player.muziks.app` |
| **Landing** | `https://muziks.com.br` | `https://staging.muziks.com.br` |

**Regra:** em Preview, as três URLs devem ser as de **staging** (tabela acima). Não copiar valores de Production para Preview — links cruzados (web ↔ player) e OAuth quebram se misturar ambientes.

---

## Configuração na Vercel (por projeto)

Cada projeto Next.js tem seu **Root Directory** (`apps/web`, `apps/player`, `apps/landing`). As variáveis `NEXT_PUBLIC_*` entram no build daquele app (`turbo.json` → `build.env`).

### `muziks-web` (`apps/web`)

| Variável | Production | Preview |
|----------|------------|---------|
| `NEXT_PUBLIC_WEB_APP_URL` | `https://muziks.app` | `https://staging.muziks.app` |
| `NEXT_PUBLIC_PLAYER_APP_URL` | `https://player.muziks.app` | `https://staging-player.muziks.app` |
| `NEXT_PUBLIC_LANDING_APP_URL` | `https://muziks.com.br` | `https://staging.muziks.com.br` |

Obrigatórias no código do web hoje: `WEB` + `PLAYER`. `LANDING` é recomendada para paridade entre projetos (links institucionais futuros).

### `muziks-player` (`apps/player`)

| Variável | Production | Preview |
|----------|------------|---------|
| `NEXT_PUBLIC_PLAYER_APP_URL` | `https://player.muziks.app` | `https://staging-player.muziks.app` |
| `NEXT_PUBLIC_WEB_APP_URL` | `https://muziks.app` | `https://staging.muziks.app` |
| `NEXT_PUBLIC_LANDING_APP_URL` | `https://muziks.com.br` | `https://staging.muziks.com.br` |

Obrigatórias no código do player hoje: `PLAYER` + `WEB`.

Redirect Spotify (Dashboard): `…/api/spotify/callback` em cada host player (prod e staging). Ver [apps/player/DEPLOY.md](../../apps/player/DEPLOY.md).

### `muziks-landing` (`apps/landing`)

| Variável | Production | Preview |
|----------|------------|---------|
| `NEXT_PUBLIC_LANDING_APP_URL` | `https://muziks.com.br` | `https://staging.muziks.com.br` |
| `NEXT_PUBLIC_WEB_APP_URL` | `https://muziks.app` | `https://staging.muziks.app` |
| `NEXT_PUBLIC_PLAYER_APP_URL` | `https://player.muziks.app` | `https://staging-player.muziks.app` |

Obrigatória no código da landing hoje: `LANDING` (`metadataBase`, `og:image`, sitemap, rota `/og`). `WEB` e `PLAYER` recomendadas na Vercel para alinhar com web/player; textos legais na landing ainda citam hosts fixos em copy — evoluir para env quando houver links dinâmicos.

---

## Local (`.env.local`)

| App | Arquivo modelo | URL típica |
|-----|----------------|------------|
| Web | `apps/web/.env.example` | `http://localhost:3000` |
| Player | `apps/player/.env.example` | `http://127.0.0.1:3002` |
| Landing | `apps/landing/.env.example` | `http://localhost:3001` |

Em dev local, cada app usa sua porta; `WEB` e `PLAYER` no `.env` do outro app apontam para essas URLs.

**Landing:** copie `apps/landing/.env.example` → `apps/landing/.env.local` antes de `pnpm build` na raiz, se quiser metadados/OG com URL explícita. Sem `.env.local`, o build **local** usa `http://localhost:3001`; na **Vercel** a variável é obrigatória (falha o deploy se faltar).

---

## DNS (Cloudflare)

| Host | Ambiente | Projeto Vercel |
|------|----------|----------------|
| `muziks.app` | Production | `muziks-web` |
| `staging.muziks.app` | Staging | `muziks-web` (Preview) |
| `player.muziks.app` | Production | `muziks-player` |
| `staging-player.muziks.app` | Staging | `muziks-player` (Preview) |
| `muziks.com.br` | Production | `muziks-landing` |
| `staging.muziks.com.br` | Staging | `muziks-landing` (Preview) |

Matriz de ambientes mais ampla (Supabase, blog): [PROCESSO-DESENVOLVIMENTO.md](PROCESSO-DESENVOLVIMENTO.md) §4.

---

## Checklist pós-deploy

1. Abrir cada URL de staging e prod na tabela acima (200 OK).
2. Landing: `https://<host>/og` retorna PNG.
3. Player staging: login Spotify usa `staging-player.muziks.app`, não prod.
4. Web staging: link “crie o seu player” aponta para `staging-player.muziks.app`.
