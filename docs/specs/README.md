# Especificações do Muziks

Este diretório concentra **especificação de produto e engenharia** derivada do [Manifesto](../MANIFESTO.md). O manifesto permanece a **fonte de intenção**; as specs detalham comportamento, escopo e convenções para implementação sem reinterpretar o documento a cada mudança.

## Ordem de leitura sugerida

1. [01-vision-and-scope.md](01-vision-and-scope.md) — visão, MVP, fora de escopo
2. [13-kpis-fases-e-loops.md](13-kpis-fases-e-loops.md) — KPIs por fase, loops de crescimento e instrumentação
3. [02-personas-and-journeys.md](02-personas-and-journeys.md) — personas e jornadas
4. [03-domain-model.md](03-domain-model.md) — entidades e invariantes
5. [04-rules-firewall.md](04-rules-firewall.md) — semântica do “firewall” de som
6. [05-discovery-and-access.md](05-discovery-and-access.md) — GPS, slug, link, QR
7. [12-telao-display-publico.md](12-telao-display-publico.md) — modo telão / tela pública (após descoberta)
8. [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md) — fila, votos, fichas
9. [07-ux-copy-and-states.md](07-ux-copy-and-states.md) — estados de UI e tom de voz
10. [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md) — NFR, LGPD, a11y
11. [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md) — o que o Muziks não licencia, ECAD (Brasil), provedores de streaming, guardrails para termos legais
12. [09-frontend-architecture.md](09-frontend-architecture.md) — front, pastas, Atomic + shadcn
13. [16-ui-player-e-fila.md](16-ui-player-e-fila.md) — UI do player participante (hero, fila, avatares, hosts)
14. [10-pwa-strategy.md](10-pwa-strategy.md) — PWA e cache
15. [15-backend-architecture.md](15-backend-architecture.md) — API/backend, Vertical Slice
16. [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md) — decisões abertas
17. [17-feedback-in-app-e-linear.md](17-feedback-in-app-e-linear.md) — feedback in-app, contexto rico, Linear, elegibilidade do backlog

## Convenções

- **Idioma:** pt-BR.
- **Normativo:** trechos que usam “deve”, “não deve”, “é obrigatório” descrevem requisitos acordados nesta pasta. Ajustes exigem revisão explícita da spec afetada.
- **Sugestão:** trechos marcados como “pode”, “recomenda-se” ou seções “Aberto / TBD” são orientações ou pendências.
- **Conflito com o manifesto:** prevalece o [Manifesto](../MANIFESTO.md); a spec deve ser corrigida, não o manifesto, salvo decisão de produto formal.

## Manutenção

- Ao fechar uma decisão listada em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md), **migrar** o texto para a spec relevante (domínio, PWA, NFR, etc.) e reduzir a pendência no doc 11.
- Pequenas correções de redação: PR direto. Mudança de comportamento esperado do produto: atualizar a spec correspondente **e** mencionar no changelog do PR o motivo.

## Documentação relacionada

- [MVP congelado e arquitetura (pasta)](../mvp/README.md) — escopo mínimo viável fechado e decisões de stack para validação
- [Identidade como fosso — participante e voto](../mvp/05-identidade-fosso-participante-voto.md) — OAuth para fila/voto; sinais secundários; dono do player
- [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md) — fronteiras legais, ECAD (Brasil), streaming; base para termos legais
- [Manifesto do produto](../MANIFESTO.md)
- [Design — identidade e sistema visual](../DESIGN.md)
- [Evidências e inferências (design thinking)](../disruption/design-thinking-evidence-and-inferences.md) — relatos de campo e síntese à parte do manifesto
- [Mapa de disrupções: dores e soluções](../disruption/mapa-dores-e-solucoes.md)
- [UI do player e fila](16-ui-player-e-fila.md) — layout participante, legado, hosts
- [Screenshots legados](../images/screens/README.md)
- [Especificação do cliente (PWA)](../tech/ESPECIFICACAO-FRONTEND.md)
- [Atomic Design no Muziks](../tech/ATOMIC-DESIGN.md)
- [Vertical Slice Architecture (API/backend)](../tech/VERTICAL-SLICE-ARCHITECTURE.md)
- [Stack, fases de infra e migração](../tech/STACK-E-FASES-DE-MIGRACAO.md)
- [Processo de desenvolvimento](../tech/PROCESSO-DESENVOLVIMENTO.md) — Linear, git workflow (GitFlow), GitHub Actions (futuro), ambientes
- [Feedback in-app e Linear](17-feedback-in-app-e-linear.md) — widget, screenshot, integração issues, cliente no backlog
- [Monorepo Turborepo](../tech/MONOREPO-TURBOREPO.md)
- [AGENTS.md](../../AGENTS.md) — orientação para agentes e tooling (`pnpm`, shadcn, lint)
