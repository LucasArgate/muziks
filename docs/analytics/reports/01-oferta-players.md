# Oferta — players (bares)

Proxy para KPI **oferta** em [13-kpis-fases-e-loops.md](../../specs/13-kpis-fases-e-loops.md): players com pedidos, base de usuários acumulada e último acesso no corte.

## Ranking tração (usuários acumulados × pedidos totais)

| nome | usuarios | pedidos_total | ratio_pedidos_por_usuario |
| --- | --- | --- | --- |
| Poco Loco | 1080 | 9388 | 8.69 |
| Bar do Nicola | 183 | 2615 | 14.29 |
| Player_P02 | 28 | 2002 | 71.5 |
| 100 Lanchitos | 297 | 1720 | 5.79 |
| Kabana Bar | 142 | 1250 | 8.8 |
| Barzin do Dedinho | 90 | 1033 | 11.48 |
| Player_P01 | 59 | 942 | 15.97 |
| Toca do Boka | 63 | 875 | 13.89 |
| Borbas | 61 | 829 | 13.59 |
| Dona Bella | 186 | 433 | 2.33 |
| Mosna Tabacaria | 29 | 404 | 13.93 |
| Coyote's Bar | 76 | 377 | 4.96 |
| Mansão do Texugo | 21 | 231 | 11 |
| Vidottinho | 114 | 222 | 1.95 |
| Bar_P03 | 39 | 172 | 4.41 |

## Último acesso — donos (corte do export)

| estabelecimento | ultimo_acesso | dias |
| --- | --- | --- |
| Player_P01 | 2017-06-27 15:30:01.020000 | 0 |
| Toca do Boka | 2017-06-27 15:06:25.180000 | 0 |
| Barzin do Dedinho | 2017-06-27 13:08:48.380000 | 0 |
| Player_P02 | 2017-06-27 11:59:08.430000 | 0 |
| Player_P05 | 2017-06-27 00:50:40.610000 | 0 |
| Player_P04 | 2017-06-26 17:02:05.720000 | 1 |
| Poco Loco | 2017-06-26 17:02:05.720000 | 1 |
| Mosna Tabacaria | 2017-06-25 19:53:13.347000 | 2 |
| Vidottinho | 2017-06-25 15:31:09.040000 | 2 |
| Monsa | 2017-06-24 22:12:02.433000 | 3 |
| Sales eventos | 2017-06-24 21:50:21.537000 | 3 |
| Kabana Bar | 2017-06-24 21:45:27.790000 | 3 |
| Bar_P03 | 2017-06-24 19:54:18.370000 | 3 |
| Engenheiros do Chopp | 2017-06-23 19:24:29.187000 | 4 |
| Matriz do Açai | 2017-06-23 18:13:48.827000 | 4 |

## Cadastro comercial (agregado, sem PII)

| status | quantidade |
| --- | --- |
| Pendente | 136 |
| Ativo | 5 |

- Bares no cadastro: **140**
- Bares com ≥1 pedido (soma mensal): **51**
- Interseção nome normalizado cadastro ∩ pedidos: **7**

*Nomes divergem entre CRM e sistema (ex. Nicola vs Bar do Nicola) — usar ID quando existir.*

---

*Gerado em 2026-05-16 12:54 por `docs/analytics/scripts/run_all.py`. Dados legados 2016–2017; nomes de pessoas pseudonimizados.*
