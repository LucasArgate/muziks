"""Generate Markdown reports from normalized dataframes."""
from __future__ import annotations

from datetime import datetime

import pandas as pd

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
        "",
    ]
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

    top_music = musicas.head(20)[["nome", "artista", "quantidade"]]
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
    ]
    return "\n".join(lines) + _footer()


def report_05(data: dict) -> str:
    rank = data["rank_usuarios"]
    h = data["historico"]
    busca = data["busca_global"]

    top_bars_users = (
        rank.head(5)[["nome", "usuarios"]]
        .rename(columns={"nome": "bar", "usuarios": "usuarios_acum"})
    )
    identity_terms = busca[
        busca["termo_norm"].str.contains(
            r"corinth|são paulo|sao paulo|palmeiras|hino|raç", regex=True, na=False
        )
    ]

    lines = [
        "# Insights para o Muziks de hoje",
        "",
        "Derivados do arquivo 2016–2017 — validar em pilotos antes de virar meta numérica.",
        "",
        "## Produto",
        "",
        "1. **Telão / QR / descoberta:** bares com maior base acumulada (ex. ranking abaixo) "
        "são candidatos naturais a [modo telão](../../specs/12-telao-display-publico.md) — "
        "alto potencial de entrada, baixo custo de explicação no salão.",
        "",
        md_table(top_bars_users),
        "",
        "2. **Firewall e identidade:** buscas e conflitos de campo mostram música **não neutra**; "
        "política por artista/gênero/dia ([04-rules-firewall](../../specs/04-rules-firewall.md)) "
        "é reforço empírico, não luxo.",
        "",
    ]
    if len(identity_terms) > 0:
        lines.append(
            f"   - Termos com carga identitária no export: **{len(identity_terms)}** ocorrências no top de buscas."
        )
        lines.append("")
    else:
        lines.append("")

    lines.extend([
        "3. **Instrumentação:** este arquivo prova valor de exports agregados para o dono — "
        "alinha add-on *relatórios* em [business/01](../../business/01-receita-rentabilidade-e-go-to-market.md). "
        "O MVP deve nascer com eventos mínimos de [13-kpis](../../specs/13-kpis-fases-e-loops.md) "
        "para não repetir 'impossível medir D14'.",
        "",
        "4. **Participação com teto:** Pareto forte em repeat users — fichas/peso limitado "
        "([business/03](../../business/03-espaco-romantico-prioridade-e-sustentabilidade.md)) "
        "protege democracia percebida.",
        "",
        "5. **Catálogo:** normalizar com **ISRC** e search multi-provedor reduz gap busca→tocada "
        "visto em [04-catalogo-busca-vs-tocada.md](04-catalogo-busca-vs-tocada.md).",
        "",
        "## O que não fazer",
        "",
        "- Não citar estes números como TAM/SAM 2026.",
        "- Não publicar CRM ou IDs Facebook.",
        "- Não prometer retenção D28 com base neste snapshot.",
        "",
    ])
    return "\n".join(lines) + _footer()


def write_samples(data: dict, sample_dir) -> None:
    sample_dir.mkdir(parents=True, exist_ok=True)

    pm = data["pedidos_mes"]
    top_bars = (
        pm.groupby(["id", "nome"], as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
        .head(10)
    )
    top_bars.to_csv(sample_dir / "top10-bares-pedidos.csv", index=False)

    data["usuarios_mes"].to_csv(sample_dir / "usuarios-por-mes.csv", index=False)

    data["musicas"].head(25).to_csv(sample_dir / "top25-musicas-tocadas.csv", index=False)

    data["busca_global"].head(25).to_csv(sample_dir / "top25-termos-busca.csv", index=False)

    rank = data["rank_usuarios"].head(15)
    rank.to_csv(sample_dir / "top15-bares-usuarios-acum.csv", index=False)
