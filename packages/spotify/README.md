# @muziks/spotify

Facade sobre a [Spotify Web API](https://developer.spotify.com/documentation/web-api) usando o SDK oficial [`@spotify/web-api-ts-sdk`](https://github.com/spotify/spotify-web-api-ts-sdk).

## Responsabilidades

| Módulo | Conteúdo |
|--------|----------|
| `client.ts` | `createSpotifyApi` / `sdkForAccessToken` (modo `withAccessToken`) |
| `oauth.ts`, `pkce.ts` | OAuth PKCE Muziks (login Next.js, cookies, vault) — **não** usa o fluxo de redirect do SDK |
| `playback/*`, `search.ts`, `profile.ts` | Funções de domínio com assinaturas estáveis para apps |
| `playback/normalize.ts` | Estado → `NormalizedSpotifyPlayerState` (`@muziks/types`) |

## Quem importa o quê

- **`apps/player`**, **`apps/web`**, **`packages/db`**: importam apenas `@muziks/spotify`, nunca `@spotify/web-api-ts-sdk` diretamente.
- **Web Playback SDK** (script `sdk.scdn.co/spotify-player.js`): permanece no browser do player; é outro produto Spotify, fora deste pacote.

## Tokens

O servidor obtém `accessToken` via cookies ou vault (`spotify_connections`) e passa para as funções exportadas. Refresh continua em `refreshAccessToken` + repositório DB — o SDK não renova tokens em produção (placeholder `clientId` no facade).

## Retry 429

`createSpotifyFetchWithRetry` é injetado na config do SDK (`Retry-After` + backoff exponencial).
