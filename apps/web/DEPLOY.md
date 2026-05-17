# Deploy — @muziks/web (aplicação do player)

## Vercel

| Campo | Valor |
|-------|-------|
| Nome do projeto | `muziks-web` |
| Root Directory | `apps/web` |
| Framework | Next.js |
| Production branch | `main` ou `staging` (conforme GitFlow) |

`vercel.json` nesta pasta define install/build do monorepo.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Service role (API + cifra de tokens) |
| `DATABASE_URL` | Sim | Transaction pooler (porta 6543) |
| `NEXT_PUBLIC_WEB_APP_URL` | Sim | URL pública do participante (ex.: `https://muziks.app`) |
| `NEXT_PUBLIC_PLAYER_APP_URL` | Sim | URL do player master — link "crie o seu player" |
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` | Sim | Client ID Spotify |
| `SPOTIFY_CLIENT_SECRET` | Sim | OAuth participante |

| Escopo Vercel | `NEXT_PUBLIC_WEB_APP_URL` | `NEXT_PUBLIC_PLAYER_APP_URL` |
|---------------|---------------------------|------------------------------|
| **Production** | `https://muziks.app` | `https://player.muziks.app` |
| **Preview / staging** | `https://staging.muziks.app` | `https://staging-player.muziks.app` |

## Domínios

- **Produção:** `muziks.app`
- **Staging (futuro):** `staging.muziks.app`

## Cloudflare

- CNAME para o projeto Vercel
- SSL/TLS: **Full (strict)**
