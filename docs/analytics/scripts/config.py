"""Paths and file names for the legacy Muziks analytics pipeline."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
SAMPLE_DIR = DATA_DIR / "sample"
REPORTS_DIR = ROOT / "reports"
SCRIPTS_DIR = Path(__file__).resolve().parent

FILES = {
    "historico": "Muziks - Hitórico de Pedidos por Cliente vs Estabeleimentos.csv",
    "pedidos_mes": "Muziks - Quantidade de pedidos por Mes.csv",
    "pedidos_dia": "Muziks - Quantidade de Pedidos por DIA.csv",
    "usuarios_mes": "Muziks - Quantidade Usuários por Mes.csv",
    "rank_usuarios": "Muziks - Rank novos usuários por estabelecimento .csv",
    "ultimo_acesso": "Muziks - Ultimo Acesso de estabelecimento.csv",
    "repeat_users": "Muziks - Usuários que pediram mais de uma vez.csv",
    "clientes_buscam": "Muziks - Clientes que mais buscam.csv",
    "musicas": "Muziks - Músicas mais tocadas.csv",
    "busca_global": "Muziks - Termo de busca mais realizado.csv",
    "busca_estab": "Muziks - Termo de busca por estabelecimento.csv",
    "cadastro": "Muziks - Cadastro de Bares.csv",
}

# Reports that do not require cadastro (PII-heavy)
OPTIONAL_KEYS = {"cadastro"}

ENCODINGS = ("utf-8", "utf-8-sig", "latin-1", "cp1252")


def data_path(key: str) -> Path:
    return DATA_DIR / FILES[key]


def missing_files(required_only: bool = False) -> list[str]:
    missing = []
    for key, name in FILES.items():
        if required_only and key in OPTIONAL_KEYS:
            continue
        if not data_path(key).exists():
            missing.append(name)
    return missing
