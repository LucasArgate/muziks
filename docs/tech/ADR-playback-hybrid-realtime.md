# ADR: Playback híbrido SDK + API e Realtime Broadcast

**Status:** aceito (implementação Fase 1–2)
**Data:** 2026-05-17

## Contexto

O Player Master sincronizava playback com poll HTTP via Vercel (`GET /api/spotify/playback/state` + `POST .../playback/session`), gerando custo em serverless, Postgres e Spotify. A spec original previa polling da fila pública e Realtime só para baixa cardinalidade.

## Decisão

### 1. Autoridade `sdk_browser` (default no browser Master)

| Fonte | Papel |
|-------|--------|
| **Spotify Web Playback SDK** | Fonte viva quando o Muziks Player toca no navegador (`player_state_changed`) |
| **Spotify Web API** (`GET /me/player`) | Reconciliação pontual e fonte de background quando o device ativo não é o SDK |

- O Master **não** mantém poll Web API contínuo quando o SDK está saudável, visível e é o device ativo. Nessa condição, o SDK publica `state_source = sdk_browser` em `player_sessions` e emite `session.snapshot`.
- A Web API entra por eventos pontuais no browser: transfer/control, volta de visibilidade, SDK `not_ready`, divergência detectada ou transição para background.
- Modo `api_device` / background: o worker chama Web API com orçamento e backoff; esse caminho publica `state_source = worker_api`.
- Detalhe de merge, timer, fila Spotify e debug: [PLAYBACK-MASTER-CLIENT-SYNC.md](./PLAYBACK-MASTER-CLIENT-SYNC.md).

### 2. Distribuição de sessão (telão / outras abas)

- **Supabase Realtime Broadcast** no canal `player:{playerId}`, evento `session.snapshot`.
- Master SDK ou worker publica após persistência relevante em `player_sessions`.
- `broadcast.self: false` — Master não recebe eco do próprio envio.
- **Não** usar `postgres_changes` por tick de progresso.

### 3. Fila Spotify nativa (snapshot + Broadcast)

| Camada | Escolha |
|--------|---------|
| Fonte de verdade | Spotify Web API (`GET /me/player/queue`) ou SDK `track_window` no Master |
| Distribuição | **Realtime Broadcast** `spotify.queue.snapshot` no canal `player:{playerId}` |
| Payload | `NormalizedSpotifyPlaybackQueue` + `queueVersion` + `source` (`sdk_browser` \| `worker_api` \| `browser_api`) |
| Clientes | Player Master, participantes (`apps/web`) |

- Master publica via `SpotifyQueuePublisher` (SDK ou reconciliação pontual da API no browser).
- `playback-worker` publica após mudança semântica de faixa ao supervisionar `api_device`.
- **Sem** coluna Postgres na fase 1; poll HTTP (`GET .../playback/spotify-queue`) só como fallback degradado no web.
- Master em `api_device` com `authority = worker`: **sem** poll contínuo de state/queue no browser; reconciliação pontual quando a aba está visível (híbrido).

### 4. Fila Muziks (snapshot + Broadcast)

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

- Menos invocações Vercel/Spotify no hot path quando o browser SDK toca o áudio.
- Conexões Realtime por player (participantes, telão e observadores); monitorar cotas Supabase.
- Token Spotify no browser limitado ao dono autenticado; refresh permanece no servidor.

## Fallback

1. Supabase Pro + alertas de conexão
2. Pusher/Ably com mesmo contrato de eventos
3. Poll HTTP para fila pública quando `DISABLE_PUBLIC_REALTIME` ou modo degradado estiver ativo
4. Poll HTTP só para snapshot de sessão (último recurso)

## Referências

- [PLAYBACK-MASTER-CLIENT-SYNC.md](./PLAYBACK-MASTER-CLIENT-SYNC.md) — fluxo implementado no cliente Master (SDK como autoridade, reconciliação pontual, fila Spotify, timer)
- [ADR-spotify-state-sync.md](./ADR-spotify-state-sync.md) — diagramas consolidados (Master → API → Broadcast; bridge)
- [06-arquitetura-playback-spotify.md](../mvp/06-arquitetura-playback-spotify.md)
- [ADR-librespot-playback-sidecar.md](./ADR-librespot-playback-sidecar.md)
- [STACK-E-FASES-DE-MIGRACAO.md](./STACK-E-FASES-DE-MIGRACAO.md)
