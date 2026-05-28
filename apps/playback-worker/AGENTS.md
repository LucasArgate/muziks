# Orientação para agentes — `apps/playback-worker`

Worker **Node/Trigger.dev** para orquestração de playback em background. Processa **in-process** via `@muziks/playback` + `@muziks/db` — sem HTTP para o `apps/player`.

Leitura obrigatória do monorepo: [`AGENTS.md`](../../AGENTS.md). Docs: [`docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md`](../../docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md), [`docs/tech/LIMITES-DE-USO-E-CONTINGENCIA.md`](../../docs/tech/LIMITES-DE-USO-E-CONTINGENCIA.md).

## Árvore `src/`

```
src/
├── config.ts
├── index.ts
├── playback-orchestrator.ts
├── lib/
│   ├── playback/          # worker afterSample hook + deps
│   ├── realtime/          # Supabase Broadcast (session, queue, track events)
│   ├── spotify/           # Token vault (refresh server-side)
│   ├── supervise/         # createSupervisePorts, supervise-player
│   └── supabase/
└── tasks/
    ├── playback-supervise-player.ts
    ├── playback-supervisor.ts
    ├── playback-realtime-watcher.ts
    └── playback-tick.ts
```

## Regras

- Orquestração compartilhada em [`@muziks/playback`](../../packages/playback) (`tickBackgroundPlayer` + `createDrizzleSpotifyBackgroundPlaybackPorts`).
- Agendamento: `playback-supervise-player` (1 player, auto-`delay` + idempotency), `playback-supervisor` (cron segurança), `playback-realtime-listener` (`postgres_changes` em `player_sessions`).
- Migração `0010_realtime_playback_supervision.sql`: publicar `player_sessions` no Realtime para o listener.
- **Não** chamar `POST /api/internal/playback-tick` — isso era um atalho temporário; o worker fala direto com DB/Spotify/Realtime.
- Lifecycle + dequeue + mirror near-end: hook `afterSample` compartilhado via `@muziks/playback` (`runBackgroundTickSampleEffects` / `createBackgroundTickSampleHook`). Player: [`background-tick-sample-hook.ts`](../player/src/features/playback/services/background-tick-sample-hook.ts). Worker: [`worker-background-tick-sample-hook.ts`](src/lib/playback/worker-background-tick-sample-hook.ts) em `createSupervisePorts`.
- Rate limit/backoff por player: `playback_poll_cursors` (em `@muziks/playback`).
- Não criar arquivos de teste automatizados.
