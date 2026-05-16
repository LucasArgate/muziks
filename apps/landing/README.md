# apps/landing

Site institucional Muziks (landing page) — domínio **muziks.com.br**.

Marketing, sobre o produto e SEO. Compartilha primitivos de marca via `packages/ui` (`GlassPanel`, `MuziksLogo`); componentes da landing ficam em `src/components/` (Atomic Design).

**Não confundir com `apps/web`** (`muziks.app`) — player participante, fila e votação.

Dev local: `pnpm --filter @muziks/landing dev` (porta **3001**).

Blocos ainda não prontos (nav, formulários, link do app) ficam no DOM e são ocultados via `src/config/landing-visibility.ts` — altere para `true` quando liberar.
