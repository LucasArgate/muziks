# MVP — congelamento e decisões

Esta pasta concentra o **pacote de MVP congelado** e as **decisões de arquitetura** acordadas para validação rápida **sem** fechar portas para open source, crescimento e evolução técnica.

O [Manifesto](../MANIFESTO.md) e as [especificações em `specs/`](../specs/README.md) continuam sendo a base normativa; aqui consolidamos **o que entra no primeiro incremento publicável** e **com que stack** se pretende implementar, para alinhar contribuidores e roadmap.

## Documentos

| Documento | Conteúdo |
|-----------|----------|
| [congelamento-mvp-e-arquitetura.md](congelamento-mvp-e-arquitetura.md) | Escopo mínimo viável (incluído / fora), critério de saída, stack recomendada e alternativas |
| [02-viabilidade-custos-comparativo.md](02-viabilidade-custos-comparativo.md) | Premissas de uso, tabela comparativa (Supabase × AWS), Free → Pro, **POC 100% free tier** (front + Supabase ± Firebase Auth) |
| [03-viabilidade-integracao-spotify-eda.md](03-viabilidade-integracao-spotify-eda.md) | Spotify Connect, catálogo vs orquestração, eventos no servidor, limites da API |
| [04-viabilidade-integracao-secundaria-deezer.md](04-viabilidade-integracao-secundaria-deezer.md) | Deezer como secundário: busca/metadados, Python, ML/vector DB opcional |
| [05-identidade-fosso-participante-voto.md](05-identidade-fosso-participante-voto.md) | OAuth para participante (não streaming); sinais secundários; dono inalterado |
| [06-arquitetura-playback-spotify.md](06-arquitetura-playback-spotify.md) | **Decisão fechada** MVP-B: Web Playback SDK, fila Supabase, auto-next, scopes OAuth, abstrações front |

**Evidência histórica (rajada, ICP, super usuários):** [analytics/reports/05-insights-para-muziks-hoje.md](../analytics/reports/05-insights-para-muziks-hoje.md) — PoC: backend blindado, painel firewall, **3–5** bares ICP.

**Receita e modelo de negócio** (complementar a custos de infra): pasta [`../business/`](../business/README.md) — mapa de mecanismos além de mensal/fichas, OSS + freemium + *hosted*, e *go-to-market*.

## Próximos (a adicionar)

- Orçamento **USD→R$** de **Vercel Pro** ou host alternativo se o piloto deixar de ser “só pesquisa”; domínio próprio e e-mail transacional se necessário.
- **Quotas** finas de Web API (Spotify/Deezer) na POC.
- Outras notas que você for passando — podem virar novos `.md` nesta pasta ou seções nos documentos existentes.

## Leitura cruzada sugerida

- [business/README.md](../business/README.md) — viabilidade de **negócio** (receita, OSS/freemium, comercial/marketing) em conjunto com [02-viabilidade-custos-comparativo.md](02-viabilidade-custos-comparativo.md)
- [01-vision-and-scope.md](../specs/01-vision-and-scope.md) — visão e fronteiras de escopo no repo
- [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md) — integrações; alinhar com o que for fechado aqui
- [ESPECIFICACAO-FRONTEND.md](../tech/ESPECIFICACAO-FRONTEND.md) — PWA, React, TS, Tailwind, shadcn
- [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md) — PoC free, 5 players, AWS, CI/CD de dados
- [PROCESSO-DESENVOLVIMENTO.md](../tech/PROCESSO-DESENVOLVIMENTO.md) — Linear, branches, ambientes
- [MONOREPO-TURBOREPO.md](../tech/MONOREPO-TURBOREPO.md) — estrutura `apps/` e `packages/`
