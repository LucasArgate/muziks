# Negócio e viabilidade (Muziks)

## Função desta pasta

Esta pasta responde à pergunta **“onde entra o dinheiro?”** de forma **separada** da [viabilidade de custos de infraestrutura](../mvp/02-viabilidade-custos-comparativo.md): custo diz **quanto queima** para rodar; negócio diz **como se paga a conta**, **quem paga** e **como escalar** sem depender só de “mensalidade genérica” ou “fichas”.

| O que fica aqui | O que **não** substitui |
|-----------------|-------------------------|
| Modelos de receita, *packaging*, freemium + OSS | Specs de produto em [`specs/`](../specs/README.md) |
| Hipóteses de *go-to-market*, parceiros, time comercial/marketing | [Fronteiras legais](../specs/14-fronteiras-legais-direitos-autorais.md) — qualquer modelo envolve revisão humana |
| Alinhamento dev/self-host × dono de espaço | [KPIs e loops](../specs/13-kpis-fases-e-loops.md) — métricas operacionais |

## Documentos

| Arquivo | Conteúdo |
|---------|----------|
| [01-receita-rentabilidade-e-go-to-market.md](01-receita-rentabilidade-e-go-to-market.md) | Mapa de mecanismos além de mensal/fichas; OSS + freemium + infra gerenciada; personas (dev × dono); expansão comercial e marketing; aponta para o doc do “rádio do espaço” |
| [02-canal-midia-radio-do-espaco.md](02-canal-midia-radio-do-espaco.md) | “Rádio do espaço”: *spots* no player controlado pelo dono; inventário no salão; dono × rede × SaaS; riscos e manutenção vs specs |
| [03-espaco-romantico-prioridade-e-sustentabilidade.md](03-espaco-romantico-prioridade-e-sustentabilidade.md) | Participante: assinatura/créditos, “espaço romântico”, mensagens, **peso** na ordem dentro do firewall; sustentabilidade emocional do ecossistema |

## Manutenção

- Tratar números e “o mercado aceita X” como **hipóteses** até haver pilotos e dados; atualizar quando houver evidência.
- Baseline histórico (2016–2017, agregado, sem PII): [analytics/README.md](../analytics/README.md) — útil para ICP, piloto 3–5 bares, métrica “noite qualificada” (≥50 participantes) e add-ons (ex. relatórios); ver [05-insights](../analytics/reports/05-insights-para-muziks-hoje.md). Não usar como TAM atual.
- Decisões que **virarem regra de produto** (ex.: “só plano Y tem feature Z”) devem **espelhar** ou **originar** mudança nas specs, não ficar só nesta pasta.
