# Muziks Playback Worker

Worker Node/Trigger.dev responsável por executar o `playback-tick` de sessões em background. Ele usa `@muziks/playback` para a regra de negócio compartilhada, resolve o token do dono pelo vault e publica `session.snapshot` no Supabase Realtime.

## Arquivos principais

- [`trigger.config.ts`](./trigger.config.ts): projeto Trigger.dev, diretório de tasks, runtime e retries.
- [`src/tasks/playback-tick.ts`](./src/tasks/playback-tick.ts): task agendada `playback-tick`.
- [`src/config.ts`](./src/config.ts): leitura das envs obrigatórias do worker.
- [`src/playback-orchestrator.ts`](./src/playback-orchestrator.ts): adapter do worker para config, token vault e Supabase Broadcast.
- [`../../packages/playback/src/application/background-playback-orchestrator.ts`](../../packages/playback/src/application/background-playback-orchestrator.ts): caso de uso compartilhado, escrito contra portas de aplicação.
- [`../../packages/playback/src/infrastructure/drizzle-spotify-background-playback.ts`](../../packages/playback/src/infrastructure/drizzle-spotify-background-playback.ts): adapter Drizzle/Spotify para seleção de players, budget/backoff, consulta Spotify e persistência.
- [`../../packages/playback/src/domain`](../../packages/playback/src/domain): regras puras de domínio de playback usadas por worker e futuros adapters.
- [`../../packages/db/src/schema/player-sessions.ts`](../../packages/db/src/schema/player-sessions.ts): estado persistido de playback.
- [`../../packages/db/src/schema/playback-poll-cursors.ts`](../../packages/db/src/schema/playback-poll-cursors.ts): orçamento de tick por player.
- [`../../packages/db/src/repositories/spotify-token-vault.ts`](../../packages/db/src/repositories/spotify-token-vault.ts): leitura/refresh de token do dono.
- [`../../docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md`](../../docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md): decisão técnica do worker.

## Env Vars

Essas variáveis precisam existir no ambiente onde a task roda:

```bash
TRIGGER_SECRET_KEY=tr_dev_xxx
TRIGGER_PROJECT_REF=proj_xxx
DATABASE_URL=postgres://...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_TOKEN_ENCRYPTION_KEY=...
PLAYBACK_WORKER_CRON=* * * * *
```

- `TRIGGER_SECRET_KEY`: secret key do ambiente Trigger.dev. Use a key certa para cada ambiente (`tr_dev_...`, `tr_stg_...`, `tr_prod_...`). Não commitar.
- `TRIGGER_PROJECT_REF`: project ref do Trigger.dev usado por [`trigger.config.ts`](./trigger.config.ts). O fallback local é apenas placeholder.
- `DATABASE_URL`: conexão Postgres usada por `@muziks/db`.
- `SUPABASE_URL`: URL do projeto Supabase. Também aceita `NEXT_PUBLIC_SUPABASE_URL` como fallback local.
- `SUPABASE_SERVICE_ROLE_KEY`: usado somente no worker/server para publicar Broadcast e, se necessário, como fallback de chave de criptografia.
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`: credenciais do app Spotify para refresh server-side do token do dono.
- `SPOTIFY_TOKEN_ENCRYPTION_KEY`: chave para descriptografar tokens salvos no vault. Se ausente, o worker usa `SUPABASE_SERVICE_ROLE_KEY`, mantendo compatibilidade com o padrão atual.
- `PLAYBACK_WORKER_CRON`: cron da task. Opcional; default atual é `* * * * *`.

## Ambientes

### Dev

Use a secret key DEV do Trigger.dev:

```bash
TRIGGER_SECRET_KEY=tr_dev_xxx
TRIGGER_PROJECT_REF=proj_xxx
DATABASE_URL=postgres://...
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<service-role local>
SPOTIFY_CLIENT_ID=<spotify dev app>
SPOTIFY_CLIENT_SECRET=<spotify dev secret>
SPOTIFY_TOKEN_ENCRYPTION_KEY=<mesma chave usada para gravar o vault local>
PLAYBACK_WORKER_CRON=* * * * *
```

Para rodar a task localmente, use a CLI do Trigger.dev a partir desta pasta, carregando o `.env` local. Não use tokens de staging/prod em dev.

### Staging

Use a secret key STAGING e o banco/Supabase do staging:

```bash
TRIGGER_SECRET_KEY=tr_stg_xxx
TRIGGER_PROJECT_REF=proj_xxx
DATABASE_URL=<postgres staging>
SUPABASE_URL=https://<staging-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role staging>
SPOTIFY_CLIENT_ID=<spotify staging/prod app>
SPOTIFY_CLIENT_SECRET=<spotify staging/prod secret>
SPOTIFY_TOKEN_ENCRYPTION_KEY=<mesma chave do vault staging>
PLAYBACK_WORKER_CRON=* * * * *
```

Use um projeto/banco staging separado do prod. O worker vai escrever diretamente em `player_sessions`, então `DATABASE_URL`, `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` precisam apontar para o mesmo ambiente.

### Prod

Use a secret key PROD e o banco/Supabase de produção:

```bash
TRIGGER_SECRET_KEY=tr_prod_xxx
TRIGGER_PROJECT_REF=proj_xxx
DATABASE_URL=<postgres prod>
SUPABASE_URL=https://<prod-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role prod>
SPOTIFY_CLIENT_ID=<spotify prod app>
SPOTIFY_CLIENT_SECRET=<spotify prod secret>
SPOTIFY_TOKEN_ENCRYPTION_KEY=<mesma chave do vault prod>
PLAYBACK_WORKER_CRON=* * * * *
```

Em produção, mantenha `TRIGGER_SECRET_KEY`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SPOTIFY_CLIENT_SECRET` e `SPOTIFY_TOKEN_ENCRYPTION_KEY` somente no provedor de deploy/Trigger.dev, nunca em arquivos versionados.

## Validação

Este app não tem testes automatizados. Para validar tipos/lint:

```bash
pnpm --filter @muziks/playback-worker lint
```

O worker compartilha contrato de banco com `packages/db` e regra de negócio com `packages/playback`. Mudanças em `player_sessions`, `playback_poll_cursors` ou no payload `session.snapshot` devem ser refletidas em [`../../packages/playback`](../../packages/playback), [`../../packages/db/src/schema/player-sessions.ts`](../../packages/db/src/schema/player-sessions.ts) e [`../../packages/types/src/playback/session-broadcast.ts`](../../packages/types/src/playback/session-broadcast.ts).
