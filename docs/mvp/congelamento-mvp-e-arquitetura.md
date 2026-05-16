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

### Fora do MVP (adiar)

- **Fichas / economia de chips** — tratar como feature opcional **pós-MVP**.
- **Geolocalização completa** (GPS + raio) — primeiro **link/QR**; GPS como evolução documentada.
- **Integração profunda com streaming** (reprodução real controlada pelo app) — fora do primeiro corte de validação.
- **Notificações push** avançadas.
- **Moderação avançada / anti-fraude enterprise**.

### Critério de saída do MVP

Um dono consegue:

1. **Criar** um player  
2. **Definir** política  
3. **Compartilhar** link/QR  
4. Participantes **votam** e **veem a fila atualizada em tempo real**

Isso valida a hipótese principal com **baixo risco** antes de investir em economia de fichas, GPS rígido ou playback integrado.

---

## 2. Decisões de arquitetura (backend + integrações)

**Critérios:** open source, Brasil, **custo baixo** no início, escala futura, manutenibilidade e facilidade de contribuição.

### 2.1 Recomendação principal (stack sugerida)

| Camada | Tecnologia recomendada | Motivo (hoje + futuro) |
|--------|------------------------|------------------------|
| **Frontend** | React + TypeScript + Vite + Tailwind + shadcn/ui + PWA | Já alinhado às specs do Muziks; boa DX e ecossistema |
| **Backend** | **NestJS** (Node.js) *ou* **Next.js** App Router (API Routes + Server Actions) | NestJS: estrutura mais “enterprise” e amigável a OSS modular. Next.js: monorepo fullstack mais simples no MVP |
| **Banco de dados** | **PostgreSQL** (Supabase ou Neon) | Modelo relacional forte para regras em camadas + calendário; Supabase oferece realtime útil no início |
| **Realtime** | Supabase Realtime *ou* Socket.io / Pusher / Ably | Votos e fila precisam de atualização quase instantânea |
| **Auth** | Supabase Auth *ou* Clerk *ou* NextAuth v5 | Magic links + OAuth (Google/Apple); minimizar dados pessoais (LGPD) |
| **Armazenamento** | Supabase Storage *ou* AWS S3 | Capas, ícones, assets leves |
| **Deploy** | Vercel (frontend) + Railway / Fly.io / Render (backend) *ou* stack concentrada no Supabase | Custo inicial baixo; caminho de escala conhecido |
| **Catálogo musical** | **ISRC** como chave principal + integração inicial com **Spotify API** + **Deezer** como secundário ([04](04-viabilidade-integracao-secundaria-deezer.md)) | Identificação estável de faixas; execução remota e eventos Spotify em [03](03-viabilidade-integracao-spotify-eda.md); busca/metadados/ML enriquecido via Deezer no [04](04-viabilidade-integracao-secundaria-deezer.md) |

### Por que esta combinação?

- Muito usada na comunidade **BR** → mais fácil atrair contribuidores open source.
- Boa performance e **developer experience**.
- **Supabase** acelera o MVP (auth + DB + realtime + storage em um lugar).
- **Migração futura** é viável (ex.: NestJS + Postgres puro + Redis) sem reescrever o modelo mental do domínio.

### Alternativas fortes

| Perfil | Abordagem |
|--------|-----------|
| **Máxima velocidade no MVP** | Tudo em **Supabase** (BaaS) + **Next.js** fullstack |
| **Máxima portabilidade / OSS** | **NestJS** + Prisma + PostgreSQL + **Socket.io** |
| **Escala grande (futuro)** | **Redis** (filas, rate limit), **RabbitMQ** ou **Kafka** (eventos), etc. — adicionar quando métricas e orçamento justificarem |

### Escolha recomendada *para agora*

**Next.js 15 (App Router) + Supabase** para o MVP.

Se surgir necessidade de mais controle de processos, filas ou limites de vendor lock-in, **migrar o backend** para **NestJS** mantendo o **mesmo banco** e contratos de API estáveis.

---

## 3. Manutenção deste documento

- Mudanças de escopo do MVP ou de stack **devem** ser refletidas aqui e, quando normativas, propagadas para as specs em [`docs/specs/`](../specs/README.md) (em especial `01-vision-and-scope.md` e `11-backend-and-integrations-open.md`).
- **Custos e viabilidade (estimativa maio/2026):** [02-viabilidade-custos-comparativo.md](02-viabilidade-custos-comparativo.md).
