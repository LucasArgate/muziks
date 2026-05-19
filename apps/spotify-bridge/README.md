# @muziks/spotify-bridge

Serviço **long-running** (WebSocket + librespot) para observação de playback e chamadas à API interna do Muziks. Roda em **VM/Docker**, não na Vercel.

**Tier:** provisionado **apenas para espaços pagantes** (hosted). Freemium usa Web Playback SDK no `apps/player`. Ver [04-playback-bridge-e-tiering.md](../../docs/business/04-playback-bridge-e-tiering.md).

**Documentação:** [ADR-spotify-state-sync.md](../../docs/tech/ADR-spotify-state-sync.md) · [ADR-librespot-playback-sidecar.md](../../docs/tech/ADR-librespot-playback-sidecar.md)

## Estrutura

```
src/
├── index.ts           # bootstrap
├── config.ts          # env (zod)
├── librespot.ts       # processo librespot --onevent
├── spotify-api.ts     # Web API (placeholder)
├── muziks-api-client.ts
└── ws/server.ts       # WebSocket + GET /health
```

## Desenvolvimento local

```bash
cp apps/spotify-bridge/.env.example apps/spotify-bridge/.env
# Preencher MUZIKS_PLAYER_API_URL e PLAYBACK_WORKER_SECRET (mesmos do apps/player)

pnpm install
pnpm --filter @muziks/spotify-bridge dev
```

- WebSocket: `ws://localhost:8765`
- Health: `http://localhost:8765/health`

### Mensagens WebSocket (v0)

| Cliente → servidor | Descrição |
|--------------------|-----------|
| `{ "type": "ping" }` | Keepalive |
| `{ "type": "subscribe", "playerId": "<uuid>" }` | Associa conexão a um player |

| Servidor → cliente | Descrição |
|--------------------|-----------|
| `bridge.ready` | Handshake |
| `subscribed` | Confirmação |
| `playback.event` | Linha `--onevent` do librespot |
| `pong` / `error` | Respostas |

## Docker

Na raiz do monorepo:

```bash
docker build -f apps/spotify-bridge/Dockerfile -t muziks/spotify-bridge .
```

Ou com compose (a partir desta pasta, com `.env` configurado):

```bash
docker compose -f apps/spotify-bridge/docker-compose.yml up --build
```

**librespot** não vem na imagem base; instale no host ou estenda o Dockerfile. Configure `LIBRESPOT_BIN`.

## Imagem registry

`muziks/spotify-bridge` — ver [DOCKER-REGISTRY-E-RELEASES.md](../../docs/tech/DOCKER-REGISTRY-E-RELEASES.md).
