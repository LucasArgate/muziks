# Viabilidade — integração **secundária** com Deezer (busca, metadados, ML)

**Propósito:** posicionar o **Deezer** como **segundo provedor** no ecossistema Muziks: forte em **API de leitura simples e previsível**, **busca estruturada** e baixa fricção para **experimentação** (incluindo *scripts* em Python) sobre **gêneros, artistas, faixas e relações** — sem substituir a tese de **execução primária** discutida para o Spotify em [03-viabilidade-integracao-spotify-eda.md](03-viabilidade-integracao-spotify-eda.md).

**Leitura obrigatória em paralelo:** [03-domain-model.md](../specs/03-domain-model.md) (ISRC e mapeamento `provedor + id → isrc`), [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md), [14-fronteiras-legais-direitos-autorais.md](../specs/14-fronteiras-legais-direitos-autorais.md).

> **Aviso:** políticas de **uso da API**, **limites de taxa** e **proibição de scraping** mudam. Trate exemplos de *machine learning* e *vector DB* como **camadas opcionais** que devem respeitar os **termos** do Deezer e a **minimização de dados** ([08-nfr-privacy-accessibility.md](../specs/08-nfr-privacy-accessibility.md)).

---

## 1. Papel “secundário” no produto

| Camada | Spotify (primário no desenho atual) | Deezer (secundário) |
|--------|-------------------------------------|----------------------|
| **Execução / fila no app do usuário** | Connect + Web API como caminho natural | Fora do foco inicial do Muziks (pode evoluir depois se houver demanda e API compatível com a tese legal) |
| **Catálogo, busca, metadados** | Caminho A do doc 03 | **Complemento** excelente para **search** legível, **exploração** e **enriquecimento** |
| **Pesquisa, prototipagem, ML** | Possível, porém mais cerimônia (OAuth, quotas) para muitos fluxos | **API pública REST** simples para **GET** em artista, álbum, faixa, gênero, *related*, etc. — ótimo para **aprendizado** e *pipelines* batch |

O domínio Muziks continua ancorado em **ISRC** quando disponível; o Deezer entra como **fonte adicional de metadados** e de **resolução** `deezer id ↔ metadados ↔ (ISRC se presente na resposta ou via cruzamento futuro)`.

---

## 2. Por que o Deezer ajuda em “metadata + ML + vector DB”

- **Respostas JSON estáveis** e endpoints **granulares** (`/search`, `/artist/:id`, `/album/:id`, `/track/:id`, gêneros, etc.) facilitam:
  - montar **datasets de treino** ou **validação** (ex.: classificação de gênero, *clustering* de artistas similares, detecção de inconsistência de rótulo);
  - alimentar **embeddings** (título, artista, álbum, *preview* textual) em **vector DB** para **busca semântica interna** (“sons parecidos com X”) **sem** depender só de string match;
  - **curadoria assistida** para o *firewall* ([04-rules-firewall.md](../specs/04-rules-firewall.md)) — sempre com humano no loop no início.
- **Curva de aprendizado baixa:** equipes e contribuidores OSS podem reproduzir fluxos com **poucas linhas** em Python (`requests`) ou ferramentas de *notebook*, útil para **comunidade BR** e materiais didáticos do repositório.

---

## 3. *Scripts* em Python (uso recomendado)

Cenários **saudáveis** para o Muziks:

1. **Offline / batch:** exportar amostras (IDs, gêneros, relacionamentos) → treinar ou calibrar modelos → publicar **apenas artefatos** (regras, listas, embeddings) no **seu** banco — não expor chaves nem revender *raw* em massa.
2. **Enriquecimento sob demanda:** um job que, dado `isrc` ou `spotify:track:`, consulta Deezer para **normalizar** artista/gênero quando houver ambiguidade.
3. **Avaliação de qualidade:** comparar metadados entre provedores para **detectar outliers** antes de aplicar política.

Evitar: **scraping** do site em paralelo à API, **armazenamento desnecessário** de PII, e uso que viole **fair use** comercial dos termos Deezer.

---

## 4. Arquitetura (encaixe com EDA / adaptadores)

Mesmo padrão do doc 03:

- Eventos internos: `CatalogEnrichmentRequested`, `DeezerMetadataResolved`, `GenreProfileUpdated`.
- **Adaptador Deezer** isolado (cliente HTTP + *rate limit* + *cache*); o **núcleo** não conhece detalhes do JSON além do **DTO** acordado.
- **Vector DB** (pgvector no Postgres, Qdrant, etc.) como **infraestrutura opcional** atrás do mesmo backend — não como dependência do MVP congelado.

---

## 5. Recomendação para o Muziks

1. Manter **Spotify** como linha **primária** de produto para **catálogo MVP** e **futura execução** (Connect), conforme [03](03-viabilidade-integracao-spotify-eda.md).
2. Adotar **Deezer como integração secundária oficial** para: **search** complementar, **metadados**, **prototipagem** e **futura** camada de **precisão** (ML / vetores) **sem** travar o MVP.
3. Documentar no código (quando existir) o **mapeamento** explícito entre IDs; nunca usar título solto como chave de política ([03-domain-model](../specs/03-domain-model.md)).

---

## 6. Documentação relacionada no repositório

- [03-viabilidade-integracao-spotify-eda.md](03-viabilidade-integracao-spotify-eda.md) — primário, eventos, Connect  
- [congelamento-mvp-e-arquitetura.md](congelamento-mvp-e-arquitetura.md) — o que entra no primeiro corte de software
