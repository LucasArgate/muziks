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
│   ├── realtime/          # Supabase Broadcast (session.snapshot)
│   ├── spotify/           # Token vault (refresh server-side)
│   └── supabase/
└── tasks/
    └── playback-tick.ts
```

## Regras

- Orquestração compartilhada em [`@muziks/playback`](../../packages/playback) (`runBackgroundPlaybackOrchestrator` + `createDrizzleSpotifyBackgroundPlaybackPorts`).
- **Não** chamar `POST /api/internal/playback-tick` — isso era um atalho temporário; o worker fala direto com DB/Spotify/Realtime.
- Lifecycle + dequeue + mirror near-end com regras de fila: hook `afterSample` no **player** ([`background-tick-sample-hook.ts`](../player/src/features/playback/services/background-tick-sample-hook.ts)). O worker ainda não registra esse hook (só sessão + broadcast).
- Rate limit/backoff por player: `playback_poll_cursors` (em `@muziks/playback`).
- Não criar arquivos de teste automatizados.
