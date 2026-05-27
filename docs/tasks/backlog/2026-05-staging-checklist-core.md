# Checklist manual — core playback (staging, marco 30/05/2026)

Referência: [CICLO-ENTREGA-E-FOCO.md §5](../CICLO-ENTREGA-E-FOCO.md#5-foco-até-30052026--funcionalidade-core)

## Pré-requisitos

- [ ] `PLAYBACK_WORKER_SECRET` no player (staging) — bridge/rotas internas
- [ ] Credenciais Supabase/Spotify no **Trigger.dev → ambiente Production** (não usar Staging do Trigger — pago); vars apontando para o **Supabase de staging** enquanto testar Muziks staging
- [ ] `MUZIKS_PLAYER_API_URL` no worker apontando para o deploy staging do player
- [ ] Dono com Spotify conectado e dispositivo escolhido **no player**

## Player (master)

- [ ] Play / pause refletem na UI e no Postgres (now-playing)
- [ ] Barra de progresso avança enquanto toca; pausa congela
- [ ] Skip: UI, Spotify e fila nativa convergem em até ~15 s (tick + poll)
- [ ] Com itens na fila Muziks: ~10 s antes do fim, próxima URI aparece em «Próximas no Spotify» (mirror)
- [ ] Ao trocar faixa: dequeue da fila Muziks (cabeça vira `played`)
- [ ] Dispositivo externo (Echo): play pelo player atualiza UI após tick/poll (modo `api_device`)

## Web (participante)

- [ ] Hero / progresso atualizam via realtime (ou poll 30 s se realtime off)
- [ ] Voto exige login Spotify **só** `user-read-email` — sem tela de dispositivo
- [ ] Fila Muziks e «Próximas no Spotify» coerentes após troca de faixa no player

## Regressões a evitar

- [ ] OAuth não entra em loop ao voltar de `?identified=1`
- [ ] Timer não fica em 0:00 com faixa tocando
- [ ] Fila Spotify não duplica a mesma URI após mirror

## Pós-marco (não bloqueia 30/05)

- P25-15 polish, P25-16 busca, P25-17 artista — ver [2026-05-staging-pr25-perceptions.md](./2026-05-staging-pr25-perceptions.md)
