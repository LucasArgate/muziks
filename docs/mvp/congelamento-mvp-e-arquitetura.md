# Congelamento do MVP e decisões de arquitetura

**Intenção:** congelar o MVP e fechar decisões de arquitetura de forma madura, escalável e pensada para **open source** e **futuro**. Priorizar **velocidade de validação** hoje sem fechar portas para crescimento amanhã.

---

## 1. Congelamento do MVP (escopo mínimo viável)

### Objetivo do MVP

Demonstrar o núcleo do manifesto — **“Público participa; o espaço manda na política”** — com o mínimo de complexidade operacional e técnica.

### Incluído no MVP (obrigatório)

- **Player** com slug ou nome único + **link/QR** para acesso (GPS fica **“pronto para adicionar”** logo após o MVP).
- **Política simplificada** (mas **extensível**): allow/deny por gênero, artista, faixa específica e por dia da semana — pode começar com regras mais simples (ex.: lista de gêneros permitidos + exceções).
- **Fila com votos**: ranking simples por quantidade de votos.
- **Feedback cortês** quando algo é bloqueado (UX alinhada à política do espaço).
- **Autenticação leve** para **dono do player** (admin), política e moderação — conforme specs existentes ([11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md)).
- **Participantes:** **login obrigatório** com provedor de identidade (OAuth: ex. Google, Apple, Meta/Facebook conforme stack) para **votar e atuar na fila**; **não** exigir Spotify/Deezer só para pedir música — identidade como fosso de segurança e limites de frequência em [05-identidade-fosso-participante-voto.md](05-identidade-fosso-participante-voto.md).
- **PWA** (React + TypeScript + Tailwind + shadcn/ui) seguindo **Atomic Design** (ver [`docs/tech/ESPECIFICACAO-FRONTEND.md`](../tech/ESPECIFICACAO-FRONTEND.md) e [`docs/tech/ATOMIC-DESIGN.md`](../tech/ATOMIC-DESIGN.md)).
- **Modo telão básico**: fila pública visível.

### Fases do MVP (playback)

| Fase | O que valida | Playback |
|------|----------------|----------|
| **MVP-A** | Fila, votos, política, telão visual, link/QR | **Sem** áudio orquestrado pelo app |
| **MVP-B** | Piloto com som no espaço (ICP) | **Com** arquitetura fechada — [06-arquitetura-playback-spotify.md](06-arquitetura-playback-spotify.md) |

### Fora do MVP (adiar)

- **Fichas / economia de chips** — tratar como feature opcional **pós-MVP**.
- **Geolocalização completa** (GPS + raio) — primeiro **link/QR**; GPS como evolução documentada.
- **Notificações push** avançadas.
- **Moderação avançada / anti-fraude enterprise**.

*(Reprodução integrada não é MVP-A; no MVP-B usa Spotify Web Playback SDK + Supabase — ver doc 06.)*

### Critério de saída do MVP

Um dono consegue:

1. **Criar** um player  
2. **Definir** política  
3. **Compartilhar** link/QR  
4. Participantes **votam** e **veem a fila atualizada** com latência aceitável no salão (polling na borda, não WebSocket por cliente no pico)

Isso valida a hipótese principal com **baixo risco** antes de investir em economia de fichas, GPS rígido ou playback integrado.

### PoC guiada por dados (piloto fechado)

Evidência do arquivo 2016–2017 ([05-insights](../analytics/reports/05-insights-para-muziks-hoje.md)): volume real concentrou-se em **poucos** espaços de alta energia; cadastro amplo de bares “pendentes” não gerou tração.

**Incluído na PoC (além do escopo técnico acima):**

| Entregável | Notas |
|------------|--------|
| **Backend blindado** | Voto via HTTP + rate-limit + fila de processamento de escritas |
| **Painel do dono** | Firewall (gênero/artista/faixa/dia) como **obrigatório** no piloto, não opcional |
| **Onboarding B2B cirúrgico** | **3–5** estabelecimentos no perfil ICP (fluxo jovem / universitário / alta rotação), sem cadastro público de novos bares |

**Métrica de sucesso do piloto (negócio):** pelo menos um espaço com **≥50 participantes distintos numa noite** com votação válida — não “quantos bares ativamos no CRM”.

---

## 2. Decisões de arquitetura (backend + integrações)

**Critérios:** open source, Brasil, **custo baixo** no início, escala futura, manutenibilidade e facilidade de contribuição.

### 2.1 Stack fechada (PoC)

| Camada | Tecnologia | Motivo (hoje + futuro) |
|--------|------------|------------------------|
| **Monorepo** | **Turborepo** + `pnpm` | Apps `web`, `blog`; packages compartilhados — [MONOREPO-TURBOREPO.md](../tech/MONOREPO-TURBOREPO.md) |
| **App produto** | **Next.js** (App Router) em `apps/web` | PWA em `player.muziks.app/{slug}`; API Routes na PoC |
| **Blog** | **Next.js** em `apps/blog` | `blog.muziks.com.br`; deploy Vercel separado |
| **Banco** | **PostgreSQL** (Supabase Free) + **Drizzle** em `packages/db` | Migrations versionadas; client compartilhado |
| **Fila (leitura)** | Polling HTTP 3–5 s + cache Vercel | Sem WS por participante — [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md) |
| **Votos** | HTTP POST + rate-limit + fila de eventos | Rajada de fim de semana |
| **Auth** | Supabase Auth (OAuth Google/Apple) | LGPD; ver [05-identidade-fosso-participante-voto.md](05-identidade-fosso-participante-voto.md) |
| **Deploy** | **Vercel** (Hobby PoC interna; Pro piloto comercial) + Supabase | **100% free tier** na validação inicial |
| **DNS + borda** | **Cloudflare** (DNS já apontado) | Proxy/CDN/SSL na frente da Vercel; R2/Pages/Workers como opções — [STACK §1.4](../tech/STACK-E-FASES-DE-MIGRACAO.md) |
| **Catálogo** | ISRC + Spotify + Deezer secundário | [03](03-viabilidade-integracao-spotify-eda.md), [04](04-viabilidade-integracao-secundaria-deezer.md) |
| **Playback (MVP-B)** | Web Playback SDK (Master) + Web API + Supabase Realtime (sessão) | [06](06-arquitetura-playback-spotify.md) |

### Por que esta combinação?

- Muito usada na comunidade **BR** → mais fácil atrair contribuidores open source.
- Boa performance e **developer experience**.
- **Supabase** acelera o MVP (auth + DB + realtime + storage em um lugar).
- **Migração futura** é viável (ex.: NestJS + Postgres puro + Redis) sem reescrever o modelo mental do domínio.

### Alternativas fortes

| Perfil | Abordagem |
|--------|-----------|
| **Máxima velocidade no MVP** | Tudo em **Supabase** (BaaS) + **Next.js** fullstack |
| **Máxima portabilidade / OSS** | **NestJS** + **Drizzle** + PostgreSQL + **Socket.io** (mesmo `packages/db` do monorepo) |
| **Escala grande (futuro)** | **Redis** (filas, rate limit), **RabbitMQ** ou **Kafka** (eventos), etc. — adicionar quando métricas e orçamento justificarem |

### Escolha *para agora*

**Turborepo + Next.js (`apps/web`) + Supabase Free + Vercel** — PoC 100% *free tier*.

**Gatilho preparação infra Fase B:** **5 players constantes** (definição em [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md) §2.1) — inventário de quotas, staging, runbooks, desenho AWS.

Extração futura: `apps/api` ou NestJS/AWS mantendo `packages/db` e contratos HTTP — ver [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md).

**Processo de dev:** Linear, GitFlow (blog/docs), GitHub Actions + releases (`web`) + registry Docker para releases funcionais — [PROCESSO-DESENVOLVIMENTO.md](../tech/PROCESSO-DESENVOLVIMENTO.md), [DOCKER-REGISTRY-E-RELEASES.md](../tech/DOCKER-REGISTRY-E-RELEASES.md).

**Backend (organização):** Vertical Slice Architecture — [VERTICAL-SLICE-ARCHITECTURE.md](../tech/VERTICAL-SLICE-ARCHITECTURE.md), [15-backend-architecture.md](../specs/15-backend-architecture.md).

---

## 3. Manutenção deste documento

- Mudanças de escopo do MVP ou de stack **devem** ser refletidas aqui e, quando normativas, propagadas para as specs em [`docs/specs/`](../specs/README.md) (em especial `01-vision-and-scope.md` e `11-backend-and-integrations-open.md`).
- **Stack, fases e migração:** [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md).
- **Custos e viabilidade (estimativa maio/2026):** [02-viabilidade-custos-comparativo.md](02-viabilidade-custos-comparativo.md).
