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

- [**Especificações (produto e engenharia)**](docs/specs/README.md) — escopo, domínio, regras, PWA e decisões abertas
- [**Manifesto do produto**](docs/MANIFESTO.md) — princípios e promessa do Muziks
- [**Evidências e inferências (design thinking)**](docs/design-thinking-evidence-and-inferences.md) — relatos de campo e síntese à parte do manifesto
- [**Especificação do cliente (PWA)**](docs/ESPECIFICACAO-FRONTEND.md) — React, TypeScript, Tailwind, shadcn, PWA e tooling previstos
- [**Atomic Design**](docs/ATOMIC-DESIGN.md) — convenção de pastas para UI quando o código existir

## Estado do projeto

Renascimento de um conceito de **2015**. Por ora este repositório concentra **fundamentos em texto** (manifesto, especificação técnica do front, padrão de componentes). A implementação do app entra quando vocês decidirem abrir essa fase.

## Licença

*A definir.*
