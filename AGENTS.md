# Orientação para agentes (Muziks)

- **Escopo atual:** repositório focado em **documentação e especificações** (produto + front). **Não** criar scaffold de app, `package.json` ou pastas `src/` a menos que o pedido seja explicitamente implementar código.
- **Quando houver implementação:** seguir [`docs/tech/ESPECIFICACAO-FRONTEND.md`](docs/tech/ESPECIFICACAO-FRONTEND.md) (PWA, React, TypeScript, Tailwind, shadcn) e [`docs/tech/ATOMIC-DESIGN.md`](docs/tech/ATOMIC-DESIGN.md) para estrutura de componentes; API/backend em [`docs/tech/VERTICAL-SLICE-ARCHITECTURE.md`](docs/tech/VERTICAL-SLICE-ARCHITECTURE.md) (Vertical Slice, paridade com Atomic Design); stack, monorepo e processo em [`docs/tech/STACK-E-FASES-DE-MIGRACAO.md`](docs/tech/STACK-E-FASES-DE-MIGRACAO.md), [`MONOREPO-TURBOREPO.md`](docs/tech/MONOREPO-TURBOREPO.md) e [`PROCESSO-DESENVOLVIMENTO.md`](docs/tech/PROCESSO-DESENVOLVIMENTO.md).
- **Pacote:** quando existir app, usar **`pnpm`** para dependências e scripts.
- **Testes:** não criar arquivos de teste automatizados neste repo, salvo pedido explícito em contrário.
