# Dados brutos (local)

Coloque aqui os **12 exports CSV** exportados do painel legado Muziks (2016–2017). Estes ficheiros **não** entram no git (ver [`.gitignore`](../.gitignore)).

## Ficheiros esperados

| Ficheiro |
|----------|
| `Muziks - Cadastro de Bares.csv` |
| `Muziks - Clientes que mais buscam.csv` |
| `Muziks - Hitórico de Pedidos por Cliente vs Estabeleimentos.csv` |
| `Muziks - Musicas Mais tocadas - Musicas Mais tocadas.csv` *(preferido; inclui `Genero`)* |
| `Muziks - Músicas mais tocadas.csv` *(legado, sem gênero)* |
| `Muziks - Quantidade de Pedidos por DIA.csv` |
| `Muziks - Quantidade de pedidos por Mes.csv` |
| `Muziks - Quantidade Usuários por Mes.csv` |
| `Muziks - Rank novos usuários por estabelecimento .csv` |
| `Muziks - Termo de busca mais realizado.csv` |
| `Muziks - Termo de busca por estabelecimento.csv` |
| `Muziks - Ultimo Acesso de estabelecimento.csv` |
| `Muziks - Usuários que pediram mais de uma vez.csv` |

**Atenção:** `Cadastro de Bares` contém contactos e, em algumas linhas, credenciais — uso **interno** apenas.

## Amostras no repositório

Agregados sem PII ficam em [`sample/`](sample/) e são gerados por `python run_all.py` em [`../scripts/`](../scripts/):

| Ficheiro | Uso |
|----------|-----|
| `snapshot-metricas.csv` | KPIs do snapshot em [05-insights](../reports/05-insights-para-muziks-hoje.md) |
| `genero-share-reproducoes.csv` | Mix de gênero (total) |
| `genero-share-classificados.csv` | Mix só entre plays com gênero atribuído |
| `top25-musicas-tocadas.csv` | Top faixas + `genero` / `genero_fonte` |
| `top15-artistas-tocadas.csv` | Artistas por reproduções |
| `top10-bares-pedidos.csv` · `top15-bares-usuarios-acum.csv` | Oferta |
| `top25-termos-busca.csv` · `usuarios-por-mes.csv` | Demanda / sazonalidade |
