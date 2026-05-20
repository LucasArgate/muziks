# Orientação para agentes — `apps/spotify-bridge`

Serviço **Node** (librespot + WebSocket) na VM/Docker — sincroniza estado Spotify com a API interna do Muziks. Ver [ADR-spotify-state-sync.md](../../docs/tech/ADR-spotify-state-sync.md).

Leitura obrigatória do monorepo: [`AGENTS.md`](../../AGENTS.md).

## Árvore `src/`

```
src/
├── index.ts           # entrada
├── config.ts
├── librespot.ts
├── spotify-api.ts
├── muziks-api-client.ts
└── ws/server.ts       # WebSocket
```

## Onde colocar código novo

- **Não aplicar** Atomic Design nem `features/` / `slices/` de Next.js.
- Lógica do bridge em módulos planos em `src/` ou subpastas por capacidade (`ws/`, etc.).
- Contratos compartilhados: `packages/types`, `packages/spotify` quando fizer sentido.

## Escopo

- Alterações aqui **não** substituem `apps/player` (UI master) nem `packages/spotify` (cliente HTTP).
- Secrets e env: `.env.example` neste app; não commitar credenciais.

## Qualidade

- `pnpm lint` / build conforme `package.json` do app.
- Não criar arquivos de teste automatizados.
