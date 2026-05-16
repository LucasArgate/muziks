#!/usr/bin/env python3
"""Run all legacy Muziks analytics reports."""
from __future__ import annotations

import sys

from config import REPORTS_DIR, SAMPLE_DIR, missing_files
from normalize import load_all
from reports_md import (
    report_00,
    report_01,
    report_02,
    report_03,
    report_04,
    report_05,
    write_samples,
)

REPORTS = [
    ("00-resumo-executivo.md", report_00),
    ("01-oferta-players.md", report_01),
    ("02-demanda-participantes.md", report_02),
    ("03-ponte-pedidos-e-sazonalidade.md", report_03),
    ("04-catalogo-busca-vs-tocada.md", report_04),
    ("05-insights-para-muziks-hoje.md", report_05),
]


def main() -> int:
    missing = missing_files(required_only=True)
    if missing:
        print("Ficheiros em falta em docs/analytics/data/:", file=sys.stderr)
        for name in missing:
            print(f"  - {name}", file=sys.stderr)
        print("\nVer docs/analytics/data/README.md", file=sys.stderr)
        return 1

    opt = missing_files(required_only=False)
    cadastro_missing = "Muziks - Cadastro de Bares.csv" in opt
    if cadastro_missing:
        print("Aviso: Cadastro de Bares ausente — relatório 01 sem secção CRM.")

    print("A carregar CSVs...")
    data = load_all()

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    for filename, fn in REPORTS:
        path = REPORTS_DIR / filename
        path.write_text(fn(data), encoding="utf-8")
        print(f"  OK {path.relative_to(REPORTS_DIR.parent)}")

    print("A gravar amostras em data/sample/...")
    write_samples(data, SAMPLE_DIR)
    print("Concluído.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
