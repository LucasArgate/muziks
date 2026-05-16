# Muziks

Player **democrático** e **geoposicionado**: quem está no lugar certo (ou entra pelo link / QR Code / nome do player) pode **influenciar a fila** — escolhendo dentro das regras ou **votando** para subir músicas no ranking — enquanto o **dono do player** define políticas claras por gênero, artista, música, dia da semana e, quando fizer sentido, **fichas** para voto.

Leia o [**Manifesto**](docs/MANIFESTO.md) para a visão completa: hierarquia de permissões, cortesia quando algo não é permitido, e a separação entre **receita de fichas (participação)** e **licenciamento de obras**.

## Em uma linha

Democracia na fila com **firewall de som**: o público participa; o espaço manda na política.

## O que o Muziks propõe

| Ideia | Resumo |
|--------|--------|
| **Acesso ao player** | GPS (lat/lng), nome único, link ou QR Code |
| **Regras em camadas** | Gênero → artista → música; bloqueio e liberação finos |
| **Calendário** | Políticas diferentes por dia da semana |
| **Fila** | Votos aumentam prioridade no ranking das faixas já elegíveis |
| **Fichas** | Opcional: custo no **voto**, não na “compra” da música |
| **UX** | Feedback amigável quando uma escolha não é permitida |

## Documentação

- [**Roadmap da jornada**](docs/ROADMAP.md) — fases, calendário (datas a calibrar), ciclos IA-first e ritos com time e stakeholders
- [**Especificações (produto e engenharia)**](docs/specs/README.md) — escopo, domínio, regras, PWA e decisões abertas
- [**Fronteiras legais e direitos autorais**](docs/specs/14-fronteiras-legais-direitos-autorais.md) — o Muziks não vende obras nem substitui ECAD/streaming; base para termos legais
- [**Manifesto do produto**](docs/MANIFESTO.md) — princípios e promessa do Muziks
- [**Evidências e inferências (design thinking)**](docs/disruption/design-thinking-evidence-and-inferences.md) — relatos de campo e síntese à parte do manifesto
- [**Disrupções: mapa de dores e soluções**](docs/disruption/mapa-dores-e-solucoes.md) — liga evidências de campo a princípios e specs
- [**Especificação do cliente (PWA)**](docs/tech/ESPECIFICACAO-FRONTEND.md) — React, TypeScript, Tailwind, shadcn, PWA e tooling previstos
- [**Atomic Design**](docs/tech/ATOMIC-DESIGN.md) — convenção de pastas para UI quando o código existir

## Estado do projeto

Renascimento de um conceito de **2015** (raízes que remontam a **2013** no propósito de conectar pessoas no som). Por ora este repositório concentra **fundamentos em texto** (manifesto, especificação técnica do front, padrão de componentes). O mapa de fases, aprendizado e lançamento está em [**docs/ROADMAP.md**](docs/ROADMAP.md); a implementação do app entra quando a fase correspondente for aberta explicitamente.

## Licença

*A definir.*
