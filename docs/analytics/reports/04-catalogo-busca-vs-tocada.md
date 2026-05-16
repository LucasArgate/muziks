# Catálogo — busca vs tocada

Suporte a **search**, **firewall** e futuro **ISRC** ([06-queue-voting](../../specs/06-queue-voting-and-chips.md), [14-fronteiras-legais](../../specs/14-fronteiras-legais-direitos-autorais.md)).

## Gênero nas reproduções (novo export)

- Faixas no ranking: **11,454** · reproduções somadas: **45,747**
- Linhas com gênero **exportado** (coluna `Genero`): **33**
- Reproduções com gênero atribuído (export + artista + heurística): **20,792** (**45.4%** do total)

Códigos no export: `F`=Funk, `S`=Sertanejo, `R`=Rock, `E`=Eletrônico, `P`=Pagode. Restante classificado por artista já rotulado ou palavras-chave em título/artista — ver `scripts/genre.py`.

### Share de reproduções por gênero

| genero | reproducoes | pct_plays |
| --- | --- | --- |
| INDEFINIDO | 24955 | 54.6 |
| FUNK | 8204 | 17.9 |
| ROCK | 5402 | 11.8 |
| SERTANEJO | 4817 | 10.5 |
| ELETRONICO | 1796 | 3.9 |
| PAGODE | 573 | 1.3 |

### Mistura no top 50 faixas

- Gêneros distintos (entre classificados): **5**
- Faixas no top 50 ainda **sem** gênero atribuído: **1**

*Mesmo com classificação parcial, o padrão confirma fila **multigênero** no mesmo ecossistema — firewall por gênero/artista é operacional, não cosmético.*

#### Top 5 — FUNK

| nome | artista | quantidade |
| --- | --- | --- |
| Fazer Falta | Mc Livinho | 335 |
| Rabetão | Mc Lan | 307 |
| Paradinha | Anitta | 270 |
| Você Partiu Meu Coração | Nego do Borel | 213 |
| Sua Cara | Major Lazer | 166 |

#### Top 5 — SERTANEJO

| nome | artista | quantidade |
| --- | --- | --- |
| Sorte Que Cê Beija Bem (Ao Viv | Maiara & Maraisa | 150 |
| 50 Reais | Naiara Azevedo | 144 |
| Cê Acredita | Joao Neto & Frederico | 142 |
| 10% (Ao Vivo) | Maiara & Maraisa | 135 |
| Vidinha de Balada (Ao Vivo) | Henrique & Juliano | 134 |

#### Top 5 — ROCK

| nome | artista | quantidade |
| --- | --- | --- |
| Highway to Hell | AC/DC | 175 |
| Back in Black | AC/DC | 118 |
| Te Levar Daqui | Charlie Brown Jr. | 113 |
| Pisando Descalço | Maneva | 73 |
| Pais E Filhos | Legião Urbana | 72 |

*Observação do autor:* «Pisando Descalço» (Maneva) **não** é rock de fato; entrou neste bloco porque o fornecedor de metadados na época **não** classificava o gênero com precisão (reggae/MPB no caso). Reforça a necessidade de firewall editável pelo dono e de gênero vindo do provedor **com** override local no MVP.

#### Top 5 — ELETRONICO

| nome | artista | quantidade |
| --- | --- | --- |
| Hear Me Now | Alok | 174 |
| Fuego | Alok | 104 |
| Malandramente | Dennis | 103 |
| Automaticamente | Dennis DJ | 97 |
| This Girl (Kungs Vs. Cookin' O | Cookin' On 3 Burners | 81 |

#### Top 5 — PAGODE

| nome | artista | quantidade |
| --- | --- | --- |
| Cheia de Manias | Raça Negra | 105 |
| Deixa em Off (Ao Vivo) | Turma do Pagode | 66 |
| Cobertor de Orelha (Ao Vivo) | Turma do Pagode | 28 |
| Puxa Agarra e Beija (Ao Vivo) | Turma do Pagode | 22 |
| Maravilha | Raça Negra | 20 |

## Top 20 músicas tocadas

| nome | artista | quantidade | genero |
| --- | --- | --- | --- |
| Fazer Falta | Mc Livinho | 335 | FUNK |
| Rabetão | Mc Lan | 307 | FUNK |
| Paradinha | Anitta | 270 | FUNK |
| Você Partiu Meu Coração | Nego do Borel | 213 | FUNK |
| Highway to Hell | AC/DC | 175 | ROCK |
| Hear Me Now | Alok | 174 | ELETRONICO |
| Sua Cara | Major Lazer | 166 | FUNK |
| Open The Tcheka | Mc Lan | 162 | FUNK |
| Bumbum Granada | Mc Zaac | 152 | FUNK |
| Sorte Que Cê Beija Bem (Ao Viv | Maiara & Maraisa | 150 | SERTANEJO |
| Vai Embrazando | Mc Zaac | 149 | FUNK |
| 50 Reais | Naiara Azevedo | 144 | SERTANEJO |
| Cê Acredita | Joao Neto & Frederico | 142 | SERTANEJO |
| 10% (Ao Vivo) | Maiara & Maraisa | 135 | SERTANEJO |
| Vidinha de Balada (Ao Vivo) | Henrique & Juliano | 134 | SERTANEJO |

*… e mais 5 linhas.*

## Top 15 artistas (soma tocadas)

| artista | quantidade |
| --- | --- |
| Mc Lan | 704 |
| Mc Livinho | 608 |
| Wesley Safadão | 572 |
| AC/DC | 564 |
| Mc Kevinho | 563 |
| Maiara & Maraisa | 555 |
| Alok | 519 |
| Anitta | 489 |
| Charlie Brown Jr. | 452 |
| Henrique & Juliano | 446 |
| Red Hot Chili Peppers | 416 |
| Criolo | 392 |
| Marília Mendonça | 387 |
| Nego do Borel | 386 |
| Racionais MC's | 361 |

## Top 20 termos de busca

| termo | contagem |
| --- | --- |
| mc lan | 48 |
| Despacito | 45 |
| alok | 34 |
| Racionais | 26 |
| Rabetao | 23 |
| Anitta | 23 |
| Fazer falta | 23 |
| Acdc | 22 |
| Paradinha | 19 |
| Raimundos | 18 |
| Henrique e juliano | 18 |
| MC kevinho | 16 |
| mc livinho | 15 |
| Sua cara | 15 |
| Oh nanana | 13 |

*… e mais 5 linhas.*

## Termos frequentes sem correspondência óbvia no top tocadas

Heurística: substring entre termo e título/artista do ranking de tocadas.

| termo | contagem |
| --- | --- |
| Acdc | 22 |
| Xanaina | 10 |
| Mc | 8 |
| Open the theca | 7 |
| Refem | 5 |
| Ce acredita | 5 |
| Ac dc | 5 |
| J ax | 4 |
| Bumbum tamtam | 4 |
| Pabblo Vittar | 4 |
| Sweet dreans | 3 |
| Tnt | 3 |
| Paralizou | 3 |
| Raspao | 3 |
| Se seu hobby | 3 |

*Gap busca→play pode indicar catálogo incompleto, typos ou faixas bloqueadas — relevante para copy cortês e recovery.*

## Implicações para o MVP

- **Busca fuzzy** no catálogo — [11-backend](../../specs/11-backend-and-integrations-open.md).
- **Firewall** por gênero/artista — [04-rules-firewall](../../specs/04-rules-firewall.md); metadados de gênero devem vir do provedor **e** ser editáveis pelo dono.
- **Relatório ao dono:** mix de gênero por semana/noite (quando houver eventos) — alinha add-on em [business/01](../../business/01-receita-rentabilidade-e-go-to-market.md).

---

*Gerado em 2026-05-16 13:04 por `docs/analytics/scripts/run_all.py`. Dados legados 2016–2017; nomes de pessoas pseudonimizados.*
