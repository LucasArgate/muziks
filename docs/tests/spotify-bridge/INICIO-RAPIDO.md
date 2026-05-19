# Início rápido — testar `muziks/spotify-bridge` com Docker

Guia para **uma pessoa** validar, em poucos minutos, que a imagem do Docker Hub sobe, fala com o `apps/player` e responde no WebSocket.

**Tempo estimado:** 15–30 min na primeira vez (com `.env` já preenchidos).

**Guia completo (troubleshooting, comandos, fila, Spotify):** [docker-e2e.md](docker-e2e.md)

---

## O que você vai fazer

1. Subir o **player** local (API na porta 3002).
2. Configurar o **mesmo segredo** no player e no bridge.
3. **Baixar e rodar** a imagem `muziks/spotify-bridge` do Docker Hub.
4. Criar um **espaço (player)** no navegador e anotar o **slug**.
5. Confirmar **health** e **WebSocket**.

Não é obrigatório ter librespot instalado para este início rápido.

---

## Antes de começar

| Você precisa de | Onde conseguir |
|-----------------|----------------|
| Docker Desktop ou Engine | Instalado e rodando |
| Acesso ao repo **privado** `muziks/spotify-bridge` no Docker Hub | Login na org `muziks` |
| Projeto Supabase + `apps/player/.env` preenchido | Copiar de `.env.example` |
| Conta Spotify Developer + Premium no dono | [Spotify Dashboard](https://developer.spotify.com/dashboard) |
| `pnpm install` na raiz do monorepo | Uma vez no repo |

---

## Passo 1 — Segredo compartilhado

O bridge e o player **precisam do mesmo** `PLAYBACK_WORKER_SECRET` (mínimo 8 caracteres).

Na raiz do repositório, gere um valor (PowerShell ou Git Bash):

```bash
openssl rand -hex 32
```

Coloque **o mesmo texto** em:

- `apps/player/.env` → linha `PLAYBACK_WORKER_SECRET=...`
- `docs/tests/spotify-bridge/.env` → mesma linha (crie o arquivo no passo 3)

---

## Passo 2 — Subir o player

Terminal **1** (raiz do monorepo):

```bash
cp apps/player/.env.example apps/player/.env
# Edite apps/player/.env: Supabase, DATABASE_URL, Spotify, PLAYBACK_WORKER_SECRET

pnpm install
pnpm --filter @muziks/player dev
```

Deixe este terminal aberto. Confira no navegador: [http://127.0.0.1:3002/login](http://127.0.0.1:3002/login) deve abrir.

---

## Passo 3 — Configurar e subir o bridge (imagem do Hub)

Terminal **2**:

```bash
cd docs/tests/spotify-bridge
cp .env.example .env
```

Edite `docs/tests/spotify-bridge/.env`:

| Variável | Valor típico (dev local) |
|----------|---------------------------|
| `MUZIKS_PLAYER_API_URL` | `http://host.docker.internal:3002` |
| `PLAYBACK_WORKER_SECRET` | **igual** ao do `apps/player/.env` |

Login e container:

```bash
docker login
docker compose -f docker-compose.test.yml pull
docker compose -f docker-compose.test.yml up -d
docker compose -f docker-compose.test.yml logs -f
```

Para sair dos logs: `Ctrl+C` (o container continua rodando).

**Health:**

```bash
curl http://127.0.0.1:8765/health
```

Esperado: `{"ok":true,"librespot":false}`.

---

## Passo 4 — Criar um player no navegador

1. [http://127.0.0.1:3002/register](http://127.0.0.1:3002/register) — criar conta.
2. [http://127.0.0.1:3002/create](http://127.0.0.1:3002/create) — criar espaço, ex.: slug `bar-teste`.
3. Anote o **slug** (`bar-teste`).
4. Conectar Spotify: abra  
   `http://127.0.0.1:3002/api/spotify/login?slug=bar-teste`  
   e autorize com conta **Premium**.

**Obter o `playerId` (UUID)** — Supabase → SQL:

```sql
SELECT id, slug FROM players WHERE slug = 'bar-teste';
```

Guarde o `id` para o passo 5.

---

## Passo 5 — Testar WebSocket (30 segundos)

Com `playerId` do passo 4, na **raiz do repo**:

```bash
node docs/tests/spotify-bridge/scripts/ws-subscribe.mjs --player-id "<cole-o-uuid-aqui>"
```

Você deve ver algo como:

```text
[open] ws://127.0.0.1:8765
[msg] {"type":"bridge.ready","version":"0.0.0"}
[msg] {"type":"subscribed","playerId":"..."}
```

Alternativa com [wscat](https://github.com/websockets/wscat): `wscat -c ws://127.0.0.1:8765` e envie  
`{"type":"subscribe","playerId":"<uuid>"}`.

---

## Passo 6 — Testar ligação bridge → player (opcional mas recomendado)

No terminal, com o mesmo secret do `.env`:

```bash
# PowerShell
$env:PLAYBACK_WORKER_SECRET = "cole-o-mesmo-secret"
curl -X POST http://127.0.0.1:3002/api/internal/playback-tick `
  -H "Authorization: Bearer $env:PLAYBACK_WORKER_SECRET" `
  -H "Content-Type: application/json" `
  -d "{}"
```

```bash
# Git Bash / Linux / macOS
export PLAYBACK_WORKER_SECRET="cole-o-mesmo-secret"
curl -s -X POST http://127.0.0.1:3002/api/internal/playback-tick \
  -H "Authorization: Bearer $PLAYBACK_WORKER_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Resposta esperada: JSON com `playersProcessed` (número).  
`401 unauthorized` → secret **diferente** entre player e bridge.

---

## Parar tudo

```bash
cd docs/tests/spotify-bridge
docker compose -f docker-compose.test.yml down
```

No terminal do player: `Ctrl+C`.

---

## Deu certo?

- [ ] `curl …/health` → `"ok": true`
- [ ] WebSocket → `bridge.ready` e `subscribed`
- [ ] `playback-tick` → 200 (não 401)
- [ ] Dono com Spotify conectado no slug de teste

Se algo falhar, use a tabela **Problemas comuns** em [docker-e2e.md §9](docker-e2e.md#9-problemas-comuns).

---

## Próximos passos

| Quer… | Leia |
|-------|------|
| Pausar/play/next no Spotify, fila, dequeue | [docker-e2e.md §6](docker-e2e.md#6-enviar-comandos-três-camadas) |
| Usar tag de release (`v0.1.0`) em vez de `staging` | [docker-e2e.md §3](docker-e2e.md#3-pull-e-subir-o-bridge-imagem-do-registry) |
| librespot e eventos `playback.event` | [docker-e2e.md §7](docker-e2e.md#7-librespot-opcional-nesta-rotina) |
| CI que publica a imagem | [DOCKER-REGISTRY-E-RELEASES.md](../../tech/DOCKER-REGISTRY-E-RELEASES.md) |
