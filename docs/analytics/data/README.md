# Dados brutos (local)

Coloque aqui os **12 exports CSV** exportados do painel legado Muziks (2016–2017). Estes ficheiros **não** entram no git (ver [`.gitignore`](../.gitignore)).

## Ficheiros esperados

| Ficheiro |
|----------|
| `Muziks - Cadastro de Bares.csv` |
| `Muziks - Clientes que mais buscam.csv` |
| `Muziks - Hitórico de Pedidos por Cliente vs Estabeleimentos.csv` |
| `Muziks - Músicas mais tocadas.csv` |
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

Agregados sem PII ficam em [`sample/`](sample/) e são gerados por `python run_all.py` em [`../scripts/`](../scripts/).
