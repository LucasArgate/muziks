# Playback: bridge/sidecar só para espaços pagantes

**Referência:** maio/2026  
**Status:** decisão de produto e custo (normativa para packaging e engenharia)  
**Espelho técnico:** [ADR-spotify-state-sync.md](../tech/ADR-spotify-state-sync.md) · [ADR-librespot-playback-sidecar.md](../tech/ADR-librespot-playback-sidecar.md)

---

## 1. Decisão

O serviço **`apps/spotify-bridge`** (sidecar librespot + WebSocket + chamadas à API interna) é **exclusivo de espaços pagantes** — donos que **contribuem** com receita alinhada ao uso que **gera custo real** na plataforma.

Espaços **freemium** (gratuitos / trial com limites) usam **somente a camada 1**:

- **Spotify Web Playback SDK** e **Web API** no browser Master (`apps/player`);
- persistência de sessão e fila no Postgres;
- **Supabase Realtime Broadcast** para telão e observadores.

Não há provisionamento de bridge dedicado, nem sessão WS permanente no bridge, para tier gratuito.

---

## 2. Por que (sustentabilidade e classe de negócio)

| Fator | Camada 1 (freemium) | Camada 2 (bridge — pago) |
|-------|---------------------|---------------------------|
| **Custo de infra** | Vercel/serverless + Supabase no hot path do Master | **VM/container 24/7**, disco, rede, ops |
| **Custo humano** | Best effort; dono mantém Master aberto | Observação contínua; menos dependência de aba do browser |
| **Complexidade** | APIs oficiais Spotify | librespot (manutenção, risco ToS, upgrades) |
| **Valor percebido** | Fila + voto + playback no espaço com dono ativo | **Confiabilidade** de estado, fim de faixa, fila em evento longo |
| **Demanda** | PoC, bar pequeno, trial | Operação comercial, telão, sessões longas, pico |

O bridge não é “feature premium decorativa”: é **abstração de custo marginal** — quem consome infraestrutura persistente e worker interno **paga** pelo tier que a cobre.

**Objetivos alinhados:**

- **Sustentável:** receita ≥ custo variável (bridge + tick + Realtime + storage) por espaço.
- **Seguro:** menos superfície operacional exposta em massa no tier gratuito (secrets Connect, workers internos).
- **Idempotente e previsível:** fila e dequeue permanecem na **API Muziks**; bridge é sensor/orquestrador pago, não atalho que bypassa regras.
- **Atende demanda por classe:** freemium = experiência válida com SDK; pagante = SLA operacional superior.

---

## 3. O que cada tier inclui

### 3.1 Freemium (gratuito / trial)

| Incluído | Não incluído |
|----------|----------------|
| Master com Web Playback SDK + modo hybrid/API | `spotify-bridge` provisionado |
| `POST /api/players/{slug}/playback/session` | WebSocket para bridge |
| Fila Muziks, votos, telão via Broadcast | Observação librespot 24/7 |
| Near-end / mirror-next via Master (quando implementado) | `near_end` / `track_ended` via sidecar dedicado |

**Fallback aceitável no free:** `playback-tick` leve (se habilitado globalmente), poll Web API no Master, dequeue manual ou semi-automático no cliente — sempre sem container dedicado por espaço.

### 3.2 Pagante (assinatura do espaço / plano Pro)

| Incluído |
|----------|
| Tudo do freemium |
| Provisionamento de **bridge** por espaço (ou pool com quota documentada) |
| Eventos precisos de fim de faixa e espelho de fila via sidecar |
| Prioridade em cotas de worker / rate limits internos |

Comunicação comercial sugerida: *“Playback contínuo no telão mesmo com o notebook fechado”* — só onde o bridge estiver contratado.

---

## 4. Matriz resumida

| Capacidade | Freemium | Pagante |
|------------|----------|---------|
| Áudio no Master (SDK) | Sim | Sim |
| Estado sessão → Postgres + Broadcast | Sim | Sim |
| Preload near-end (mirror-next no Master) | Sim | Sim |
| Container `muziks-spotify-bridge` | **Não** | **Sim** |
| librespot / Connect sidecar | **Não** | **Sim** |
| `POST /internal/playback/track-ended` via bridge | **Não** | **Sim** |

---

## 5. Enforcement (produto e engenharia)

Decisão de negócio **deve** virar controles técnicos (quando billing existir):

1. **Flag por espaço/player** (ex.: `playback_bridge_enabled` ou feature do plano) — default `false` no free.
2. **API interna** (`track-ended`, tick pesado, mirror via worker): rejeitar se plano ≠ pagante (403 + código estável).
3. **Provisionamento:** script/ops só sobe bridge para `player_id` na allowlist de pagantes.
4. **UX:** não mostrar “ativar bridge” no painel free; CTA de upgrade com benefício claro.

Até existir billing automatizado, **allowlist manual** em staging/prod é aceitável; a regra de produto já vale para PRs e docs.

---

## 6. Relação com OSS e self-host

- Código do bridge pode permanecer **aberto** no monorepo (Apache-2.0).
- **Hosted Muziks** cobra pelo **serviço gerenciado** (VM + ops + SLA), não pela licença do binário.
- Self-host avançado: comunidade pode rodar bridge **na própria infra** — fora do custo da cloud Muziks; não confundir com tier freemium **hosted**.

Ver [01-receita-rentabilidade-e-go-to-market.md](./01-receita-rentabilidade-e-go-to-market.md) §5 (OSS + freemium).

---

## 7. Checklist comercial e produto

- [ ] Matriz de packaging lista bridge explicitamente no plano pago.
- [ ] Landing / painel: uma frase do que o free **não** promete (playback 24/7 sem Master).
- [ ] Custos do bridge por espaço estimados em [02-viabilidade-custos-comparativo.md](../mvp/02-viabilidade-custos-comparativo.md) (linha VM/worker).
- [ ] Specs de UX atualizadas quando copy de upgrade existir ([07-ux-copy-and-states.md](../specs/07-ux-copy-and-states.md)).

---

## Referências

- [ADR-spotify-state-sync.md](../tech/ADR-spotify-state-sync.md)
- [PLAYBACK-NEAR-END-AND-QUEUE-MIRROR.md](../tech/PLAYBACK-NEAR-END-AND-QUEUE-MIRROR.md)
- [06-arquitetura-playback-spotify.md](../mvp/06-arquitetura-playback-spotify.md)
