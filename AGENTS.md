# Orientação para agentes (Muziks)

- **Pacote:** use `pnpm` (instalar, scripts, adicionar deps).
- **Front:** React (Vite), TypeScript, Tailwind, **shadcn/ui** em `src/components/ui/`.
- **Estrutura de UI:** Atomic Design — leia `docs/ATOMIC-DESIGN.md` antes de criar componentes novos.
- **Aliases:** `@/` aponta para `src/` (ex.: `@/components`, `@/lib/utils`).
- **Novos componentes shadcn:** `pnpm dlx shadcn@latest add <nome>` (mantém `ui/` alinhado ao gerador).
- **Não** subir servidor de dev aqui; o mantenedor roda localmente.
- **Testes:** não criar arquivos de teste neste repo; validar com `pnpm lint` quando houver mudança em código.
