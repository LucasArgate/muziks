# Orientação para agentes — `apps/landing`

Landing institucional (`apps/landing`) — marketing, SEO, captura de lead. **Sem** domínio Muziks (fila, playback, auth de player).

Leitura obrigatória do monorepo: [`AGENTS.md`](../../AGENTS.md). Atomic Design: [ATOMIC-DESIGN.md](../../docs/tech/ATOMIC-DESIGN.md).

## Árvore `src/`

```
src/
├── components/     # Atomic Design apenas
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
└── config/         # ex. landing-visibility
```

Rotas em `app/`. Alias: `@/src/...`.

## Onde colocar código novo

- **UI React** → `src/components/` (átomo → template).
- **Config / flags de página** → `src/config/`.
- **Não criar** `src/features/`, `src/slices/`, `src/lib/` de domínio.

## Atenção

O organismo `landing-feature-section` é **nome de componente**, não a pasta `src/features/` dos outros apps.

## Qualidade

- `pnpm lint` no escopo `@muziks/landing` (se existir no workspace).
- Não criar arquivos de teste automatizados.
