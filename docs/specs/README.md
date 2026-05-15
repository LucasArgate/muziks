# Especificações do Muziks

Este diretório concentra **especificação de produto e engenharia** derivada do [Manifesto](../MANIFESTO.md). O manifesto permanece a **fonte de intenção**; as specs detalham comportamento, escopo e convenções para implementação sem reinterpretar o documento a cada mudança.

## Ordem de leitura sugerida

1. [01-vision-and-scope.md](01-vision-and-scope.md) — visão, MVP, fora de escopo
2. [02-personas-and-journeys.md](02-personas-and-journeys.md) — personas e jornadas
3. [03-domain-model.md](03-domain-model.md) — entidades e invariantes
4. [04-rules-firewall.md](04-rules-firewall.md) — semântica do “firewall” de som
5. [05-discovery-and-access.md](05-discovery-and-access.md) — GPS, slug, link, QR
6. [12-telao-display-publico.md](12-telao-display-publico.md) — modo telão / tela pública (após descoberta)
7. [06-queue-voting-and-chips.md](06-queue-voting-and-chips.md) — fila, votos, fichas
8. [07-ux-copy-and-states.md](07-ux-copy-and-states.md) — estados de UI e tom de voz
9. [08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md) — NFR, LGPD, a11y
10. [09-frontend-architecture.md](09-frontend-architecture.md) — front, pastas, Atomic + shadcn
11. [10-pwa-strategy.md](10-pwa-strategy.md) — PWA e cache
12. [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md) — decisões abertas

## Convenções

- **Idioma:** pt-BR.
- **Normativo:** trechos que usam “deve”, “não deve”, “é obrigatório” descrevem requisitos acordados nesta pasta. Ajustes exigem revisão explícita da spec afetada.
- **Sugestão:** trechos marcados como “pode”, “recomenda-se” ou seções “Aberto / TBD” são orientações ou pendências.
- **Conflito com o manifesto:** prevalece o [Manifesto](../MANIFESTO.md); a spec deve ser corrigida, não o manifesto, salvo decisão de produto formal.

## Manutenção

- Ao fechar uma decisão listada em [11-backend-and-integrations-open.md](11-backend-and-integrations-open.md), **migrar** o texto para a spec relevante (domínio, PWA, NFR, etc.) e reduzir a pendência no doc 11.
- Pequenas correções de redação: PR direto. Mudança de comportamento esperado do produto: atualizar a spec correspondente **e** mencionar no changelog do PR o motivo.

## Documentação relacionada

- [Manifesto do produto](../MANIFESTO.md)
- [Evidências e inferências (design thinking)](../design-thinking-evidence-and-inferences.md) — relatos de campo e síntese à parte do manifesto
- [Atomic Design no Muziks](../ATOMIC-DESIGN.md)
- [AGENTS.md](../../AGENTS.md) — orientação para agentes e tooling (`pnpm`, shadcn, lint)
