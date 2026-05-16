"""Pseudonymize person-linked names in analytics outputs (reports, samples)."""
from __future__ import annotations

import hashlib
import re

import pandas as pd

from normalize import normalize_name

# Players / contas claramente ligados a pessoas (teste ou dono identificável)
ESTABLISHMENT_ALIASES: dict[str, str] = {
    "argate": "Player_P01",
    "servidoni": "Player_P02",
    "bar do nestor": "Bar_P03",
    "est. marajoli.douglas": "Player_P04",
    "est marajoli.douglas": "Player_P04",
    "lilian gonshior": "Player_P05",
}

# Substrings em nomes de estabelecimento → pseudónimo
ESTABLISHMENT_SUBSTR: list[tuple[str, str]] = [
    ("argate", "Player_P01"),
    ("servidoni", "Player_P02"),
    ("marajoli", "Player_P04"),
]

OWNER_ACCOUNT_ALIASES: dict[str, str] = {
    "lucas argate": "Conta_D01",
    "lucas.servidoni": "Conta_D02",
    "lucas servidoni": "Conta_D02",
    "marajoli.douglas": "Conta_D03",
    "marajoli douglas": "Conta_D03",
    "nestor girardi": "Conta_D04",
}

PARTICIPANT_EXACT: dict[str, str] = {
    "argate": "Participante_P01",
    "lucas argate": "Participante_P01",
    "lucas servidoni": "Participante_P02",
    "marajoli douglas": "Participante_P03",
    "nestor girardi": "Participante_P04",
}

_participant_cache: dict[str, str] = {}


def _hash_label(prefix: str, raw: str) -> str:
    h = hashlib.sha256(raw.encode("utf-8")).hexdigest()[:6]
    return f"{prefix}_{h}"


def pseudonymize_establishment(name: str | float) -> str:
    if pd.isna(name) or not str(name).strip():
        return ""
    original = str(name).strip()
    norm = normalize_name(original)
    if norm in ESTABLISHMENT_ALIASES:
        return ESTABLISHMENT_ALIASES[norm]
    for needle, label in ESTABLISHMENT_SUBSTR:
        if needle in norm:
            return label
    return original


def pseudonymize_owner_account(name: str | float) -> str:
    if pd.isna(name) or not str(name).strip():
        return ""
    original = str(name).strip()
    norm = normalize_name(original)
    if norm in OWNER_ACCOUNT_ALIASES:
        return OWNER_ACCOUNT_ALIASES[norm]
    for needle, label in [
        ("argate", "Conta_D01"),
        ("servidoni", "Conta_D02"),
        ("marajoli", "Conta_D03"),
        ("nestor girardi", "Conta_D04"),
    ]:
        if needle in norm:
            return label
    return _hash_label("Conta", norm)


def pseudonymize_participant(name: str | float) -> str:
    """Stable pseudonym per display name; known aliases get fixed labels."""
    if pd.isna(name) or not str(name).strip():
        return ""
    original = str(name).strip()
    norm = normalize_name(original)
    if norm in PARTICIPANT_EXACT:
        return PARTICIPANT_EXACT[norm]
    for needle, label in [
        ("argate", "Participante_P01"),
        ("servidoni", "Participante_P02"),
        ("marajoli", "Participante_P03"),
        ("nestor girardi", "Participante_P04"),
    ]:
        if needle in norm:
            return label
    if norm not in _participant_cache:
        _participant_cache[norm] = _hash_label("Participante", norm)
    return _participant_cache[norm]


def pseudonymize_search_term(term: str | float) -> str:
    if pd.isna(term):
        return ""
    t = str(term).strip()
    norm = normalize_name(t)
    if re.search(r"\b(argate|servidoni|marajoli|nestor girardi|lucas argate|lucas servidoni)\b", norm):
        return pseudonymize_participant(t) if " " in t else _hash_label("Termo", norm)
    if re.search(r"\blucas\b", norm) and re.search(r"\b(reis|carlos|servidoni|argate)\b", norm):
        return _hash_label("Termo", norm)
    return t


def apply_pseudonymization(data: dict) -> dict:
    """Return copy of loaded frames with person names obfuscated for outputs."""
    out = dict(data)

    h = out["historico"].copy()
    h["estabelecimento"] = h["estabelecimento"].map(pseudonymize_establishment)
    h["cliente"] = h["cliente"].map(pseudonymize_participant)
    h["estabelecimento_norm"] = h["estabelecimento"].map(normalize_name)
    out["historico"] = h

    for key in ("pedidos_mes", "pedidos_dia"):
        df = out[key].copy()
        df["nome"] = df["nome"].map(pseudonymize_establishment)
        df["nome_norm"] = df["nome"].map(normalize_name)
        out[key] = df

    rank = out["rank_usuarios"].copy()
    rank["nome"] = rank["nome"].map(pseudonymize_establishment)
    rank["nome_norm"] = rank["nome"].map(normalize_name)
    out["rank_usuarios"] = rank

    ua = out["ultimo_acesso"].copy()
    ua["estabelecimento"] = ua["estabelecimento"].map(pseudonymize_establishment)
    ua["usuario"] = ua["usuario"].map(pseudonymize_owner_account)
    ua["estabelecimento_norm"] = ua["estabelecimento"].map(normalize_name)
    out["ultimo_acesso"] = ua

    ru = out["repeat_users"].copy()
    ru["nome"] = ru["nome"].map(pseudonymize_participant)
    out["repeat_users"] = ru

    cb = out["clientes_buscam"].copy()
    cb["nome"] = cb["nome"].map(pseudonymize_participant)
    out["clientes_buscam"] = cb

    bg = out["busca_global"].copy()
    bg["termo"] = bg["termo"].map(pseudonymize_search_term)
    bg["termo_norm"] = bg["termo"].map(lambda x: normalize_name(str(x)))
    out["busca_global"] = bg

    be = out["busca_estab"].copy()
    be["nome"] = be["nome"].map(pseudonymize_establishment)
    be["termo"] = be["termo"].map(pseudonymize_search_term)
    be["termo_norm"] = be["termo"].map(lambda x: normalize_name(str(x)))
    out["busca_estab"] = be

    if out.get("cadastro") is not None:
        cad = out["cadastro"].copy()
        cad["bar"] = cad["bar"].map(pseudonymize_establishment)
        cad["bar_norm"] = cad["bar"].map(normalize_name)
        out["cadastro"] = cad

    return out
