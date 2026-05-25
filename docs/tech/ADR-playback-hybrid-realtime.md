# ADR: Playback híbrido SDK + API e Realtime Broadcast

**Status:** aceito (implementação Fase 1–2)
**Data:** 2026-05-17

## Contexto

O Player Master sincronizava playback com poll HTTP via Vercel (`GET /api/spotify/playback/state` + `POST .../playback/session`), gerando custo em serverless, Postgres e Spotify. A spec original previa polling da fila pública e Realtime só para baixa cardinalidade.

## Decisão

### 1. Modo `hybrid` (default no browser Master)

| Fonte | Papel |
|-------|--------|
| **Spotify Web Playback SDK** | UI em tempo real (`player_state_changed`) |
| **Spotify Web API** (`GET /me/player`) | Reconciliação: device ativo, faixa alterada noutro cliente, idle |

- Poll da API no **browser** via `GET /api/spotify/playback/state` (perfil **`hybrid`**: ~3,5 s playing/paused, cache ~1,2 s; perfil **`default`** / `api_device`: ~18 s / 35 s). Detalhe de merge, timer, fila Spotify e debug: [PLAYBACK-MASTER-CLIENT-SYNC.md](./PLAYBACK-MASTER-CLIENT-SYNC.md).
- Em divergência, **API vence** para `trackUri`, `deviceId`, `paused`, `status` (`preferSdkProgressInHybrid` não sobrescreve `paused` quando divergiu).
- Modo `api_device`: só API (Connect externo, sem SDK).

### 2. Distribuição de sessão (telão / outras abas)

- **Supabase Realtime Broadcast** no canal `player:{playerId}`, evento `session.snapshot`.
- Master publica após persistência relevante em `player_sessions`.
- `broadcast.self: false` — Master não recebe eco do próprio envio.
- **Não** usar `postgres_changes` por tick de progresso.

### 3. Fila Muziks (snapshot + Broadcast)

| Camada | Escolha |
|--------|---------|
| Fonte de verdade | Postgres (`queue_items`, votos) |
| Leitura inicial | `GET /api/players/{slug}/queue` → `MuziksQueueSnapshot` |
| Atualizações | **Realtime Broadcast** `queue.snapshot` no mesmo canal `player:{playerId}` |
| Clientes | Participantes públicos (`apps/web`), Player Master, telão e painel do dono |

- Cliente: `@supabase/supabase-js` via `createBrowserClient` (`@supabase/ssr`) — `channel().on('broadcast', { event: 'queue.snapshot' }, …)`.
- Participantes públicos assinam o mesmo `queue.snapshot`; o servidor envia snapshot completo já ordenado para evitar reconstrução de regra no browser.
- **Não** usar `postgres_changes` por voto ou reorder; um broadcast por mutação mantém ordem/regras no servidor (`@muziks/queue`).
- Mutadores (vote, dequeue, enqueue, reorder, …) devem chamar `broadcastQueueSnapshotFromServer` após persistir.
- Sensor de fim de faixa (sidecar librespot): [ADR-librespot-playback-sidecar.md](./ADR-librespot-playback-sidecar.md).

## Consequências

- Menos invocações Vercel no hot path de leitura de playback.
- Conexões Realtime por player (participantes, telão e observadores); monitorar cotas Supabase.
- Token Spotify no browser limitado ao dono autenticado; refresh permanece no servidor.

## Fallback

1. Supabase Pro + alertas de conexão
2. Pusher/Ably com mesmo contrato de eventos
3. Poll HTTP para fila pública quando `DISABLE_PUBLIC_REALTIME` ou modo degradado estiver ativo
4. Poll HTTP só para snapshot de sessão (último recurso)

## Referências

- [PLAYBACK-MASTER-CLIENT-SYNC.md](./PLAYBACK-MASTER-CLIENT-SYNC.md) — fluxo implementado no cliente Master (SDK, poll, fila Spotify, timer)
- [ADR-spotify-state-sync.md](./ADR-spotify-state-sync.md) — diagramas consolidados (Master → API → Broadcast; bridge)
- [06-arquitetura-playback-spotify.md](../mvp/06-arquitetura-playback-spotify.md)
- [ADR-librespot-playback-sidecar.md](./ADR-librespot-playback-sidecar.md)
- [STACK-E-FASES-DE-MIGRACAO.md](./STACK-E-FASES-DE-MIGRACAO.md)
