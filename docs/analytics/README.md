# Analytics — arquivo legado Muziks (2016–2017)

Telemetria operacional recuperada do produto antigo: pedidos, buscas, músicas tocadas e cadastro comercial de bares. Serve como **baseline indiciário** para decisões de produto e negócio — **não** substitui métricas do MVP futuro nem a pesquisa qualitativa de design thinking (ver [limitações](#limitações-metodológicas)).

## Leitura executiva rápida

- O arquivo mostra tração real do app legado em janelas específicas: **23.211 pedidos**, picos concentrados em poucos dias e forte concentração em alguns bares/participantes.
- A conclusão para o Muziks atual é validar em poucos espaços ICP com noite qualificada, firewall e limites de voto; não usar estes números como meta de escala 2026.
- Comece por [00-resumo-executivo.md](reports/00-resumo-executivo.md) e depois leia [05-insights-para-muziks-hoje.md](reports/05-insights-para-muziks-hoje.md) para decisões de PoC/MVP.

## Relatórios

| Ficheiro | Foco |
|----------|------|
| [00-resumo-executivo.md](reports/00-resumo-executivo.md) | Totais, janela temporal, top bares |
| [01-oferta-players.md](reports/01-oferta-players.md) | Bares ativos, tração, cadastro vs uso |
| [02-demanda-participantes.md](reports/02-demanda-participantes.md) | Profundidade, Pareto, multi-bar |
| [03-ponte-pedidos-e-sazonalidade.md](reports/03-ponte-pedidos-e-sazonalidade.md) | Séries temporais, picos diários |
| [04-catalogo-busca-vs-tocada.md](reports/04-catalogo-busca-vs-tocada.md) | Termos de busca vs faixas tocadas |
| [05-insights-para-muziks-hoje.md](reports/05-insights-para-muziks-hoje.md) | Síntese acionável (snapshot + PoC) |

### Amostras em `data/sample/`

| CSV | Conteúdo |
|-----|----------|
| `snapshot-metricas.csv` | Indicadores-chave (picos, Pareto, Poco Loco, catálogo) |
| `genero-share-reproducoes.csv` | Mix de gênero (incl. indefinido) |
| `genero-share-classificados.csv` | Mix só entre plays classificados |
| `top25-musicas-tocadas.csv` | Top faixas com `genero` e fonte |
| `top15-artistas-tocadas.csv` | Artistas por reproduções somadas |
| `top10-bares-pedidos.csv` · `top15-bares-usuarios-acum.csv` | Oferta |
| `top25-termos-busca.csv` · `usuarios-por-mes.csv` | Demanda / ponte |

## Ligação ao produto atual

Métricas modernas (oferta, demanda, ponte, loop): [specs/13-kpis-fases-e-loops.md](../specs/13-kpis-fases-e-loops.md).

| Família KPI | Cobertura neste arquivo |
|-------------|-------------------------|
| Oferta | Parcial (pedidos, último acesso, rank por bar) |
| Demanda | Parcial (MAU mensal, repeat requesters) |
| Ponte | Parcial (pedidos/dia) |
| Loop | Indício (mesmo participante em vários bares) |
| Retenção D14/D28 | **Não** mensurável neste corte |

## Limitações metodológicas

- Dados de **2016–2017**; mercado, stack e produto mudaram.
- A pesquisa de empatia / design thinking **não** tinha registos quantitativos preservados — ver [design-thinking-evidence-and-inferences.md](../disruption/design-thinking-evidence-and-inferences.md).
- Estes exports são **telemetria operacional quantitativa do app antigo**, recuperada depois; use como evidência histórica, não como meta de escala atual.
- Cadastro de bares é CRM interno: [LGPD](../specs/08-nfr-privacy-accessibility.md) — agregados apenas.

## Conteúdo desta pasta

| Item | Descrição |
|------|-----------|
| [schema.md](schema.md) | Dicionário de colunas e chaves de junção |
| [data/](data/README.md) | Exports brutos (**só na sua máquina**, gitignored) |
| [data/sample/](data/sample/) | Agregados sem PII (commitados) |
| [scripts/](scripts/) | Pipeline Python → relatórios Markdown |
| [reports/](reports/) | Relatórios gerados (`00`–`05`) |
| [assets/](assets/) | Opcional: screenshots do painel antigo |

## Como rodar (local)

1. Coloque os 12 CSV em [`data/`](data/README.md) (lista de nomes no README de `data/`).
2. Na pasta `scripts/`:

   ```bash
   cd docs/analytics/scripts
   python -m venv .venv
   # Windows: .venv\Scripts\activate
   # Linux/macOS: source .venv/bin/activate
   pip install -r requirements.txt
   python run_all.py
   ```

   No Windows, se `python` não estiver no PATH: `py -3 run_all.py`.

3. Revise os ficheiros em [`reports/`](reports/) e as amostras em [`data/sample/`](data/sample/).

## O que entra no git

- `reports/*.md`, `data/sample/*.csv`, documentação e scripts.
- **Nunca:** CSV brutos completos, Facebook IDs, nomes reais de participantes/donos, telefones, e-mails ou senhas do cadastro.
- Relatórios e amostras usam **pseudónimos** (`Player_P01`, `Participante_*`, `Conta_D*`) — ver `scripts/pseudonymize.py`.

## Privacidade

- `Cadastro de Bares.csv` contém PII e, em algumas linhas, credenciais — **apenas local**.
- Scripts agregam sem exportar identificadores pessoais nos artefactos commitados.
