# apps/player

App **master Spotify** — host `player.muziks.com/{slug}`.

## Desenvolvimento

```bash
pnpm dev:player
```

Copie `.env.example` para `.env.local` e preencha o app Spotify (PKCE + Web Playback SDK).

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing mínima |
| `/{slug}` | Painel master do espaço |
| `/api/spotify/login` | Início OAuth (PKCE) |
| `/api/spotify/callback` | Callback OAuth |
| `/api/spotify/token` | Access token para o SDK |
| `/api/spotify/logout` | Encerra sessão |

## Referências

- [06-arquitetura-playback-spotify.md](../../docs/mvp/06-arquitetura-playback-spotify.md)
- [MONOREPO-TURBOREPO.md](../../docs/tech/MONOREPO-TURBOREPO.md)
- [DEPLOY.md](./DEPLOY.md)
