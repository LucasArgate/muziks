# Muziks

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/images/identity/muziks-white.png">
    <source media="(prefers-color-scheme: light)" srcset="docs/images/identity/muziks-dark.png">
    <img src="docs/images/identity/muziks-dark.png" alt="Logotipo Muziks" width="400" />
  </picture>
</p>

Repositório dos **fundamentos** do produto Muziks: visão, especificações, MVP, viabilidade de negócio e pesquisa de campo — em texto, para alinhar decisões antes e durante a implementação. O código da aplicação entra quando a [fase correspondente do roadmap](docs/ROADMAP.md) for aberta explicitamente (ver [AGENTS.md](AGENTS.md)).

## O que é o Muziks (em resumo)

Player colaborativo com **democracia na fila** e **firewall de som**: quem está no espaço (ou entra por link, QR ou nome do player) influencia a ordem dentro das regras; o **dono do espaço** define políticas por gênero, artista, música, calendário e, se fizer sentido, mecanismos como fichas no voto. A promessa completa, hierarquia de permissões e separação entre **participação** e **licenciamento de obras** estão no [Manifesto](docs/MANIFESTO.md).

## Leitura essencial

- [Manifesto](docs/MANIFESTO.md) — princípios e promessa do produto  
- [Roadmap](docs/ROADMAP.md) — fases, ritos e calendário da jornada  

## Documentação por camada

| Camada | Onde |
|--------|------|
| Produto e engenharia | [docs/specs/README.md](docs/specs/README.md) |
| MVP e arquitetura de validação | [docs/mvp/README.md](docs/mvp/README.md) |
| Negócio e *go-to-market* | [docs/business/README.md](docs/business/README.md) |
| Pesquisa, dores e disrupções | [docs/disruption/README.md](docs/disruption/README.md) |
| Analytics (arquivo legado 2016–2017) | [docs/analytics/README.md](docs/analytics/README.md) |
| Legal (licença do repo + marca) | [docs/legal/README.md](docs/legal/README.md) |

**Tech (implementação futura):** [Especificação do cliente (PWA)](docs/tech/ESPECIFICACAO-FRONTEND.md) · [Atomic Design](docs/tech/ATOMIC-DESIGN.md) · [Comunicação e operação (Discord, notificações, MCP admin)](docs/tech/MEIOS-DE-COMUNICACAO-E-OPERACAO.md)

## Agradecimentos

Muziks também existe pelo corre de quem acreditou, ajudou e deu o sangue para tirar a ideia do campo da vontade.

| [![Alcides Silva](https://images.weserv.nl/?url=github.com/alcidessillva.png&h=72&w=72&fit=cover&mask=circle)](https://github.com/alcidessillva) | [![Matheus Borba](https://images.weserv.nl/?url=github.com/mathborba94.png&h=72&w=72&fit=cover&mask=circle)](https://github.com/mathborba94) | ![Lucas Servidoni](https://ui-avatars.com/api/?name=Lucas+Servidoni&background=0D1117&color=FFFFFF&size=72&rounded=true) | ![Nestor Girardi](https://ui-avatars.com/api/?name=Nestor+Girardi&background=0D1117&color=FFFFFF&size=72&rounded=true) |
| :----------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------: |
| [Alcides Silva](https://github.com/alcidessillva)                                                                                                | [Matheus Borba](https://github.com/mathborba94)                                                                                              | Lucas Servidoni                                                                                                          | Nestor Girardi                                                                                                         |

## Agentes e contribuição

Orientação para quem edita o repositório com IA ou manualmente: [AGENTS.md](AGENTS.md) (escopo em documentação, `pnpm` quando houver app, convenções de front).

## Licença e marca

O conteúdo deste repositório está sob [**Apache License 2.0**](LICENSE). Essa licença rege **copyright** sobre código e documentação aqui presentes; **não** concede uso da **marca** “Muziks” além do razoável para descrever a origem da obra, nem trata de **obras musicais** ou ECAD — ver [política de marca e uso do nome](docs/legal/marca-e-uso-do-nome.md) e [fronteiras legais (produto)](docs/specs/14-fronteiras-legais-direitos-autorais.md).

## Estado do projeto

Conceito com raízes em **2013–2019**; hoje o foco deste repo é **fundamento e clareza** (incluindo licença e marca) para evoluir com open source, MVP e parceiros sem ambiguidade na origem do software nem na identidade do produto.
