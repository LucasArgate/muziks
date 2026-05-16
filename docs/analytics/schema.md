# Dicionário de dados (exports legados)

Período coberto: **2016–2017** (corte operacional até **jun/2017**). Chaves de junção entre ficheiros: `EstabelecimentoID` / `ID` + `Nome` (normalizar nomes no script — ex. `Nicola` vs `Bar do Nicola`).

**Pseudonimização:** relatórios e `data/sample/` passam por [`scripts/pseudonymize.py`](scripts/pseudonymize.py) — players/contas de teste (`Player_P01`, …), participantes (`Participante_*`) e termos de busca sensíveis. CSVs brutos em `data/` mantêm nomes reais só na máquina local.

## Ficheiros

### `Muziks - Hitórico de Pedidos por Cliente vs Estabeleimentos.csv`

Fact table de pedidos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Data` | datetime | Momento do pedido |
| `Estabelecimento` | string | Nome do player/bar |
| `Cliente` | string | Nome exibido do participante (**PII** — não commitar agregados com nome) |

### `Muziks - Quantidade de pedidos por Mes.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `ID` | int | ID do estabelecimento |
| `Nome` | string | Nome do bar |
| `Mes` | int | Mês (1–12) |
| `Ano` | int | Ano |
| `Quantidade` | int | Pedidos no mês |

### `Muziks - Quantidade de Pedidos por DIA.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Dia`, `Mes`, `Ano` | int | Data (sem ano completo na coluna Dia) |
| `EstabelecimentoID` | int | ID do bar |
| `Nome` | string | Nome do bar |
| `Quantidade` | int | Pedidos no dia |

### `Muziks - Quantidade Usuários por Mes.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Ano`, `Mes` | int | Período |
| `Total de usuários` | int | Utilizadores distintos (proxy MAU mensal global) |

### `Muziks - Rank novos usuários por estabelecimento .csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Usuarios` | int | Total acumulado de utilizadores no bar |
| `Nome` | string | Nome do estabelecimento |

### `Muziks - Ultimo Acesso de estabelecimento.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `ID` | int | ID interno |
| `Estabelecimento` | string | Nome do bar |
| `Usuario` | string | Conta do dono (**PII**) |
| `UltimoAcesso` | datetime | Último login |
| `Dias` | int | Dias desde o acesso (no corte do export) |

### `Muziks - Usuários que pediram mais de uma vez.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Nome` | string | Participante (**PII**) |
| `FacebookID` | string | ID Facebook (**PII**) |
| `Quantidade` | int | Total de pedidos |

### `Muziks - Clientes que mais buscam.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `FacebookID` | string | (**PII**) |
| `Nome` | string | (**PII**) |
| `EstabelecimentoID` | int | Bar |
| `Quantidade` | int | Buscas |

### `Muziks - Músicas mais tocadas.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `SongID` | int | ID Deezer (legado) |
| `Nome` | string | Título |
| `Artista` | string | Artista |
| `Quantidade` | int | Vezes tocada |

### `Muziks - Termo de busca mais realizado.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| (coluna 1) | string | Termo de busca |
| (coluna 2) | int | Contagem |

### `Muziks - Termo de busca por estabelecimento.csv`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `EstabelecimentoID` | int | Bar |
| `Nome` | string | Bar |
| `Termo` | string | Termo |
| `Contagem` | int | Buscas |

### `Muziks - Cadastro de Bares.csv`

CRM comercial; **não** publicar. Cabeçalho na linha 3. Colunas úteis agregadas: `Bar`, `Cidade/UF`, `Estilo`, `Status` (sem telefone, e-mail, senha).

## Mapa para KPIs atuais

Ver [specs/13-kpis-fases-e-loops.md](../specs/13-kpis-fases-e-loops.md):

| Família KPI | Fonte legada |
|-------------|--------------|
| Oferta (players) | pedidos/mês, rank usuários, último acesso, cadastro Status |
| Demanda (participantes) | usuários/mês, repeat requesters, histórico |
| Ponte (sessão) | pedidos/dia |
| Loop | mesmo cliente em vários estabelecimentos (histórico) |
| Catálogo / firewall | busca vs músicas tocadas |
| Retenção D14/D28 | **não** — snapshot sem cohort longitudinal |
