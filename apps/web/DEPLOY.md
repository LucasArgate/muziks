# Deploy — @muziks/web (aplicação do player)

## Vercel

| Campo | Valor |
|-------|-------|
| Nome do projeto | `muziks-web` |
| Root Directory | `apps/web` |
| Framework | Next.js |
| Production branch | `main` ou `staging` (conforme GitFlow) |

`vercel.json` nesta pasta define install/build do monorepo.

## Domínios

- **Produção:** `muziks.app`
- **Staging (futuro):** `staging.muziks.app`

## Cloudflare

- CNAME para o projeto Vercel
- SSL/TLS: **Full (strict)**
