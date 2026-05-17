# Deploy — @muziks/player (master Spotify)

## Vercel

| Campo | Valor |
|-------|-------|
| Nome do projeto | `muziks-player` |
| Root Directory | `apps/player` |
| Framework | Next.js |
| Production branch | `main` ou `staging` (conforme GitFlow) |

`vercel.json` nesta pasta define install/build do monorepo.

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` | Sim | Client ID do app no Spotify Dashboard |
| `NEXT_PUBLIC_PLAYER_APP_URL` | Sim | URL pública (ex.: `https://player.muziks.com`) |
| `SPOTIFY_CLIENT_SECRET` | Recomendada | Refresh no servidor; nunca no cliente |

No Spotify Dashboard, registrar redirect URI:

- Produção: `https://player.muziks.com/api/spotify/callback`
- Local: `http://127.0.0.1:3002/api/spotify/callback` (não usar `localhost`)

Ver [Building with AI (Spotify)](https://developer.spotify.com/documentation/web-api/tutorials/building-with-ai).

## Domínios

- **Produção:** `player.muziks.com`
- **Staging (futuro):** `staging.player.muziks.com`

## Cloudflare

- CNAME para o projeto Vercel
- SSL/TLS: **Full (strict)**
