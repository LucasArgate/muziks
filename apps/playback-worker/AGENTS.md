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

- Usar `@muziks/db` para leitura/escrita do estado de playback em background.
- Publicar `session.snapshot` via Supabase Realtime após persistência aceita.
- Rate limit/backoff por player fica em `playback_poll_cursors`.
- Não criar arquivos de teste automatizados.
