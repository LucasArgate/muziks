# apps/player

App **master Spotify** — host `player.muziks.com/{slug}`.

## Desenvolvimento

```bash
pnpm dev:player
```

Copie `.env.example` para `.env.local` (Supabase + Spotify + `DATABASE_URL`).

Aplique migrations do banco (uma vez por ambiente):

```bash
pnpm db:migrate
```

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
