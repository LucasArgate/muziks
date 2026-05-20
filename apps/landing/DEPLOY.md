# Deploy — @muziks/landing (site institucional)

## Vercel

| Campo | Valor |
|-------|-------|
| Nome do projeto | `muziks-landing` |
| Root Directory | `apps/landing` |
| Framework | Next.js |
| Production branch | `main` ou `develop` (conforme GitFlow) |

`vercel.json` nesta pasta define install/build do monorepo.

## Domínios

| Ambiente | Host |
|----------|------|
| **Production** | `muziks.com.br` (apex); opcional `www` → redirect apex |
| **Staging** | `staging.muziks.com.br` |

## Variáveis de ambiente

Referência completa (web + player + landing, staging e prod): [AMBIENTES-E-URLS-PUBLICAS.md](../../docs/tech/AMBIENTES-E-URLS-PUBLICAS.md).

| Variável | Obrigatória no build | Descrição |
|----------|----------------------|-----------|
| `NEXT_PUBLIC_LANDING_APP_URL` | **Sim** | URL pública deste app (`metadataBase`, `/og`, sitemap) |
| `NEXT_PUBLIC_WEB_APP_URL` | Recomendada | Paridade com outros projetos Vercel |
| `NEXT_PUBLIC_PLAYER_APP_URL` | Recomendada | Paridade com outros projetos Vercel |

| Escopo Vercel | `NEXT_PUBLIC_LANDING_APP_URL` | `NEXT_PUBLIC_WEB_APP_URL` | `NEXT_PUBLIC_PLAYER_APP_URL` |
|---------------|-------------------------------|---------------------------|------------------------------|
| **Production** | `https://muziks.com.br` | `https://muziks.app` | `https://player.muziks.app` |
| **Preview** (staging) | `https://staging.muziks.com.br` | `https://staging.muziks.app` | `https://staging-player.muziks.app` |

Local: `apps/landing/.env.example` → `.env.local` (`NEXT_PUBLIC_LANDING_APP_URL=http://localhost:3001`).

## Cloudflare

- CNAME para o projeto Vercel
- SSL/TLS: **Full (strict)**
