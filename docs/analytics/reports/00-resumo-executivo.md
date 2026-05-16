# Resumo executivo — analytics legado Muziks

> Baseline histórico (2016–2017). Não usar como meta de escala do MVP atual.

## Totais

| Métrica | Valor |
|---------|------:|
| Pedidos no histórico (linhas) | 23,211 |
| Soma pedidos por mês (agregado) | 23,211 |
| Participantes no ranking repeat (ficheiro) | 1,129 |
| Estabelecimentos distintos (histórico) | 51 |
| Janela temporal (histórico) | 2016-04-12 → 2017-06-27 |
| Share Poco Loco no histórico de pedidos | 40.4% |

## Catálogo (músicas mais tocadas)

| Métrica | Valor |
|---------|------:|
| Faixas no ranking | 11,454 |
| Reproduções somadas (`Qtd`) | 45,747 |
| Faixas com gênero exportado (`Genero`) | 33 |
| Reproduções com gênero atribuído (pipeline) | 20,792 (45.4%) |

Detalhe de gênero e busca: [04-catalogo-busca-vs-tocada.md](04-catalogo-busca-vs-tocada.md).

## Top 10 estabelecimentos por pedidos (histórico)

| estabelecimento | pedidos |
| --- | --- |
| Poco Loco | 9388 |
| Bar do Nicola | 2615 |
| Player_P02 | 2002 |
| 100 Lanchitos | 1720 |
| Kabana Bar | 1250 |
| Barzin do Dedinho | 1033 |
| Player_P01 | 942 |
| Toca do Boka | 875 |
| Borbas | 829 |
| Dona Bella | 433 |

## Limitações

- **Retenção D14/D28/D90:** não calculável — export pontual, sem identidade estável longitudinal.
- **MAU atual:** não comparável; série `usuários por mês` é proxy global da época.
- Números refletem produto e mercado **2016–2017** (campinas/RMC e entorno).
- **Gênero:** coluna `Genero` preenchida só no topo do ranking; restante via `scripts/genre.py`.

---

*Gerado em 2026-05-16 13:04 por `docs/analytics/scripts/run_all.py`. Dados legados 2016–2017; nomes de pessoas pseudonimizados.*
