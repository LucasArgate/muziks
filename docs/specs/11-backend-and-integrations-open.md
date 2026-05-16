# Backend, dados e integrações (decisões abertas)

Este documento lista **o que ainda não está fechado** para o Muziks existir de ponta a ponta, com **critérios** para decidir. Nada aqui bloqueia leitura das outras specs; elas descrevem comportamento desejado **assumindo** que haverá serviços que suportem o domínio ([03-domain-model.md](03-domain-model.md)).

## 1. Backend e persistência — **fechado (PoC)**

**Decisão:** player, política, fila e votos vivem em **PostgreSQL (Supabase)** na PoC; API em **Next.js** (`apps/web` — API Routes / Server Actions); monorepo **Turborepo**; deploy **Vercel** + Supabase Free (100% *free tier* na validação inicial).

| Aspecto | Escolha |
|---------|---------|
| Persistência | Supabase (Postgres); **Drizzle** em `packages/db` (schema + migrations) |
| API na PoC | Dentro de `apps/web` — sem `apps/api` até gatilho de extração |
| Fila (leitura) | HTTP + polling 3–5 s; cache na borda |
| Votos (escrita) | HTTP POST + rate-limit + fila de eventos serializada |
| Migração futura | AWS RDS + WS sob demanda; estratégia strangler — ver [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md) |

**Gatilho preparação Fase infra B:** **5 players constantes** (definição em STACK §2.1).

Detalhe completo de stack, fases e CI de dados: [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md). Estrutura do monorepo: [MONOREPO-TURBOREPO.md](../tech/MONOREPO-TURBOREPO.md). Organização de código server: [15-backend-architecture.md](15-backend-architecture.md), [VERTICAL-SLICE-ARCHITECTURE.md](../tech/VERTICAL-SLICE-ARCHITECTURE.md).

## 2. Autenticação e identidade

**Pergunta:** Participantes são anônimos (sessão), magic link, OAuth social, ou mistura?

**Critérios:**

- Equilíbrio entre **baixo atrito** e **anti-fraude** ([06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).
- LGPD e minimização de dados ([08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md)).

**Direção sugerida (pacote MVP):** **superfície pública** (fila/estado não sensível, busca exploratória) **sem** login forte; no **ato** de votar ou enviar proposta vinculante — **depois** de explicar o “por quê” — **OAuth** (Google, Apple, Meta/Facebook conforme disponibilidade); **não** exigir Spotify/Deezer só para participar. Sinais secundários (IP, id de instalação) como camada de risco. Detalhe: [../mvp/05-identidade-fosso-participante-voto.md](../mvp/05-identidade-fosso-participante-voto.md).

## 3. Fonte do catálogo musical

**Pergunta:** De onde vêm gênero/artista/faixa para política e busca?

**Opções:** integração com provedor de streaming, base própria, upload, híbrido.

**Critérios:**

- Capacidade de aplicar **firewall** com metadados confiáveis ([04-rules-firewall.md](04-rules-firewall.md)).
- **Compliance** com termos do provedor e com execução pública (fora do escopo de “ficha de voto”, mas crítico para o negócio) — guardrails em [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md).

### ISRC como “fosso” e lingua franca entre fornecedores

O **ISRC** (*International Standard Recording Code*) é o identificador **global** da **gravação** (fonograma), independente de loja ou app. Tratá-lo como **chave canónica interna** do Muziks cria uma **vantagem estrutural**: metadados vindos de **Spotify, Apple Music, YouTube Music, Deezer**, etc. **convergem** para o mesmo endereço lógico, o que:

- permite **interfaces e APIs globais** (“esta faixa” = este ISRC), com mapeamento opcional para o URI que cada SDK exige na hora de tocar;
- aumenta **precisão na curadoria** (bloqueio/liberação por faixa não se perde ao trocar de provedor ou ao corrigir grafia de título);
- viabiliza **condensação de comportamentos** — votos, pedidos repetidos, heatmaps e cohorts por **obra gravada** real, em vez de duplicar contagens por ID regional do catálogo.

**Requisitos de implementação (quando o catálogo for fechado):** ingerir ISRC sempre que a fonte o fornecer; manter tabela de **alias** `provedor + id nativo → isrc`; definir política para **faixas sem ISRC** (só ID nativo, possível enriquecimento posterior). Referência normativa do esquema: [IFPI — ISRC](https://isrc.ifpi.org/). O ISRC **não** substitui licença de uso nem ECAD; apenas alinha **identidade técnica** — ver [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md).

## 4. Reprodução de áudio — **fechado (MVP-B)**

**Decisão:** o áudio toca no **Player Master** (navegador do **dono** ou do **telão** em Chrome/kiosk), via **Spotify Web Playback SDK**; fila e votos permanecem no **Postgres (Supabase)**; estado de sessão e comandos remotos usam **Supabase Realtime** (baixa cardinalidade). O público **não** reproduz áudio nem precisa Premium.

| Aspecto | Escolha |
|---------|---------|
| Motor de áudio | Spotify Web Playback SDK no cliente Master |
| Controle remoto / fila nativa | Spotify Web API (Player) com token do **dono** |
| Transição automática | `PlaybackManager` no Master (`player_state_changed`, ~5 s antes do fim) |
| Sync telão / dono / comandos | Realtime `player_sessions` + `playback_commands` |
| Leitura da fila (massa) | Polling HTTP 3–5 s (inalterado na PoC) |

Detalhe completo: [../mvp/06-arquitetura-playback-spotify.md](../mvp/06-arquitetura-playback-spotify.md). Viabilidade e EDA: [../mvp/03-viabilidade-integracao-spotify-eda.md](../mvp/03-viabilidade-integracao-spotify-eda.md). Compliance: [14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md).

**Escopo:** reprodução integrada entra no **MVP-B** (piloto com som), não no MVP-A (só fila/votos) — [../mvp/congelamento-mvp-e-arquitetura.md](../mvp/congelamento-mvp-e-arquitetura.md).

## 5. Modelo exato da fila

**Pergunta:** Proposta entra direto vs estado “pendente”? Dono pode reordenar à mão sempre?

**Critérios:** UX do público vs controle do dono ([06-queue-voting-and-chips.md](06-queue-voting-and-chips.md)).

## 6. Fichas: ledger e fraude

**Pergunta:** Quem emite saldo, como auditar, como impedir duplicação?

**Critérios:** simplicidade de MVP vs risco financeiro/reputacional.

## 7. API pública e versionamento

**Pergunta:** Contrato da API, autenticação de dono vs público, limites.

**Critérios:** segurança ([08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md)), DX do front.

## 8. Notificações push (futuro)

**Pergunta:** Usar Web Push para “sua faixa subiu”?

**Critérios:** valor vs permissões iOS; privacidade.

## 9. Curadoria contextual com agentes (futuro)

**Pergunta:** Oferecer camada opcional de **agente curador** sobre o firewall estático (*mood* da fila, pedidos no limite, “essência do espaço”)?

**Critérios:**

- **Previsibilidade** e precedência: regras duras (dia, gênero, artista, faixa) **sempre** vencem o agente ([04-rules-firewall.md](04-rules-firewall.md)).
- **Transparência** para participante e dono (motivo humano, log, opt-out total).
- Custo, latência, privacidade ([08-nfr-privacy-accessibility.md](08-nfr-privacy-accessibility.md)); não confundir com licenciamento de obra ([14-fronteiras-legais-direitos-autorais.md](14-fronteiras-legais-direitos-autorais.md)).

**Hipótese de produto:** [firewall-curador-com-agentes.md](../disruption/firewall-curador-com-agentes.md). **Fora do MVP** ([01-vision-and-scope.md](01-vision-and-scope.md)).

## 10. Rajada, tempo real e custo — **fechado (PoC)**

Decisão registrada em [STACK-E-FASES-DE-MIGRACAO.md](../tech/STACK-E-FASES-DE-MIGRACAO.md) §3 (HTTP vote, polling fila, sem Realtime por participante). Custo: [02-viabilidade-custos-comparativo.md](../mvp/02-viabilidade-custos-comparativo.md).

## 10.1 Sincronização local da fila (experimento — fora do MVP)

**Hipótese:** no mesmo espaço físico (mesmo player), propagar **snapshots de leitura** da fila via **WebRTC DataChannel** entre telão e celulares, reduzindo GET repetidos — **sem** alterar POST de voto nem fonte de verdade no Postgres.

- Detalhe, invariantes e spikes: [hub-local-webrtc-e-fanout.md](../disruption/hub-local-webrtc-e-fanout.md).
- **Não** implementar na PoC salvo conclusão positiva do spike E1 (telão âncora).

## 11. Busca tolerante a erros (fuzzy)

**Contexto:** termos de busca com typos e grafias alternativas são frequentes no histórico ([04-catalogo-busca-vs-tocada](../analytics/reports/04-catalogo-busca-vs-tocada.md)).

**Requisitos quando o catálogo fechar:**

- Camada de **fuzzy match** (Levenshtein, trigram ou índice do provedor) sobre título/artista antes de devolver “não encontrado”.
- Normalização (case, acentos, remoção de “ao vivo”, etc.) alinhada a alias **ISRC** (secção 3).
- UX de **recovery** quando a busca não casa com play — [07-ux-copy-and-states.md](07-ux-copy-and-states.md).

---

## Próximos passos sugeridos

1. Fechar **auth + modelo de fila** (itens 2, 5) — backend base, rajada e reprodução MVP-B já fechados (itens 1, 4, 10).
2. Fechar **catálogo** (item 3) — desbloqueia busca/firewall com metadados confiáveis.
3. Tratar **fichas** como camada opcional após voto estável (item 6).

Quando cada item fechar, **remover ou encurtar** a seção correspondente aqui e registrar a decisão na spec mais próxima (domínio, PWA, NFR).
