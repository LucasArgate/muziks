**Perfeito, entendi o problema real.**  

O Web Playback SDK é frágil (aba fechada, background throttling, OS matando o processo). Queremos **controlar o Spotify de forma mais robusta**, usando os **dispositivos reais do usuário** (Spotify Connect: celular, desktop, speaker, TV, Sonos, etc.) via **Web API**, mantendo o Web SDK como opção secundária.

### Arquitetura Recomendada (híbrida e resiliente)

#### 1. **Player Master** (`player.muziks.com`)
- **Principal fonte de verdade de controle** → roda no navegador ou Electron do dono.
- **Não depende exclusivamente do SDK** para observar o estado.
- Usa **Spotify Web API** para polling + comandos.

**Endpoints chave (scopes necessários):**

| Endpoint | Escopo | Uso |
|---------|--------|-----|
| `GET /me/player` | `user-read-playback-state` | Estado atual (faixa, progresso, device ativo, is_playing) |
| `GET /me/player/devices` | `user-read-playback-state` | Lista de dispositivos disponíveis |
| `PUT /me/player` | `user-modify-playback-state` | Transferir playback para um device |
| `PUT /me/player/play` | `user-modify-playback-state` | Iniciar / continuar |
| `PUT /me/player/pause` | `user-modify-playback-state` | Pausar |
| `PUT /me/player/next` | `user-modify-playback-state` | Próxima faixa |
| `PUT /me/player/queue` | `user-modify-playback-state` | Adicionar à fila nativa do Spotify |

#### 2. Estratégia de sincronização (sem webhook)

Como **não existe webhook oficial**, usamos um **Polling inteligente** no Master:

```ts
// No PlaybackManager (backend ou client-side no Master)
async function syncPlaybackState() {
  try {
    const state = await spotifyApi.getMyCurrentPlaybackState();
    
    if (state) {
      await updateMuziksSession({  // Supabase ou seu DB
        currentTrack: state.item,
        progress_ms: state.progress_ms,
        is_playing: state.is_playing,
        activeDevice: state.device,
        timestamp: Date.now()
      });

      // Detectar mudança de faixa → avançar fila lógica do Muziks
      if (isNewTrack(state.item?.id)) {
        await advanceMuziksQueue();
      }
    }
  } catch (e) { /* handle 204 (nothing playing) */ }
}
```

**Frequência inteligente:**
- Quando **tocando**: polling a cada **3–8 segundos**
- Quando **pausado**: a cada **15–30 segundos**
- Usar `timestamp` do response para evitar atualizações desnecessárias

#### 3. Fluxo ideal de operação

1. Dono abre `player.muziks.com/{slug}` e faz login Spotify (Premium).
2. O Master **lista dispositivos** (`/me/player/devices`).
3. Dono seleciona o dispositivo principal (ex: "Soundbar da Sala" ou "Celular do DJ").
4. **Transfer Playback** para esse device quando necessário.
5. Master começa a **polling leve** + escuta Web SDK (opcional, como backup).
6. Quando a fila do Muziks decide a próxima faixa → `PUT /me/player/play` ou adiciona na queue.

#### 4. Vantagens dessa abordagem

- Muito mais estável que SDK puro (Spotify gerencia o player real).
- Funciona mesmo se aba fechar (desde que o device alvo esteja tocando).
- Permite controlar Sonos, receivers, TVs, etc.
- Mantém compatibilidade com Web SDK (pode transferir para ele quando quiser).

#### 5. Desafios & Mitigações

| Problema | Solução |
|---------|--------|
| Rate limits | Polling inteligente + cache curto no Master |
| Device ID muda | Sempre refrescar lista de devices periodicamente |
| Múltiplos devices | Mostrar selector claro no Master |
| Latência de sync | Supabase Realtime propaga estado para telão + participantes |
| Dono não tem Premium | Degradação: só fila visual (MVP-A) |

### Próximos passos concretos

1. Criar slice `playback-control` com os endpoints acima.
2. Modelar tabela `player_sessions` com campos: `active_device_id`, `spotify_context_uri`, `current_track_isrc`, etc.
3. Implementar `PlaybackManager` que decide: "usar Web SDK ou controlar via API no device X?"
4. UI no Master: selector de dispositivos + botão "Transferir playback aqui".

Quer que eu rascunhe agora:
- O schema da tabela `player_sessions`?
- O código do service/slice de polling + comandos?
- Ou o fluxo completo de "próxima faixa" (Muziks → Spotify)?
