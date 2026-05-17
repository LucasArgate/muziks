# apps/player

App **master Spotify** — host `player.muziks.com/{slug}`.

## Desenvolvimento

Mesmo projeto Supabase que produção (`qgucuffklddzciejdtrb`). Checklist local:

1. Copie `.env.example` → `.env` e `.env.local`.
2. **Supabase → API Keys** → cole `SUPABASE_SERVICE_ROLE_KEY` em `.env.local`.
3. **Connect → Transaction** → mesma `DATABASE_URL` da Vercel (`aws-1-…pooler…:6543`, usuário `postgres.PROJECT_REF`).
4. **Spotify Dashboard** → redirect `http://127.0.0.1:3002/api/spotify/callback` (e o IP da rede, se usar celular).
5. `NEXT_PUBLIC_PLAYER_APP_URL` = host que você abre (`http://127.0.0.1:3002` no PC).
6. Migrations (se banco novo): `pnpm db:migrate` na raiz.

```bash
pnpm dev:player
```

Abra **http://127.0.0.1:3002/login** (não `localhost`, para bater com o redirect).

**Celular na rede:** `NEXT_PUBLIC_PLAYER_APP_URL=http://<seu-ip>:3002`, redirect no Spotify, `PLAYER_ALLOWED_DEV_ORIGINS=<seu-ip>`.

## Auth (dono)

| Camada | Descrição |
|--------|-----------|
| **Muziks** | Supabase Auth (sessão em cookie via `@supabase/ssr`) |
| **Spotify** | OAuth PKCE + cookies httpOnly para Web Playback SDK |

Fluxo: `/login` → Spotify → `/api/spotify/callback` → sessão Supabase + tokens → `/{slug}` ou `/create` (primeiro player).

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Redireciona para login, create ou `/{slug}` |
| `/login` | Entrada com Spotify |
| `/register` | Alias de `/login` |
| `/forget` | Recuperação via Spotify |
| `/create` | Criar player (slug + nome) |
| `/logout` | POST — encerra Muziks + Spotify |
| `/{slug}` | Painel master do espaço |
| `/api/auth/session` | JSON `MuziksSessionView` |
| `/api/spotify/login` | Início OAuth (PKCE) |
| `/api/spotify/callback` | Callback OAuth + auth Muziks |
| `/api/spotify/token` | Access token para o SDK |
| `/api/spotify/logout` | Encerra só sessão Spotify |

Slugs reservados (rotas fixas): `login`, `logout`, `create`, `register`, `forget`.

## Packages

- `@muziks/types` — contratos de estado (`OwnerAuthState`, `PlayerMasterViewState`, …)
- `@muziks/db` — Drizzle (`profiles`, `players`, `spotify_connections`)

## Referências

- [06-arquitetura-playback-spotify.md](../../docs/mvp/06-arquitetura-playback-spotify.md)
- [MONOREPO-TURBOREPO.md](../../docs/tech/MONOREPO-TURBOREPO.md)
- [DEPLOY.md](./DEPLOY.md)
