# Viabilidade — integração primária com Spotify (catálogo + execução remota)

**Propósito:** avaliar a premissa de que o **Spotify já oferece** um player com **estado multi-dispositivo** (Spotify Connect), controlável pelo **app oficial**, **Web Player** ou experiências derivadas, permitindo **ações remotas** (ex.: tocar, pular, fila) e **leitura de estado** — e como isso se encaixa num backend **orientado a eventos** do Muziks.

**Leitura obrigatória em paralelo:** [14-fronteiras-legais-direitos-autorais.md](../specs/14-fronteiras-legais-direitos-autorais.md) (papel do Muziks, conta e termos do provedor), [03-domain-model.md](../specs/03-domain-model.md) (ISRC), [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md) (reprodução e catálogo).

> **Nota sobre “EDD”:** no texto abaixo assume-se **EDA** (*event-driven architecture* — backend e API publicam/consumem **eventos** de domínio e de integração). Se por **EDD** você quis dizer **desenho guiado por eventos de domínio** (event-first no modelo mental), o encaixe é o mesmo: o Spotify entra como **adaptador de saída** (comandos) e **adaptador de leitura** (estado), não como dono da fila nem da política.

---

## 1. A premissa (o que é verdade — com matizes)

| Afirmação | Matiz técnico |
|-----------|----------------|
| Existe **estado de reprodução** compartilhado entre dispositivos ligados à mesma conta / sessão Connect | **Sim**, no ecossistema Spotify (**Spotify Connect**): há “dispositivo ativo”, fila gerida pelo cliente de reprodução, etc. |
| Dá para **controlar remotamente** (outro dispositivo toca) | **Sim**, via **Spotify Web API** autenticada como **o usuário que detém a sessão** (em geral o **dono do player** no Muziks): transferência de reprodução, play/pause, pular, volume (onde suportado), adicionar à fila do Spotify, etc. |
| Dá para **“recepcionar”** mudanças (evento de faixa mudou, pausou) | **Parcialmente:** não há, na data deste doc, um **webhook oficial** do Spotify para o *seu* servidor reagir a cada mudança em tempo real. O padrão viável é **polling** da API de *player state* com o token do dono, **ou** eventos **locais** no cliente (ex.: **Web Playback SDK** no navegador — outro modelo, ver §4). |
| *Widget web / plugin* genérico substitui OAuth + Web API | **Não** como arquitetura completa: **embeds** do Spotify são úteis para **visualização** ou experiência fechada; **orquestração** da fila do **espaço** (política, votos, Muziks como fonte de verdade) continua exigindo **sua** API + identidade + domínio. |

Conclusão da premissa: **a tese “Spotify já resolve multi-device + controle remoto” é sólida para execução**; **a tese “eventos chegam sozinhos no servidor” exige desenho explícito** (polling, fila de comandos, ou SDK no cliente).

---

## 2. Dois caminhos de integração (ambos viáveis; MVP escolhe um)

Alinhado ao [congelamento do MVP](congelamento-mvp-e-arquitetura.md): **reprodução profunda** fica **fora do primeiro corte**; a integração **primária** com Spotify ainda assim pode ser pensada em **duas camadas** para não refazer modelo depois.

### 2.1 Caminho A — **Catálogo e identidade** (MVP-friendly)

- **Web API:** busca, metadados de faixa/album/artista, **URI** e, quando disponível, **ISRC** (via endpoint de *track* / extensões documentadas).
- **Papel do Muziks:** política, fila e votos no **seu** Postgres; Spotify como **fonte de verdade do catálogo** e de endereçamento (`spotify:track:…` → mapeamento interno `isrc`).
- **Execução:** manual ou fora do app no MVP (operador usa o app Spotify); o Muziks valida **o que é elegível**, não empurra áudio ainda.

**Viabilidade:** **alta**; limitações são principalmente **rate limits**, **termos de uso** e **qualidade de metadados** (nem toda faixa expõe ISRC da forma desejada).

### 2.2 Caminho B — **Orquestração Connect** (pós-MVP ou demo controlada)

- **OAuth** do **dono** (refresh token no servidor com cofre de segredos).
- **Comandos** para o dispositivo alvo: `transfer`, `add to queue`, `skip`, etc.
- **Sincronização de estado:** worker ou rota agendada que faz **GET** do estado do *player* e compara com a **cabeça da fila Muziks**; divergência gera eventos internos (`PlaybackOutOfSync`, `TrackActuallyStarted`).
- **Papel do Muziks:** continua dono da **política** e da **fila semântica**; Spotify é **motor de execução** licenciado pelo usuário.

**Viabilidade:** **média–alta** tecnicamente; **média** em produto (Premium, dispositivo ativo, edge cases de fila dupla: fila Spotify vs fila Muziks).

---

## 3. Encaixe natural com arquitetura orientada a eventos (EDA)

Fluxo mental recomendado:

1. **Domínio Muziks** emite eventos imutáveis, por exemplo: `VoteRecorded`, `QueueHeadChanged`, `PolicyDeniedTrack`, `OwnerLockedDevice`.
2. **Projetor / adaptador Spotify** subscreve (internamente: fila de mensagens, *outbox*, ou handler síncrono na mesma transação para MVP pequeno) e traduz para **chamadas idempotentes** à Web API (ex.: “garantir que `spotify:track:…` seja o próximo a tocar” pode ser decomposto em políticas concretas conforme limitação da API de *queue*).
3. **Poller** (ou job) emite eventos de leitura: `SpotifyStateSampled` com *payload* normalizado (track URI, progress_ms, device id).
4. **API pública** e **Realtime** (Supabase, etc.) notificam clientes com **eventos de UI**, não com o *raw* do Spotify — mantém o contrato do Muziks estável se amanhã o adaptador for Apple Music.

Isso atende à ideia de **“estabelecer eventos no server e na API de forma natural”**: a API REST pode continuar **comandos síncronos** (`POST /queue/vote`), enquanto o **bus** interno** (ou tabela de eventos) carrega a verdade temporal e integrações.

---

## 4. Web Playback SDK × Connect × “plugin”

| Mecanismo | Onde roda o áudio | Controle remoto de **outro** aparelho no bar |
|-----------|-------------------|-----------------------------------------------|
| **Spotify Connect + Web API** | No dispositivo Spotify (som, caixa, app desktop) | **Sim** (com token e dispositivo ativo) |
| **Web Playback SDK** | **No browser** (Premium) | **Não** é o mesmo que mandar na caixa; é player *local* na web |
| **Embed / iframe** | Definido pelo Spotify | **Não** substitui orquestração completa da fila do espaço |

Para a **tese do estabelecimento**, o caminho B quase sempre é **Connect + API**, não só embed.

---

## 5. Riscos e limitações (checklist de produto)

- **Conta e plano:** várias operações exigem **Premium**; termos mudam — documentar “requer plano compatível” na UX do dono.
- **Dispositivo ativo:** sem dispositivo Connect disponível/“acordado”, comandos falham — UX de *pairing* e de **fallback** (só catálogo / só votação).
- **Rate limits e consistência:** agregue votos e **debounce** de comandos para não martelar a API.
- **Fila dupla:** fila lógica Muziks vs fila nativa Spotify — decidir se o Muziks **só sugere** ou se **força** sincronização contínua (custo de engenharia e de confusão do operador).
- **Compliance:** automação comercial e uso em espaço público — [14](../specs/14-fronteiras-legais-direitos-autorais.md).

---

## 6. Recomendação para o Muziks

1. **Tratar Spotify como integração primária de catálogo** no roadmap imediato (Caminho A), com **ISRC** como chave interna quando existir.
2. **Desenhar o domínio já com eventos** (`Queue*`, `Policy*`, `SpotifyCommand*`, `SpotifyState*`) para que o Caminho B seja **só um novo consumidor**, não um refator grande.
3. **Caminho B (execução)** — **fechado para MVP-B** como variante **Web Playback SDK no Player Master** + Web API + Supabase (não só Connect externo). Ver [06-arquitetura-playback-spotify.md](06-arquitetura-playback-spotify.md).
4. **Catálogo complementar (Deezer):** busca estruturada, metadados e experimentação (Python, ML, *vector DB*) como **integração secundária** — ver [04-viabilidade-integracao-secundaria-deezer.md](04-viabilidade-integracao-secundaria-deezer.md).

Reprodução normativa: [11-backend-and-integrations-open.md](../specs/11-backend-and-integrations-open.md) §4.
