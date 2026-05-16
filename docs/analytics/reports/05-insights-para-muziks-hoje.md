# Insights para o Muziks de hoje

Síntese do arquivo **2016–2017** para decisões de PoC/MVP — validar em pilotos antes de meta numérica.

## Snapshot

| indicador | valor |
| --- | --- |
| Pedidos no histórico | 23,211 |
| Pico global (1 dia) | 1,088 em 2017-06-25 |
| Pico bar+dia | Toca do Boka — 588 em 25/6/2017 |
| Pareto top 10% participantes | 60.1% dos pedidos |
| Participantes faixa 500+ pedidos | 3 |
| Poco Loco share pedidos histórico | 40.4% |
| Bares com pedidos (agregado mensal) | 51 |
| Cadastro CRM (total / pendente) | 141 / 136 |
| Reproduções com gênero atribuído | 20,792 (45.4%) |

Relatórios de origem: [00](00-resumo-executivo.md) · [01](01-oferta-players.md) · [02](02-demanda-participantes.md) · [03](03-ponte-pedidos-e-sazonalidade.md) · [04](04-catalogo-busca-vs-tocada.md). Amostras CSV: [`data/sample/`](../data/sample/).

## 1. Infraestrutura — rajada

- **1,088** pedidos num único dia (25/6/2017) e **588** num bar num dia (Toca do Boka) — tráfego **concentrado em horas**, não diluído ([03-ponte](03-ponte-pedidos-e-sazonalidade.md)).
- **Decisão:** votação `POST` HTTP + rate-limit; fila assíncrona de votos; fila/telão por **polling** na Vercel Edge — **não** WebSocket Supabase por participante no *free tier* ([02-viabilidade-custos](../mvp/02-viabilidade-custos-comparativo.md), [11-backend](../../specs/11-backend-and-integrations-open.md)).

## 2. Produto — super usuários e democracia

- Top **10%** dos **1,129** participantes (ficheiro repeat) → **60.1%** dos **20,242** pedidos ([02-demanda](02-demanda-participantes.md)).
- **3** pessoas na faixa **500+** pedidos — sem teto, um participante muito ativo domina a fila percebida.
- **64** participantes usaram **>1** bar; **26** usaram **≥3** — identidade OAuth + contexto de player são obrigatórios para limites justos.
- **Decisão:** cooldown, teto de votos/janela, gamificação no telão **sem** peso ilimitado ([06-queue-voting](../../specs/06-queue-voting-and-chips.md), [05-identidade-fosso](../mvp/05-identidade-fosso-participante-voto.md)).

## 3. Negócio — ICP, cadastro vs tração

- CRM: **141** bares cadastrados, **136** pendentes, **5** ativos no export; só **51** com pedidos no agregado mensal ([01-oferta](01-oferta-players.md)).
- **Poco Loco** concentra **40.4%** dos pedidos do histórico e **1.080** usuários acumulados — modelo de referência para piloto, não a média do cadastro.
- **Dono Bella** e **Vidottinho** têm base de usuários mas **poucos** pedidos (ratio baixo) — cadastro ou telão sem noite «quente» não basta.
- **Métrica de piloto:** ≥1 espaço com **≥50 participantes distintos numa noite** com voto válido — não contar bares «ativados» no CRM ([business/01](../../business/01-receita-rentabilidade-e-go-to-market.md), [13-kpis](../../specs/13-kpis-fases-e-loops.md)).

### Top 5 bares por usuários acumulados

| bar | usuarios_acum |
| --- | --- |
| Poco Loco | 1080 |
| 100 Lanchitos | 297 |
| Dona Bella | 186 |
| Bar do Nicola | 183 |
| Kabana Bar | 142 |

## 4. Curadoria — gênero, busca, firewall

- Busca #1: **«mc lan»**; artista #1 em reproduções: **Mc Lan** (704 plays) — intenção e execução alinhadas no topo ([04-catalogo](04-catalogo-busca-vs-tocada.md)).
- Export `Genero`: **33** faixas no topo; **45.4%** das reproduções classificadas; **54.6%** indefinidas — MVP deve puxar gênero do provedor.
- Entre classificados (**20,792** plays): **FUNK** 39.5%, **ROCK** 26.0%, **SERTANEJO** 23.2%.
- Top **20** faixas: **4** gêneros distintos, **11** funk — mistura extrema no mesmo ranking global.
- Typos frequentes (*Rabetao*, *Open the theca*, *Refem*) → **fuzzy search** + copy de recovery.
- **Firewall** por gênero/artista/dia no painel do dono — não opcional na PoC ([04-rules-firewall](../../specs/04-rules-firewall.md)).

- **11** termos de busca com carga identitária (times/hinos) — política também cobre identidade social, não só «explícito».

## 5. PoC — três entregáveis (prioridade)

| # | Entregável | Critério de pronto |
|---|------------|-------------------|
| 1 | Backend blindado | Rajada simulada (≥30 votos/2 min) sem travar DB; rate-limit por participante |
| 2 | Painel dono + firewall | Bloqueio gênero/artista; política por dia da semana |
| 3 | Piloto 3–5 bares ICP | ≥1 «noite qualificada» (≥50 participantes distintos com voto válido) |

Ver [congelamento-mvp-e-arquitetura.md](../mvp/congelamento-mvp-e-arquitetura.md).

## O que não fazer

- Não citar estes números como TAM/SAM 2026.
- Não publicar CRM, Facebook IDs ou CSV brutos com PII.
- Não prometer retenção D28 com base neste snapshot.
- Não dimensionar infra pela média mensal ignorando picos de fim de semana.
- Não tratar mix de gênero como verdade absoluta sem metadados do provedor no MVP.

---

*Gerado em 2026-05-16 13:04 por `docs/analytics/scripts/run_all.py`. Dados legados 2016–2017; nomes de pessoas pseudonimizados.*
