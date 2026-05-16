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

- **Produção:** `muziks.com.br` (apex)
- **Opcional:** `www.muziks.com.br` → redirect para o apex

## Cloudflare

- CNAME para o projeto Vercel
- SSL/TLS: **Full (strict)**
