"""Genre labels for legacy 'músicas mais tocadas' exports."""
from __future__ import annotations

import re

import pandas as pd

GENRE_LETTER = {
    "F": "FUNK",
    "S": "SERTANEJO",
    "R": "ROCK",
    "E": "ELETRONICO",
    "P": "PAGODE",
}

# Full names sometimes appear in trailing CSV columns (top rows only).
GENRE_NAME = {
    "FUNK": "FUNK",
    "SERTANEJO": "SERTANEJO",
    "ROCK": "ROCK",
    "ELETRONICO": "ELETRONICO",
    "ELETRÔNICO": "ELETRONICO",
    "PAGODE": "PAGODE",
}

FUNK_KW = (
    "mc ",
    " mc",
    "funk",
    "borel",
    "kevinho",
    "fioti",
    "livinho",
    "don juan",
    "bonde r",
    "pabllo",
    "ludmilla",
    "negro do",
    " wm",
    "g15",
    "zaac",
    "kekel",
    "anitta",
    "major lazer",
    "hungria",
    "criolo",
)
SERTANEJO_KW = (
    "safadão",
    "safadao",
    "henrique & j",
    "henrique & d",
    "jorge & mateus",
    "maiara",
    "marília",
    "marilia",
    "ze neto",
    "luan santana",
    "dilsinho",
    "simone &",
    "simone e",
    "cristiano",
    "sertanej",
    "gusttavo",
    "michel teló",
    "matheus & kauan",
    "chitãozinho",
    "chitozinho",
    "felipe araújo",
    "felipe araujo",
    "bruninho & davi",
)
PAGODE_KW = ("pagode", "turma do", "raça negra", "raca negra", "exaltasamba", "ferrugem", "revelação")
ELETRONICO_KW = (
    "alok",
    "guetta",
    "harris",
    "tukker",
    "dennis dj",
    "vintage",
    "kungs",
    "remix",
    "eletronic",
    "calvin",
    "sofia tukker",
)
ROCK_KW = (
    "ac/dc",
    "pearl jam",
    "offspring",
    "foo fighter",
    "red hot",
    "nirvana",
    "metallica",
    "legião",
    "legiao",
    "raimundos",
    "charlie brown",
    "mamonas",
    "raul seixas",
    "dire straits",
    "chemical romance",
    "linkin park",
    "guns n",
    "iron maiden",
    "system of a down",
    "queen",
    "eminem",
    "maneva",
    "o rappa",
    "lady gaga",
    "rock",
)


def _norm(s: str | float) -> str:
    if pd.isna(s):
        return ""
    return re.sub(r"\s+", " ", str(s).strip().lower())


def _parse_export_genre(row: pd.Series) -> str | None:
    letter = row.get("genero_letra")
    if pd.notna(letter):
        g = str(letter).strip().upper()
        if g in GENRE_LETTER:
            return GENRE_LETTER[g]
    for col in ("genero_nome",):
        val = row.get(col)
        if pd.notna(val):
            name = str(val).strip().upper()
            if name in GENRE_NAME:
                return GENRE_NAME[name]
    return None


def _infer_from_keywords(artista: str, titulo: str) -> str | None:
    blob = f"{_norm(artista)} {_norm(titulo)}"
    if any(k in blob for k in FUNK_KW):
        return "FUNK"
    if any(k in blob for k in SERTANEJO_KW):
        return "SERTANEJO"
    if any(k in blob for k in PAGODE_KW):
        return "PAGODE"
    if any(k in blob for k in ELETRONICO_KW):
        return "ELETRONICO"
    if any(k in blob for k in ROCK_KW):
        return "ROCK"
    return None


def enrich_musicas_genres(df: pd.DataFrame) -> pd.DataFrame:
    """Add genero, genero_fonte columns. Requires nome, artista, quantidade."""
    out = df.copy()
    out["genero_exportado"] = out.apply(_parse_export_genre, axis=1)

    labeled = out[out["genero_exportado"].notna()]
    artist_map: dict[str, str] = {}
    if len(labeled):
        artist_map = (
            labeled.groupby(labeled["artista"].map(_norm))["genero_exportado"]
            .agg(lambda s: s.mode().iloc[0])
            .to_dict()
        )

    generos: list[str | None] = []
    fontes: list[str] = []

    for _, row in out.iterrows():
        g = row["genero_exportado"]
        if pd.notna(g) and g:
            generos.append(g)
            fontes.append("exportado")
            continue
        a = _norm(row["artista"])
        if a in artist_map:
            generos.append(artist_map[a])
            fontes.append("artista_rotulado")
            continue
        g = _infer_from_keywords(row["artista"], row["nome"])
        if g:
            generos.append(g)
            fontes.append("heuristica")
            continue
        generos.append(None)
        fontes.append("indefinido")

    out["genero"] = generos
    out["genero_fonte"] = fontes
    return out


def genre_play_share(df: pd.DataFrame) -> pd.DataFrame:
    """Sum of quantidade by genero (incl. INDEFINIDO)."""
    view = df.copy()
    view["genero_label"] = view["genero"].fillna("INDEFINIDO")
    agg = (
        view.groupby("genero_label", as_index=False)["quantidade"]
        .sum()
        .sort_values("quantidade", ascending=False)
    )
    total = int(agg["quantidade"].sum())
    agg["pct_plays"] = (100 * agg["quantidade"] / total).round(1) if total else 0
    return agg
