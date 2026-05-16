"""Generate Markdown reports from normalized dataframes."""
from __future__ import annotations

from datetime import datetime

import pandas as pd

from genre import genre_play_share
from normalize import md_table


def _footer() -> str:
    return (
        f"\n---\n\n*Gerado em {datetime.now().strftime('%Y-%m-%d %H:%M')} "
        f"por `docs/analytics/scripts/run_all.py`. Dados legados 2016–2017; "
        f"nomes de pessoas pseudonimizados.*\n"
    )


def report_00(data: dict) -> str:
    h = data["historico"]
    pm = data["pedidos_mes"]
    ru = data["repeat_users"]
    musicas = data["musicas"]

    total_pedidos_hist = len(h)
    total_pedidos_mes = int(pm["quantidade"].sum())
    min_date = h["data"].min()
    max_date = h["data"].max()
    n_bars_hist = h["estabelecimento"].nunique()
    n_users_repeat_file = len(ru)
    top_bars = (
        h.groupby("estabelecimento", as_index=False)
        .size()
        .rename(columns={"size": "pedidos"})
        .sort_values("pedidos", ascending=False)
        .head(10)
    )
    poco_share = 0.0
    if total_pedidos_hist:
        poco = top_bars.loc[top_bars["estabelecimento"].str.contains("Poco Loco", case=False, na=False)]
        if len(poco):
            poco_share = 100 * int(poco.iloc[0]["pedidos"]) / total_pedidos_hist

    lines = [
        "# Resumo executivo — analytics legado Muziks",
        "",
        "> Baseline histórico (2016–2017). Não usar como meta de escala do MVP atual.",
        "",
        "## Totais",
        "",
        f"| Métrica | Valor |",
        f"|---------|------:|",
        f"| Pedidos no histórico (linhas) | {total_pedidos_hist:,} |",
        f"| Soma pedidos por mês (agregado) | {total_pedidos_mes:,} |",
        f"| Participantes no ranking repeat (ficheiro) | {n_users_repeat_file:,} |",
        f"| Estabelecimentos distintos (histórico) | {n_bars_hist} |",
        f"| Janela temporal (histórico) | {min_date.date()} → {max_date.date()} |",
        f"| Share Poco Loco no histórico de pedidos | {poco_share:.1f}% |",
        "",
        "## Catálogo (músicas mais tocadas)",
        "",
        f"| Métrica | Valor |",
        f"|---------|------:|",
        f"| Faixas no ranking | {len(musicas):,} |",
        f"| Reproduções somadas (`Qtd`) | {int(musicas['quantidade'].sum()):,} |",
    ]
    if "genero_fonte" in musicas.columns:
        n_export = int((musicas["genero_fonte"] == "exportado").sum())
        plays_class = int(musicas.loc[musicas["genero"].notna(), "quantidade"].sum())
        lines.append(f"| Faixas com gênero exportado (`Genero`) | {n_export} |")
        lines.append(
            f"| Reproduções com gênero atribuído (pipeline) | {plays_class:,} "
            f"({100 * plays_class / musicas['quantidade'].sum():.1f}%) |"
        )
    lines.extend([
        "",
        "Detalhe de gênero e busca: [04-catalogo-busca-vs-tocada.md](04-catalogo-busca-vs-tocada.md).",
        "",
        "## Top 10 estabelecimentos por pedidos (histórico)",
        "",
        md_table(top_bars.rename(columns={"estabelecimento": "estabelecimento", "pedidos": "pedidos"})),
        "",
        "## Limitações",
        "",
        "- **Retenção D14/D28/D90:** não calculável — export pontual, sem identidade estável longitudinal.",
        "- **MAU atual:** não comparável; série `usuários por mês` é proxy global da época.",
        "- Números refletem produto e mercado **2016–2017** (campinas/RMC e entorno).",
        "- **Gênero:** coluna `Genero` preenchida só no topo do ranking; restante via `scripts/genre.py`.",
        "",
    ])
    return "\n".join(lines) + _footer()


def report_01(data: dict) -> str:
    pm = data["pedidos_mes"]
    rank = data["rank_usuarios"]
    ua = data["ultimo_acesso"]
    cad = data["cadastro"]

    by_bar = (
        pm.groupby(["id", "nome", "nome_norm"], as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
        .rename(columns={"quantidade": "pedidos_total"})
    )

    merged = rank.merge(
        by_bar[["nome_norm", "pedidos_total"]],
        on="nome_norm",
        how="left",
    )
    merged["pedidos_total"] = merged["pedidos_total"].fillna(0).astype(int)
    merged["ratio_pedidos_por_usuario"] = (
        merged["pedidos_total"] / merged["usuarios"].replace(0, pd.NA)
    ).round(2)

    top_tracao = merged.sort_values("pedidos_total", ascending=False).head(15)[
        ["nome", "usuarios", "pedidos_total", "ratio_pedidos_por_usuario"]
    ]

    ua_view = ua.sort_values("ultimo_acesso", ascending=False).head(15)[
        ["estabelecimento", "ultimo_acesso", "dias"]
    ]

    lines = [
        "# Oferta — players (bares)",
        "",
        "Proxy para KPI **oferta** em [13-kpis-fases-e-loops.md](../../specs/13-kpis-fases-e-loops.md): "
        "players com pedidos, base de usuários acumulada e último acesso no corte.",
        "",
        "## Ranking tração (usuários acumulados × pedidos totais)",
        "",
        md_table(top_tracao),
        "",
        "## Último acesso — donos (corte do export)",
        "",
        md_table(ua_view),
        "",
    ]

    if cad is not None:
        status_counts = cad["status"].value_counts().reset_index()
        status_counts.columns = ["status", "quantidade"]
        bars_com_pedido = set(by_bar[by_bar["pedidos_total"] > 0]["nome_norm"])
        bars_cadastro = set(cad["bar_norm"])
        lines.extend([
            "## Cadastro comercial (agregado, sem PII)",
            "",
            md_table(status_counts),
            "",
            f"- Bares no cadastro: **{len(bars_cadastro)}**",
            f"- Bares com ≥1 pedido (soma mensal): **{len(bars_com_pedido)}**",
            f"- Interseção nome normalizado cadastro ∩ pedidos: **{len(bars_cadastro & bars_com_pedido)}**",
            "",
            "*Nomes divergem entre CRM e sistema (ex. Nicola vs Bar do Nicola) — usar ID quando existir.*",
            "",
        ])
    else:
        lines.append("*Cadastro de Bares não encontrado localmente — secção omitida.*\n")

    return "\n".join(lines) + _footer()


def report_02(data: dict) -> str:
    h = data["historico"]
    ru = data["repeat_users"]

    q = ru["quantidade"]
    total_users = len(ru)
    total_orders = int(q.sum())
    top10_pct = max(1, int(total_users * 0.1))
    top_slice = ru.head(top10_pct)
    pareto_share = 100 * top_slice["quantidade"].sum() / total_orders if total_orders else 0

    bins = pd.cut(
        q,
        bins=[1, 2, 5, 20, 100, 500, 10000],
        labels=["2", "3-5", "6-20", "21-100", "101-500", "500+"],
        right=True,
    )
    dist = bins.value_counts().sort_index().reset_index()
    dist.columns = ["faixa_pedidos", "participantes"]

    # Multi-establishment: hash client names for internal count only
    by_client = h.groupby("cliente")["estabelecimento"].nunique()
    multi = (by_client > 1).sum()
    multi_3plus = (by_client >= 3).sum()

    lines = [
        "# Demanda — participantes",
        "",
        "Proxy para KPI **demanda**: profundidade (pedidos por pessoa) e sinais de **loop** "
        "(mesmo participante em vários bares). Sem exportar nomes ou Facebook IDs.",
        "",
        "## Distribuição de profundidade (ficheiro repeat users)",
        "",
        md_table(dist),
        "",
        "## Pareto",
        "",
        f"- Participantes no ficheiro: **{total_users:,}**",
        f"- Pedidos somados no ficheiro: **{total_orders:,}**",
        f"- Top 10% dos participantes concentram **{pareto_share:.1f}%** dos pedidos",
        "",
        "Implicação para [espaço romântico / fichas](../../business/03-espaco-romantico-prioridade-e-sustentabilidade.md): "
        "minorias muito ativas existiam — qualquer mecânica de peso na fila precisa de **teto** e firewall.",
        "",
        "## Loop (indício) — vários estabelecimentos",
        "",
        f"- Participantes (por nome no histórico) em **>1** bar: **{multi:,}**",
        f"- Em **≥3** bares: **{multi_3plus:,}**",
        "",
        "*Identidade fraca (nome display); MVP deve usar OAuth + player context.*",
        "",
    ]
    return "\n".join(lines) + _footer()


def report_03(data: dict) -> str:
    um = data["usuarios_mes"]
    pdia = data["pedidos_dia"]

    um_view = um[["ano", "mes", "total_usuarios"]].sort_values(["ano", "mes"])
    daily_total = (
        pdia.groupby("data", as_index=False)["quantidade"]
        .sum()
        .sort_values("data")
    )
    peak_day = daily_total.loc[daily_total["quantidade"].idxmax()]
    peak_bar_day = pdia.loc[pdia["quantidade"].idxmax()]

    jun2017 = pdia[(pdia["ano"] == 2017) & (pdia["mes"] == 6)]
    jun_pivot = (
        jun2017.groupby(["dia", "nome"], as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
        .head(12)
    )

    lines = [
        "# Ponte — pedidos e sazonalidade",
        "",
        "Proxy para **sessão com valor**: volume diário e concentração por player.",
        "",
        "## Usuários por mês (global)",
        "",
        md_table(um_view),
        "",
        "## Pico global diário",
        "",
        f"- Data: **{peak_day['data'].date()}** — **{int(peak_day['quantidade']):,}** pedidos (soma todos os bares)",
        f"- Maior linha única bar+dia: **{peak_bar_day['nome']}** em "
        f"**{int(peak_bar_day['dia'])}/{int(peak_bar_day['mes'])}/{int(peak_bar_day['ano'])}** "
        f"— **{int(peak_bar_day['quantidade']):,}** pedidos",
        "",
        "## Junho/2017 — maiores dias por bar (amostra)",
        "",
        md_table(jun_pivot.rename(columns={"dia": "dia", "nome": "bar", "quantidade": "pedidos"})),
        "",
        "## Liquidez (leitura qualitativa)",
        "",
        "Picos extremos em poucos bares/dias sugerem **eventos** ou testes intensivos — "
        "não assumir fila viva contínua sem métrica de 'sessão seca' (indisponível no export).",
        "",
    ]
    return "\n".join(lines) + _footer()


def report_04(data: dict) -> str:
    musicas = data["musicas"]
    busca = data["busca_global"]

    has_genre = "genero" in musicas.columns
    top_cols = ["nome", "artista", "quantidade"]
    if has_genre:
        top_cols.append("genero")

    top_music = musicas.head(20)[top_cols]
    top_artists = (
        musicas.groupby("artista", as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
        .head(15)
    )
    top_terms = busca.head(20)[["termo", "contagem"]]

    played_titles = set(musicas["nome"].str.strip().str.lower())
    played_artists = set(musicas["artista"].str.strip().str.lower())
    busca["match_titulo"] = busca["termo_norm"].apply(
        lambda t: any(t in p or p in t for p in played_titles if len(t) > 2)
    )
    busca["match_artista"] = busca["termo_norm"].apply(
        lambda t: any(t in a or a in t for a in played_artists if len(t) > 2)
    )
    busca_sem = busca[~(busca["match_titulo"] | busca["match_artista"])].head(15)

    lines = [
        "# Catálogo — busca vs tocada",
        "",
        "Suporte a **search**, **firewall** e futuro **ISRC** "
        "([06-queue-voting](../../specs/06-queue-voting-and-chips.md), "
        "[14-fronteiras-legais](../../specs/14-fronteiras-legais-direitos-autorais.md)).",
        "",
    ]

    if has_genre:
        total_plays = int(musicas["quantidade"].sum())
        n_export = int((musicas["genero_fonte"] == "exportado").sum())
        plays_classified = int(musicas.loc[musicas["genero"].notna(), "quantidade"].sum())
        pct_classified = 100 * plays_classified / total_plays if total_plays else 0
        by_genre = genre_play_share(musicas)
        top50 = musicas.head(50)
        n_genres_top50 = top50["genero"].dropna().nunique()
        n_indef_top50 = int(top50["genero"].isna().sum())

        lines.extend([
            "## Gênero nas reproduções (novo export)",
            "",
            f"- Faixas no ranking: **{len(musicas):,}** · reproduções somadas: **{total_plays:,}**",
            f"- Linhas com gênero **exportado** (coluna `Genero`): **{n_export}**",
            f"- Reproduções com gênero atribuído (export + artista + heurística): "
            f"**{plays_classified:,}** (**{pct_classified:.1f}%** do total)",
            "",
            "Códigos no export: `F`=Funk, `S`=Sertanejo, `R`=Rock, `E`=Eletrônico, `P`=Pagode. "
            "Restante classificado por artista já rotulado ou palavras-chave em título/artista — ver `scripts/genre.py`.",
            "",
            "### Share de reproduções por gênero",
            "",
            md_table(by_genre.rename(columns={"genero_label": "genero", "quantidade": "reproducoes"})),
            "",
            f"### Mistura no top 50 faixas",
            "",
            f"- Gêneros distintos (entre classificados): **{n_genres_top50}**",
            f"- Faixas no top 50 ainda **sem** gênero atribuído: **{n_indef_top50}**",
            "",
            "*Mesmo com classificação parcial, o padrão confirma fila **multigênero** no mesmo ecossistema — firewall por gênero/artista é operacional, não cosmético.*",
            "",
        ])

        for g in ["FUNK", "SERTANEJO", "ROCK", "ELETRONICO", "PAGODE"]:
            sub = musicas[musicas["genero"] == g].head(5)[["nome", "artista", "quantidade"]]
            if len(sub):
                block = [f"#### Top 5 — {g}", "", md_table(sub)]
                if g == "ROCK":
                    block.extend([
                        "",
                        "*Observação do autor:* «Pisando Descalço» (Maneva) **não** é rock de fato; "
                        "entrou neste bloco porque o fornecedor de metadados na época **não** classificava "
                        "o gênero com precisão (reggae/MPB no caso). Reforça a necessidade de firewall "
                        "editável pelo dono e de gênero vindo do provedor **com** override local no MVP.",
                    ])
                block.append("")
                lines.extend(block)

    lines.extend([
        "## Top 20 músicas tocadas",
        "",
        md_table(top_music),
        "",
        "## Top 15 artistas (soma tocadas)",
        "",
        md_table(top_artists),
        "",
        "## Top 20 termos de busca",
        "",
        md_table(top_terms),
        "",
        "## Termos frequentes sem correspondência óbvia no top tocadas",
        "",
        "Heurística: substring entre termo e título/artista do ranking de tocadas.",
        "",
        md_table(busca_sem[["termo", "contagem"]]),
        "",
        "*Gap busca→play pode indicar catálogo incompleto, typos ou faixas bloqueadas — relevante para copy cortês e recovery.*",
        "",
        "## Implicações para o MVP",
        "",
        "- **Busca fuzzy** no catálogo — [11-backend](../../specs/11-backend-and-integrations-open.md).",
        "- **Firewall** por gênero/artista — [04-rules-firewall](../../specs/04-rules-firewall.md); metadados de gênero devem vir do provedor **e** ser editáveis pelo dono.",
        "- **Relatório ao dono:** mix de gênero por semana/noite (quando houver eventos) — alinha add-on em [business/01](../../business/01-receita-rentabilidade-e-go-to-market.md).",
        "",
    ])
    return "\n".join(lines) + _footer()


def report_05(data: dict) -> str:
    h = data["historico"]
    pm = data["pedidos_mes"]
    pdia = data["pedidos_dia"]
    rank = data["rank_usuarios"]
    ru = data["repeat_users"]
    busca = data["busca_global"]
    musicas = data["musicas"]
    cad = data["cadastro"]

    total_hist = len(h)
    top_bars_users = rank.head(5)[["nome", "usuarios"]].rename(
        columns={"nome": "bar", "usuarios": "usuarios_acum"}
    )

    # Pareto
    q = ru["quantidade"]
    total_users = len(ru)
    total_orders_ru = int(q.sum())
    top10_pct = max(1, int(total_users * 0.1))
    pareto_share = 100 * ru.head(top10_pct)["quantidade"].sum() / total_orders_ru if total_orders_ru else 0
    super500 = int((q >= 500).sum())

    # Rajada
    daily_total = pdia.groupby("data", as_index=False)["quantidade"].sum()
    peak_day = daily_total.loc[daily_total["quantidade"].idxmax()]
    peak_bar_day = pdia.loc[pdia["quantidade"].idxmax()]

    # Oferta 80/20
    poco_pedidos = int(
        h[h["estabelecimento"].str.contains("Poco Loco", case=False, na=False)].shape[0]
    )
    poco_pct = 100 * poco_pedidos / total_hist if total_hist else 0
    cad_pendente = cad["status"].str.lower().eq("pendente").sum() if cad is not None else None
    cad_total = len(cad) if cad is not None else None
    bars_com_pedido = pm.groupby("nome_norm")["quantidade"].sum()
    bars_ativos = int((bars_com_pedido > 0).sum())

    # Catálogo / busca
    top_term = busca.iloc[0]["termo"] if len(busca) else "—"
    top_artist_plays = (
        musicas.groupby("artista", as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
        .iloc[0]
    )
    identity_terms = busca[
        busca["termo_norm"].str.contains(
            r"corinth|são paulo|sao paulo|palmeiras|hino|raç", regex=True, na=False
        )
    ]

    snapshot_rows = [
        ("Pedidos no histórico", f"{total_hist:,}"),
        ("Pico global (1 dia)", f"{int(peak_day['quantidade']):,} em {peak_day['data'].date()}"),
        (
            "Pico bar+dia",
            f"{peak_bar_day['nome']} — {int(peak_bar_day['quantidade']):,} em "
            f"{int(peak_bar_day['dia'])}/{int(peak_bar_day['mes'])}/2017",
        ),
        ("Pareto top 10% participantes", f"{pareto_share:.1f}% dos pedidos"),
        ("Participantes faixa 500+ pedidos", str(super500)),
        ("Poco Loco share pedidos histórico", f"{poco_pct:.1f}%"),
        ("Bares com pedidos (agregado mensal)", str(bars_ativos)),
    ]
    if cad_total is not None:
        snapshot_rows.append(("Cadastro CRM (total / pendente)", f"{cad_total} / {cad_pendente}"))

    if "genero" in musicas.columns:
        plays_c = int(musicas.loc[musicas["genero"].notna(), "quantidade"].sum())
        total_plays = int(musicas["quantidade"].sum())
        snapshot_rows.append(
            ("Reproduções com gênero atribuído", f"{plays_c:,} ({100 * plays_c / total_plays:.1f}%)")
        )

    snapshot_df = pd.DataFrame(snapshot_rows, columns=["indicador", "valor"])

    lines = [
        "# Insights para o Muziks de hoje",
        "",
        "Síntese do arquivo **2016–2017** para decisões de PoC/MVP — validar em pilotos antes de meta numérica.",
        "",
        "## Snapshot",
        "",
        md_table(snapshot_df, max_rows=20),
        "",
        "Relatórios de origem: "
        "[00](00-resumo-executivo.md) · [01](01-oferta-players.md) · [02](02-demanda-participantes.md) · "
        "[03](03-ponte-pedidos-e-sazonalidade.md) · [04](04-catalogo-busca-vs-tocada.md). "
        "Amostras CSV: [`data/sample/`](../data/sample/).",
        "",
        "## 1. Infraestrutura — rajada",
        "",
        f"- **{int(peak_day['quantidade']):,}** pedidos num único dia (25/6/2017) e **{int(peak_bar_day['quantidade']):,}** "
        f"num bar num dia ({peak_bar_day['nome']}) — tráfego **concentrado em horas**, não diluído "
        "([03-ponte](03-ponte-pedidos-e-sazonalidade.md)).",
        "- **Decisão:** votação `POST` HTTP + rate-limit; fila assíncrona de votos; fila/telão por "
        "**polling** na Vercel Edge — **não** WebSocket Supabase por participante no *free tier* "
        "([02-viabilidade-custos](../mvp/02-viabilidade-custos-comparativo.md), "
        "[11-backend](../../specs/11-backend-and-integrations-open.md)).",
        "",
        "## 2. Produto — super usuários e democracia",
        "",
        f"- Top **10%** dos **{total_users:,}** participantes (ficheiro repeat) → **{pareto_share:.1f}%** "
        f"dos **{total_orders_ru:,}** pedidos ([02-demanda](02-demanda-participantes.md)).",
        f"- **{super500}** pessoas na faixa **500+** pedidos — sem teto, um participante muito ativo "
        "domina a fila percebida.",
        "- **64** participantes usaram **>1** bar; **26** usaram **≥3** — identidade OAuth + contexto "
        "de player são obrigatórios para limites justos.",
        "- **Decisão:** cooldown, teto de votos/janela, gamificação no telão **sem** peso ilimitado "
        "([06-queue-voting](../../specs/06-queue-voting-and-chips.md), "
        "[05-identidade-fosso](../mvp/05-identidade-fosso-participante-voto.md)).",
        "",
        "## 3. Negócio — ICP, cadastro vs tração",
        "",
    ]
    if cad_total is not None:
        lines.append(
            f"- CRM: **{cad_total}** bares cadastrados, **{cad_pendente}** pendentes, **5** ativos no export; "
            f"só **{bars_ativos}** com pedidos no agregado mensal ([01-oferta](01-oferta-players.md))."
        )
    lines.extend([
        f"- **Poco Loco** concentra **{poco_pct:.1f}%** dos pedidos do histórico e **1.080** usuários acumulados — "
        "modelo de referência para piloto, não a média do cadastro.",
        "- **Dono Bella** e **Vidottinho** têm base de usuários mas **poucos** pedidos (ratio baixo) — "
        "cadastro ou telão sem noite «quente» não basta.",
        "- **Métrica de piloto:** ≥1 espaço com **≥50 participantes distintos numa noite** com voto válido — "
        "não contar bares «ativados» no CRM "
        "([business/01](../../business/01-receita-rentabilidade-e-go-to-market.md), "
        "[13-kpis](../../specs/13-kpis-fases-e-loops.md)).",
        "",
        "### Top 5 bares por usuários acumulados",
        "",
        md_table(top_bars_users),
        "",
        "## 4. Curadoria — gênero, busca, firewall",
        "",
        f"- Busca #1: **«{top_term}»**; artista #1 em reproduções: **{top_artist_plays['artista']}** "
        f"({int(top_artist_plays['quantidade']):,} plays) — intenção e execução alinhadas no topo "
        "([04-catalogo](04-catalogo-busca-vs-tocada.md)).",
    ])

    if "genero" in musicas.columns:
        by_genre = genre_play_share(musicas)
        classified = by_genre[by_genre["genero_label"] != "INDEFINIDO"].copy()
        plays_c = int(classified["quantidade"].sum())
        total_plays = int(musicas["quantidade"].sum())
        if plays_c:
            classified["pct_classified"] = (100 * classified["quantidade"] / plays_c).round(1)
        top_genre = classified.sort_values("quantidade", ascending=False).head(3)
        genre_bullets = ", ".join(
            f"**{r['genero_label']}** {r['pct_classified']}%"
            for _, r in top_genre.iterrows()
        )
        indef_pct = float(by_genre.loc[by_genre["genero_label"] == "INDEFINIDO", "pct_plays"].iloc[0])
        n_export = int((musicas["genero_fonte"] == "exportado").sum())
        top20 = musicas.head(20)
        n_genres_top20 = top20["genero"].dropna().nunique()
        top20_funk = int((top20["genero"] == "FUNK").sum())
        lines.extend([
            f"- Export `Genero`: **{n_export}** faixas no topo; **{100 * plays_c / total_plays:.1f}%** das "
            f"reproduções classificadas; **{indef_pct:.1f}%** indefinidas — MVP deve puxar gênero do provedor.",
            f"- Entre classificados (**{plays_c:,}** plays): {genre_bullets}.",
            f"- Top **20** faixas: **{n_genres_top20}** gêneros distintos, **{top20_funk}** funk — "
            "mistura extrema no mesmo ranking global.",
            "- Typos frequentes (*Rabetao*, *Open the theca*, *Refem*) → **fuzzy search** + copy de recovery.",
            "- **Firewall** por gênero/artista/dia no painel do dono — não opcional na PoC "
            "([04-rules-firewall](../../specs/04-rules-firewall.md)).",
            "",
        ])

    if len(identity_terms) > 0:
        lines.append(
            f"- **{len(identity_terms)}** termos de busca com carga identitária (times/hinos) — "
            "política também cobre identidade social, não só «explícito»."
        )
        lines.append("")

    lines.extend([
        "## 5. PoC — três entregáveis (prioridade)",
        "",
        "| # | Entregável | Critério de pronto |",
        "|---|------------|-------------------|",
        "| 1 | Backend blindado | Rajada simulada (≥30 votos/2 min) sem travar DB; rate-limit por participante |",
        "| 2 | Painel dono + firewall | Bloqueio gênero/artista; política por dia da semana |",
        "| 3 | Piloto 3–5 bares ICP | ≥1 «noite qualificada» (≥50 participantes distintos com voto válido) |",
        "",
        "Ver [congelamento-mvp-e-arquitetura.md](../mvp/congelamento-mvp-e-arquitetura.md).",
        "",
        "## O que não fazer",
        "",
        "- Não citar estes números como TAM/SAM 2026.",
        "- Não publicar CRM, Facebook IDs ou CSV brutos com PII.",
        "- Não prometer retenção D28 com base neste snapshot.",
        "- Não dimensionar infra pela média mensal ignorando picos de fim de semana.",
        "- Não tratar mix de gênero como verdade absoluta sem metadados do provedor no MVP.",
        "",
    ])
    return "\n".join(lines) + _footer()


def write_samples(data: dict, sample_dir) -> None:
    sample_dir.mkdir(parents=True, exist_ok=True)

    pm = data["pedidos_mes"]
    h = data["historico"]
    ru = data["repeat_users"]
    pdia = data["pedidos_dia"]
    musicas = data["musicas"]

    top_bars = (
        pm.groupby(["id", "nome"], as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
        .head(10)
    )
    top_bars.to_csv(sample_dir / "top10-bares-pedidos.csv", index=False)

    data["usuarios_mes"].to_csv(sample_dir / "usuarios-por-mes.csv", index=False)

    music_sample_cols = ["nome", "artista", "quantidade"]
    if "genero" in musicas.columns:
        music_sample_cols.extend(["genero", "genero_fonte"])
    musicas.head(25)[music_sample_cols].to_csv(
        sample_dir / "top25-musicas-tocadas.csv", index=False
    )

    (
        musicas.groupby("artista", as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
        .head(15)
        .to_csv(sample_dir / "top15-artistas-tocadas.csv", index=False)
    )

    if "genero" in musicas.columns:
        genre_play_share(musicas).to_csv(
            sample_dir / "genero-share-reproducoes.csv", index=False
        )
        classified = genre_play_share(musicas)
        classified = classified[classified["genero_label"] != "INDEFINIDO"].copy()
        total_c = int(classified["quantidade"].sum())
        if total_c:
            classified["pct_do_classificado"] = (
                100 * classified["quantidade"] / total_c
            ).round(1)
        classified.to_csv(sample_dir / "genero-share-classificados.csv", index=False)

    # Snapshot métricas (sem PII) para dashboards rápidos
    daily_total = pdia.groupby("data", as_index=False)["quantidade"].sum()
    peak_day = daily_total.loc[daily_total["quantidade"].idxmax()]
    peak_bar = pdia.loc[pdia["quantidade"].idxmax()]
    q = ru["quantidade"]
    total_users = len(ru)
    top10_pct = max(1, int(total_users * 0.1))
    pareto = (
        100 * ru.head(top10_pct)["quantidade"].sum() / int(q.sum()) if int(q.sum()) else 0
    )
    poco_pedidos = h[h["estabelecimento"].str.contains("Poco Loco", case=False, na=False)].shape[0]
    snapshot = pd.DataFrame(
        [
            {"metrica": "pedidos_historico", "valor": len(h)},
            {"metrica": "pico_pedidos_dia_global", "valor": int(peak_day["quantidade"])},
            {"metrica": "pico_pedidos_bar_dia", "valor": int(peak_bar["quantidade"])},
            {"metrica": "pareto_top10_pct_pedidos", "valor": round(pareto, 1)},
            {"metrica": "participantes_500plus", "valor": int((q >= 500).sum())},
            {"metrica": "poco_loco_pct_pedidos", "valor": round(100 * poco_pedidos / len(h), 1)},
            {"metrica": "faixas_ranking", "valor": len(musicas)},
            {"metrica": "reproducoes_somadas", "valor": int(musicas["quantidade"].sum())},
        ]
    )
    snapshot.to_csv(sample_dir / "snapshot-metricas.csv", index=False)

    data["busca_global"].head(25).to_csv(sample_dir / "top25-termos-busca.csv", index=False)

    rank = data["rank_usuarios"].head(15)
    rank.to_csv(sample_dir / "top15-bares-usuarios-acum.csv", index=False)
