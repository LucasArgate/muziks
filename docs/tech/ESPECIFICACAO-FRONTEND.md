# Especificação técnica — cliente (PWA)

Este documento **define decisões de arquitetura** para o Muziks no navegador. Não descreve um repositório já implementado; serve para alinhar implementação futura e agentes.

## Forma de entrega: PWA

- **Progressive Web App** como formato principal do cliente, para **aderência rápida** (link, QR, home screen) e **teste de tração** sem fricção de loja de aplicativo.
- **Instalável** (`display: standalone` ou equivalente), **HTTPS** em produção, **manifest** com nome, cores e ícones adequados a marca.
- **Service worker** para cache de shell e assets estáticos; estratégia de dados dinâmicos (fila, votos, regras) fica a cargo da API e pode evoluir (stale-while-revalidate, fila offline opcional, etc.) — detalhar quando o backend existir.

## Stack de UI e linguagem

| Camada | Escolha | Motivo |
|--------|---------|--------|
| UI | **React** | Ecossistema maduro, componentização natural para fila, votação e estados assíncronos. |
| Linguagem | **TypeScript** | Contratos explícitos para regras, IDs de player e payloads de voto. |
| Estilo | **Tailwind CSS** | Base exigida pelo **shadcn/ui**; consistência visual com pouca folha solta. |
| Componentes primitivos | **shadcn/ui** (Radix + tokens) | Acessibilidade e padrão visual sem inventar design system do zero; componentes **copiados** no repo (`components/ui`), não “caixa preta” de lib opaca. |

## Bundler e tooling (quando houver código)

- **Vite** como bundler/dev server do front — encaixa bem com React, TypeScript e plugins de PWA.
- **pnpm** como gerenciador de pacotes do monorepo/app (política do projeto).
- **Plugin de PWA** (ex.: `vite-plugin-pwa` ou equivalente na época da implementação) para gerar/registrar service worker e manifest a partir da build.
- **Lint** (ESLint + regras React/TS) na implementação; **não** obrigar criação de arquivos de teste automatizados neste produto, salvo decisão futura explícita.

## Organização de pastas (alvo)

- Seguir **Atomic Design** conforme [`ATOMIC-DESIGN.md`](./ATOMIC-DESIGN.md): `ui/` só shadcn; `atoms` → `pages` para o domínio Muziks.
- Alias de importação sugerido: `@/` → raiz do código fonte do app (ex.: `src/`), alinhado ao que o shadcn costuma usar.

## O que fica fora desta especificação (por ora)

- Provedor de streaming / SDK de áudio e implicações legais de execução pública.
- Backend, auth, modelo de dados da fila e tempo real (WebSocket, SSE, etc.).
- Estratégia exata de geolocalização (precisão, raio, privacidade) — apenas o produto exige GPS como **modo de descoberta**; a implementação detalha contratos e permissões.

---

*Versão: rascunho de especificação. Ajustar datas e dependências quando o app for criado no repositório.*
