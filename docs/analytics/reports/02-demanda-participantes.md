# Demanda — participantes

Proxy para KPI **demanda**: profundidade (pedidos por pessoa) e sinais de **loop** (mesmo participante em vários bares). Sem exportar nomes ou Facebook IDs.

## Distribuição de profundidade (ficheiro repeat users)

| faixa_pedidos | participantes |
| --- | --- |
| 2 | 256 |
| 3-5 | 282 |
| 6-20 | 383 |
| 21-100 | 174 |
| 101-500 | 31 |
| 500+ | 3 |

## Pareto

- Participantes no ficheiro: **1,129**
- Pedidos somados no ficheiro: **20,242**
- Top 10% dos participantes concentram **60.1%** dos pedidos

Implicação para [espaço romântico / fichas](../../business/03-espaco-romantico-prioridade-e-sustentabilidade.md): minorias muito ativas existiam — qualquer mecânica de peso na fila precisa de **teto** e firewall.

## Loop (indício) — vários estabelecimentos

- Participantes (por nome no histórico) em **>1** bar: **64**
- Em **≥3** bares: **26**

*Identidade fraca (nome display); MVP deve usar OAuth + player context.*

---

*Gerado em 2026-05-16 13:04 por `docs/analytics/scripts/run_all.py`. Dados legados 2016–2017; nomes de pessoas pseudonimizados.*
