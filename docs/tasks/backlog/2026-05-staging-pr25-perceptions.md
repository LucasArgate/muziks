# Backlog — percepções de staging (PR #25)

Fonte: comentários do autor em [PR #25 — Feature/queue state player](https://github.com/LucasArgate/muziks/pull/25) (merge em `develop`, maio/2026). Itens abaixo valem para refinamento antes e depois de ir a produção.

Legenda: **bug** | **ux** | **produto** | **arquitetura** | **ops/humano** | **polish** | **ops** — ver [CICLO-ENTREGA-E-FOCO.md](../CICLO-ENTREGA-E-FOCO.md) §4

Prioridade até 30/05: [CICLO-ENTREGA-E-FOCO.md §5](../CICLO-ENTREGA-E-FOCO.md#5-foco-até-30052026--funcionalidade-core) (P0–P3).

---

## Playback, fila e sincronização com Spotify

| ID | Tipo | Item |
|----|------|------|
| P25-01 | bug | Fluxo de **permissões** (browser / Spotify) — revisar quando e quantas vezes pedimos consentimento. |
| P25-02 | bug | **Seek dessincronizado** entre UI Muziks e estado real do Spotify. |
| P25-03 | bug | **Tempo / progresso** (“starting wrong time” e “timer is not working”) — barra ou relógio não refletem o playback. |
| P25-04 | bug | **Incoerência** entre estado do player Muziks e **fila nativa do Spotify** após troca de faixa. |
| P25-05 | bug | **“Check next Spotify queue”** — alinhar o que mostramos com a fila real do Spotify. |
| P25-06 | bug | Dispositivo externo (**Amazon Echo Dot**): play não inicia; erro tipo **device is not started**; após play no app Spotify Android o Muziks **não atualiza** estado; ao selecionar dispositivo no Muziks a música **para no Spotify** e estados **não convergem no mesmo tempo**; após play pelo Muziks o Spotify toca mas **UI do Muziks não acompanha** — revisar ordem/atualização após chamadas ao SDK/API (polling vs resposta). |

---

## Separação web (participante) vs player (master)

| ID | Tipo | Item |
|----|------|------|
| P25-07 | ux | **Web (`muziks.app`) pedindo dispositivo Spotify** — escolha de device é **só responsabilidade do player**; participante não deveria ver esse fluxo. |
| P25-08 | arquitetura | **Telão / participante**: como o realtime entra em `usePublicPlaybackSession` e se o hero / now-playing de `docs/specs/16-ui-player-e-fila.md` já reflete isso. |

---

## OAuth, redirects e prompts repetidos

| ID | Tipo | Item |
|----|------|------|
| P25-09 | ux | **Pedidos repetidos** de permissão / login — “asking again?”, “3 times asking?”; revisar **storyboard** e jornada. |
| P25-10 | ops/humano | **Spotify Dashboard**: incluir redirect / allowed URL do **web** na app Spotify (tarefa operacional documentada no PR). |

---

## Arquitetura e performance

| ID | Tipo | Item |
|----|------|------|
| P25-11 | arquitetura | **playback-orchestrator** ficando pesado — documentar **precedência**: regras do dono (política) vs estado real Spotify vs votos da fila Muziks. |
| P25-12 | arquitetura | Confirmar se **PlaybackManager** no master ainda bate com `06-arquitetura-playback-spotify.md` (Postgres + SDK/API como fonte de verdade). |
| P25-13 | arquitetura | **Rajada**: worker + poller prontos para **50+ participantes** votando ao mesmo tempo? |

---

## UI / React

| ID | Tipo | Item |
|----|------|------|
| P25-14 | bug | Ao **mudar navegação do menu**, o bloco de **estado atual do player** re-renderiza de forma indesejada — revisar **memo/ref** e padrões reativos. |
| P25-15 | polish | **Favicons** em tema **não escuro** — revisar web e player (ou apps afetados). |

---

## Produto e busca

| ID | Tipo | Item |
|----|------|------|
| P25-16 | produto | **Experiência de busca** — revisar storyboard (comentário com screenshot no PR). |
| P25-17 | produto | **Subtela de artista**: álbuns, top tracks (telas filhas). |

---

## Observabilidade e evidências

| ID | Tipo | Item |
|----|------|------|
| P25-18 | ops | Manter **ingest de logs** do ambiente staging (~1 h), analisar comportamento e estados do player (nota do PR; follow-up “ingested log” indica que material foi coletado). |
| P25-19 | bug | **“Issue detected”** — comentário só com screenshot no PR; ao reproduzir, descrever em texto e atualizar esta linha (ou novo ID `P25-xx`). |
| P25-20 | — | **“Stable Player staging”** / **“Working fine”** — evidências positivas no PR; podem virar critérios de aceite ou regressão visual. |

---

## Status após implementação core (maio/2026)

| ID | Status | Notas |
|----|--------|-------|
| P25-02 | parcial | Skip/control com refresh API; seek na UI ainda não exposto |
| P25-03 | em validação | `positionUpdatedAt` + `sourceUpdatedAt` na sessão; barra web com interpolação ao vivo |
| P25-04 / P25-05 | em validação pós-worker-hook | Mirror + dequeue no Trigger (`afterSample` no worker); validar em staging |
| P25-06 | em validação pós-worker-hook | Tick server-side + lifecycle/dequeue/mirror no worker para `api_device`/Echo |
| P25-07 | ok no código | Web sem fluxo de device; validar em staging |
| P25-09 | em validação | Participante: gate só em voto/busca sem sessão |

Checklist de QA: [2026-05-staging-checklist-core.md](./2026-05-staging-checklist-core.md)

## Próximos passos sugeridos

1. Trabalhar na ordem **P0 → P1** do [§5 do ciclo](../CICLO-ENTREGA-E-FOCO.md#5-foco-até-30052026--funcionalidade-core); **P3** (polish, busca, artista) depois do marco.
2. Itens **ops/humano** (P25-10) ficam fora do repo até checklist de deploy.
3. Itens **arquitetura** (P25-11–P25-13, P25-08) podem virar ADR ou atualização de spec se a decisão mudar.
4. **Linear** (`MUZ-n`): opcional nesta fase — retomar com 2+ contribuidores ou piloto real ([CICLO §6](../CICLO-ENTREGA-E-FOCO.md#6-quando-voltar-ao-processo-cheio)).
