# Início rápido — testes manuais (Muziks)

Rotinas para **validar na sua máquina** o que o CI publica no Docker Hub — sem substituir testes automatizados.

## Spotify bridge (imagem Docker)

**Comece aqui:** [spotify-bridge/INICIO-RAPIDO.md](spotify-bridge/INICIO-RAPIDO.md)

Resumo em 6 passos:

1. Mesmo `PLAYBACK_WORKER_SECRET` em `apps/player/.env` e `docs/tests/spotify-bridge/.env`
2. `pnpm --filter @muziks/player dev` (porta 3002)
3. `docker login` → `docker compose -f docker-compose.test.yml pull up` na pasta `spotify-bridge/`
4. Criar player no browser + conectar Spotify
5. Script WebSocket ou wscat
6. `curl` no `playback-tick` com Bearer do secret

Detalhes, comandos copy-paste e troubleshooting: [spotify-bridge/docker-e2e.md](spotify-bridge/docker-e2e.md).

## Outras rotinas

| Rotina | Status |
|--------|--------|
| `muziks/web` (futuro) | Ainda sem Dockerfile — ver [DOCKER-REGISTRY-E-RELEASES.md](../tech/DOCKER-REGISTRY-E-RELEASES.md) |
