# Orientação para agentes — `apps/playback-worker`

Worker **Node/Trigger.dev** para orquestração de playback em background. Ele acessa `@muziks/db` diretamente para reduzir hops HTTP e publica snapshots via Supabase Realtime.

Leitura obrigatória do monorepo: [`AGENTS.md`](../../AGENTS.md). Docs: [`docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md`](../../docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md), [`docs/tech/LIMITES-DE-USO-E-CONTINGENCIA.md`](../../docs/tech/LIMITES-DE-USO-E-CONTINGENCIA.md).

## Árvore `src/`

```
src/
├── config.ts
├── index.ts
├── playback-orchestrator.ts
└── tasks/
    └── playback-tick.ts
```

## Regras

- Delegar o tick para `POST /api/internal/playback-tick` no `apps/player` (paridade com lifecycle e fila).
- Não duplicar regra de negócio em `@muziks/playback` neste app — o player é a autoridade.
- Rate limit/backoff por player fica em `playback_poll_cursors`.
- Não criar arquivos de teste automatizados.
