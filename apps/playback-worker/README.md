# Muziks Playback Worker

Worker Node/Trigger.dev que **agenda** o tick de playback. A regra de negócio (lifecycle, fila, mirror Spotify) roda no **`apps/player`** via `POST /api/internal/playback-tick` — o worker só delega HTTP para manter uma única fonte de verdade.

## Arquivos principais

- [`trigger.config.ts`](./trigger.config.ts): projeto Trigger.dev, diretório de tasks, runtime e retries.
- [`src/tasks/playback-tick.ts`](./src/tasks/playback-tick.ts): task agendada `playback-tick`.
- [`src/config.ts`](./src/config.ts): leitura das envs obrigatórias do worker.
- [`src/muziks-api-client.ts`](./src/muziks-api-client.ts): cliente HTTP para a rota interna do player.
- [`src/playback-orchestrator.ts`](./src/playback-orchestrator.ts): delegação ao player.
- [`../player/app/api/internal/playback-tick/route.ts`](../player/app/api/internal/playback-tick/route.ts): orquestrador completo (lifecycle + fila).
- [`../../packages/playback/src/domain`](../../packages/playback/src/domain): regras puras de domínio de playback usadas por worker e futuros adapters.
- [`../../packages/db/src/schema/player-sessions.ts`](../../packages/db/src/schema/player-sessions.ts): estado persistido de playback.
- [`../../packages/db/src/schema/playback-poll-cursors.ts`](../../packages/db/src/schema/playback-poll-cursors.ts): orçamento de tick por player.
- [`../../packages/db/src/repositories/spotify-token-vault.ts`](../../packages/db/src/repositories/spotify-token-vault.ts): leitura/refresh de token do dono.
- [`../../docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md`](../../docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md): decisão técnica do worker.

## Quick start (Development)

1. No dashboard Trigger.dev → **Muziks** → **Development** → **API keys**, copie a **Secret key** (`tr_dev_...`).
2. Crie `apps/playback-worker/.env` a partir de [`.env.example`](./.env.example).
3. Use o **mesmo** `PLAYBACK_WORKER_SECRET` do [`apps/player/.env`](../player/.env).
4. Com o player rodando (`pnpm dev:player`), inicie o worker:

```bash
pnpm dev:playback-worker
```

O dashboard deve sair de "Waiting for tasks" e listar a task `playback-tick`.

**Não rode** `trigger init` na raiz do monorepo — o app já está em `apps/playback-worker` com [`trigger.config.ts`](./trigger.config.ts) apontando para `proj_bhvoyepszbvxvbginzgh`.

## MCP no Cursor

O repositório inclui [`.cursor/mcp.json`](../../.cursor/mcp.json) com o MCP oficial do Trigger.dev (escopo **dev-only**, projeto Muziks). Após reiniciar o Cursor:

- Settings → **MCP** → servidor `trigger` com dot verde
- Na primeira ferramenta autenticada, o CLI pede login (`npx trigger.dev@latest login`)

## Env Vars

Essas variáveis precisam existir no ambiente onde a task roda:

```bash
TRIGGER_SECRET_KEY=tr_dev_xxx
TRIGGER_PROJECT_REF=proj_bhvoyepszbvxvbginzgh
MUZIKS_PLAYER_API_URL=https://player.muziks.app
PLAYBACK_WORKER_SECRET=<mesmo valor no apps/player>
PLAYBACK_WORKER_CRON=* * * * *
```

- `TRIGGER_SECRET_KEY`: secret key do ambiente Trigger.dev. Use a key certa para cada ambiente (`tr_dev_...`, `tr_stg_...`, `tr_prod_...`). Não commitar.
- `TRIGGER_PROJECT_REF`: project ref do Trigger.dev usado por [`trigger.config.ts`](./trigger.config.ts). O fallback local é apenas placeholder.
- `MUZIKS_PLAYER_API_URL`: base URL do deploy do player (`http://localhost:3002` em dev — ver `apps/player` `--port 3002`).
- `PLAYBACK_WORKER_SECRET`: Bearer compartilhado com `apps/player` (`PLAYBACK_WORKER_SECRET`). O Vercel Cron do player pode usar `CRON_SECRET` com o mesmo valor.
- `PLAYBACK_WORKER_CRON`: cron da task. Opcional; default atual é `* * * * *`.

**Alternativa sem Trigger.dev:** o [`apps/player/vercel.json`](../player/vercel.json) define cron em `/api/internal/playback-tick` (GET). Configure `CRON_SECRET` = `PLAYBACK_WORKER_SECRET` no projeto Vercel do player.

## Ambientes

### Dev

```bash
TRIGGER_SECRET_KEY=tr_dev_xxx
TRIGGER_PROJECT_REF=proj_bhvoyepszbvxvbginzgh
MUZIKS_PLAYER_API_URL=http://localhost:3002
PLAYBACK_WORKER_SECRET=<mesmo do apps/player>
PLAYBACK_WORKER_CRON=* * * * *
```

Para rodar a task localmente: `pnpm dev:playback-worker` (a partir da raiz) ou `pnpm dev` dentro de `apps/playback-worker`. Não use tokens de staging/prod em dev.

### Staging

Configure as env vars no projeto Trigger.dev (Environment: Staging) e faça deploy:

```bash
pnpm --filter @muziks/playback-worker deploy
```

```bash
TRIGGER_SECRET_KEY=tr_stg_xxx
TRIGGER_PROJECT_REF=proj_bhvoyepszbvxvbginzgh
MUZIKS_PLAYER_API_URL=https://<staging-player>.vercel.app
PLAYBACK_WORKER_SECRET=<mesmo do player staging>
PLAYBACK_WORKER_CRON=* * * * *
```

### Prod

```bash
TRIGGER_SECRET_KEY=tr_prod_xxx
TRIGGER_PROJECT_REF=proj_bhvoyepszbvxvbginzgh
MUZIKS_PLAYER_API_URL=https://player.muziks.app
PLAYBACK_WORKER_SECRET=<mesmo do player prod>
PLAYBACK_WORKER_CRON=* * * * *
```

Em produção, mantenha `TRIGGER_SECRET_KEY` e `PLAYBACK_WORKER_SECRET` somente no Trigger.dev / Vercel, nunca em arquivos versionados.

## Validação

Este app não tem testes automatizados. Para validar tipos/lint:

```bash
pnpm --filter @muziks/playback-worker lint
```

O worker compartilha contrato de banco com `packages/db` e regra de negócio com `packages/playback`. Mudanças em `player_sessions`, `playback_poll_cursors` ou no payload `session.snapshot` devem ser refletidas em [`../../packages/playback`](../../packages/playback), [`../../packages/db/src/schema/player-sessions.ts`](../../packages/db/src/schema/player-sessions.ts) e [`../../packages/types/src/playback/session-broadcast.ts`](../../packages/types/src/playback/session-broadcast.ts).
