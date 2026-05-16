# Ponte — pedidos e sazonalidade

Proxy para **sessão com valor**: volume diário e concentração por player.

## Usuários por mês (global)

| ano | mes | total_usuarios |
| --- | --- | --- |
| 2016 | 4 | 292 |
| 2016 | 5 | 168 |
| 2016 | 6 | 203 |
| 2016 | 7 | 133 |
| 2016 | 8 | 189 |
| 2016 | 9 | 160 |
| 2016 | 10 | 102 |
| 2016 | 11 | 234 |
| 2016 | 12 | 149 |
| 2017 | 1 | 72 |
| 2017 | 2 | 67 |
| 2017 | 3 | 134 |
| 2017 | 4 | 140 |
| 2017 | 5 | 385 |
| 2017 | 6 | 306 |

## Pico global diário

- Data: **2017-06-25** — **1,088** pedidos (soma todos os bares)
- Maior linha única bar+dia: **Toca do Boka** em **25/6/2017** — **588** pedidos

## Junho/2017 — maiores dias por bar (amostra)

| dia | bar | pedidos |
| --- | --- | --- |
| 25 | Toca do Boka | 588 |
| 25 | Mosna Tabacaria | 349 |
| 13 | Poco Loco | 339 |
| 20 | Kabana Bar | 199 |
| 22 | Poco Loco | 187 |
| 14 | Kabana Bar | 180 |
| 21 | Kabana Bar | 176 |
| 23 | Poco Loco | 165 |
| 20 | Poco Loco | 142 |
| 24 | Toca do Boka | 129 |
| 25 | Kabana Bar | 129 |
| 23 | Kabana Bar | 118 |

## Liquidez (leitura qualitativa)

Picos extremos em poucos bares/dias sugerem **eventos** ou testes intensivos — não assumir fila viva contínua sem métrica de 'sessão seca' (indisponível no export).

---

*Gerado em 2026-05-16 12:54 por `docs/analytics/scripts/run_all.py`. Dados legados 2016–2017; nomes de pessoas pseudonimizados.*
