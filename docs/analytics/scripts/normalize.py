"""Load and normalize legacy CSV exports."""
from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

from config import ENCODINGS, data_path


def read_csv(path: Path, **kwargs) -> pd.DataFrame:
    last_err: Exception | None = None
    for enc in ENCODINGS:
        try:
            return pd.read_csv(path, encoding=enc, **kwargs)
        except (UnicodeDecodeError, pd.errors.ParserError) as e:
            last_err = e
    raise RuntimeError(f"Could not read {path}: {last_err}")


def normalize_name(s: str | float) -> str:
    if pd.isna(s):
        return ""
    t = str(s).strip().lower()
    t = re.sub(r"\s+", " ", t)
    t = t.replace("'", "'")
    return t


def fix_facebook_id(val) -> str:
    if pd.isna(val):
        return ""
    s = str(val).strip()
    if "," in s and "e" in s.lower():
        s = s.replace(",", ".")
    try:
        f = float(s)
        if f == f:  # not NaN
            return str(int(f))
    except ValueError:
        pass
    if s.endswith(".0"):
        s = s[:-2]
    return s


def load_historico() -> pd.DataFrame:
    df = read_csv(data_path("historico"))
    df.columns = ["data", "estabelecimento", "cliente"]
    df["data"] = pd.to_datetime(df["data"], errors="coerce")
    df["estabelecimento_norm"] = df["estabelecimento"].map(normalize_name)
    return df.dropna(subset=["data"])


def load_pedidos_mes() -> pd.DataFrame:
    df = read_csv(data_path("pedidos_mes"))
    df.columns = ["id", "nome", "mes", "ano", "quantidade"]
    df["periodo"] = pd.to_datetime(
        df["ano"].astype(str) + "-" + df["mes"].astype(str).str.zfill(2) + "-01"
    )
    df["nome_norm"] = df["nome"].map(normalize_name)
    return df


def load_pedidos_dia() -> pd.DataFrame:
    df = read_csv(data_path("pedidos_dia"))
    df.columns = ["dia", "mes", "ano", "estabelecimento_id", "nome", "quantidade"]
    df["data"] = pd.to_datetime(
        dict(year=df["ano"], month=df["mes"], day=df["dia"]), errors="coerce"
    )
    df["nome_norm"] = df["nome"].map(normalize_name)
    return df.dropna(subset=["data"])


def load_usuarios_mes() -> pd.DataFrame:
    raw = read_csv(data_path("usuarios_mes"), header=None)
    # Skip empty rows; find header row with Ano
    start = 0
    for i, row in raw.iterrows():
        if str(row.iloc[0]).strip().lower() == "ano":
            start = i
            break
    df = read_csv(data_path("usuarios_mes"), skiprows=start)
    df.columns = ["ano", "mes", "total_usuarios"]
    df["periodo"] = pd.to_datetime(
        df["ano"].astype(str) + "-" + df["mes"].astype(str).str.zfill(2) + "-01"
    )
    return df.sort_values("periodo")


def load_rank_usuarios() -> pd.DataFrame:
    df = read_csv(data_path("rank_usuarios"))
    df.columns = ["usuarios", "nome"]
    df["nome_norm"] = df["nome"].map(normalize_name)
    return df.sort_values("usuarios", ascending=False)


def load_ultimo_acesso() -> pd.DataFrame:
    df = read_csv(data_path("ultimo_acesso"))
    df.columns = ["id", "estabelecimento", "usuario", "ultimo_acesso", "dias"]
    df["ultimo_acesso"] = pd.to_datetime(df["ultimo_acesso"], errors="coerce")
    df["estabelecimento_norm"] = df["estabelecimento"].map(normalize_name)
    return df


def load_repeat_users() -> pd.DataFrame:
    df = read_csv(data_path("repeat_users"))
    df.columns = ["nome", "facebook_id", "quantidade"]
    df["facebook_id"] = df["facebook_id"].map(fix_facebook_id)
    df["quantidade"] = pd.to_numeric(df["quantidade"], errors="coerce").fillna(0).astype(int)
    return df.sort_values("quantidade", ascending=False)


def load_clientes_buscam() -> pd.DataFrame:
    df = read_csv(data_path("clientes_buscam"))
    df.columns = ["facebook_id", "nome", "estabelecimento_id", "quantidade"]
    df["facebook_id"] = df["facebook_id"].map(fix_facebook_id)
    return df


def load_musicas() -> pd.DataFrame:
    path = data_path("musicas")
    if not path.exists():
        path = data_path("musicas_legacy")
    df = read_csv(path)

    if "Musica ID" in df.columns or "Musica ID" in [str(c) for c in df.columns]:
        # New export: Musica ID, Titulo, Artista, Qtd, Genero (+ optional name columns)
        rename = {
            "Musica ID": "song_id",
            "Titulo": "nome",
            "Artista": "artista",
            "Qtd": "quantidade",
            "Genero": "genero_letra",
        }
        df = df.rename(columns={k: v for k, v in rename.items() if k in df.columns})
        extra = [c for c in df.columns if str(c).startswith("Unnamed")]
        if len(extra) >= 1:
            df = df.rename(columns={extra[0]: "genero_nome"})
    else:
        df.columns = ["song_id", "nome", "artista", "quantidade"]

    df["quantidade"] = pd.to_numeric(df["quantidade"], errors="coerce").fillna(0).astype(int)
    df = df.sort_values("quantidade", ascending=False)

    from genre import enrich_musicas_genres

    return enrich_musicas_genres(df)


def load_busca_global() -> pd.DataFrame:
    df = read_csv(data_path("busca_global"), header=None, names=["termo", "contagem"])
    df["termo_norm"] = df["termo"].astype(str).str.strip().str.lower()
    df["contagem"] = pd.to_numeric(df["contagem"], errors="coerce").fillna(0).astype(int)
    return df.sort_values("contagem", ascending=False)


def load_busca_estab() -> pd.DataFrame:
    df = read_csv(data_path("busca_estab"))
    df.columns = ["estabelecimento_id", "nome", "termo", "contagem"]
    df["termo_norm"] = df["termo"].astype(str).str.strip().str.lower()
    df["contagem"] = pd.to_numeric(df["contagem"], errors="coerce").fillna(0).astype(int)
    return df


def load_cadastro_status() -> pd.DataFrame | None:
    path = data_path("cadastro")
    if not path.exists():
        return None
    raw = read_csv(path, header=None)
    # Header at row index 2 (line 3)
    df = read_csv(path, skiprows=2)
    if "Status" not in df.columns:
        # fallback column names from known layout
        cols = [
            "num", "bar", "dono", "ultimo_contato", "telefone", "email",
            "endereco", "numero", "cidade_uf", "cep", "estilo", "login", "senha", "status",
        ]
        df.columns = cols[: len(df.columns)]
        df = df.rename(columns={"status": "Status", "bar": "Bar", "estilo": "Estilo", "cidade_uf": "Cidade/UF"})
    out = df[["Bar", "Status"]].copy() if "Bar" in df.columns else df.iloc[:, [1, -1]].copy()
    out.columns = ["bar", "status"]
    out["bar_norm"] = out["bar"].map(normalize_name)
    out["status"] = out["status"].fillna("").astype(str).str.strip()
    return out


def load_all(*, pseudonymize: bool = True) -> dict[str, pd.DataFrame | None]:
    data = {
        "historico": load_historico(),
        "pedidos_mes": load_pedidos_mes(),
        "pedidos_dia": load_pedidos_dia(),
        "usuarios_mes": load_usuarios_mes(),
        "rank_usuarios": load_rank_usuarios(),
        "ultimo_acesso": load_ultimo_acesso(),
        "repeat_users": load_repeat_users(),
        "clientes_buscam": load_clientes_buscam(),
        "musicas": load_musicas(),
        "busca_global": load_busca_global(),
        "busca_estab": load_busca_estab(),
        "cadastro": load_cadastro_status(),
    }
    if pseudonymize:
        from pseudonymize import apply_pseudonymization

        return apply_pseudonymization(data)
    return data


def md_table(df: pd.DataFrame, max_rows: int = 15) -> str:
    view = df.head(max_rows)
    cols = list(view.columns)
    lines = [
        "| " + " | ".join(str(c) for c in cols) + " |",
        "| " + " | ".join("---" for _ in cols) + " |",
    ]
    for _, row in view.iterrows():
        cells = []
        for c in cols:
            v = row[c]
            if isinstance(v, float) and v == int(v):
                v = int(v)
            cells.append(str(v).replace("|", "\\|"))
        lines.append("| " + " | ".join(cells) + " |")
    if len(df) > max_rows:
        lines.append(f"\n*… e mais {len(df) - max_rows} linhas.*")
    return "\n".join(lines)
