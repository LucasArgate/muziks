# Orientação para agentes — `apps/playback-worker`

Worker **Node/Trigger.dev** para orquestração de playback em background. Ele chama APIs internas do `apps/player` e não escreve direto no banco.

Leitura obrigatória do monorepo: [`AGENTS.md`](../../AGENTS.md). Docs: [`docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md`](../../docs/tech/TRIGGER-DEV-PLAYBACK-ORCHESTRATION.md), [`docs/tech/LIMITES-DE-USO-E-CONTINGENCIA.md`](../../docs/tech/LIMITES-DE-USO-E-CONTINGENCIA.md).

## Árvore `src/`

```
src/
├── config.ts
├── index.ts
├── muziks-api-client.ts
└── tasks/
    └── playback-tick.ts
```

## Regras

- Não importar Drizzle nem `@muziks/db` neste app.
- Sempre chamar rotas internas do `apps/player` com `PLAYBACK_WORKER_SECRET`.
- Rate limit/backoff por player fica no domínio do `apps/player`; o worker agenda e observa resultado.
- Não criar arquivos de teste automatizados.
