# ADR: Spotify Web API via `@spotify/web-api-ts-sdk`

**Status:** aceito  
**Data:** 2026-05-18

## Contexto

O Muziks integrava a Web API com `fetch` manual em `@muziks/spotify` (`spotifyFetch`), tipos duplicados e sem cobertura automática de novos endpoints.

## Decisão

1. **`@spotify/web-api-ts-sdk`** é a implementação única de chamadas HTTP à Web API, encapsulada em `@muziks/spotify`.
2. **OAuth/PKCE** permanece no Muziks (`oauth.ts`, rotas Next.js, cookies httpOnly, vault criptografado) — modo misto: servidor usa `SpotifyApi.withAccessToken` após o login, conforme [documentação oficial](https://github.com/spotify/spotify-web-api-ts-sdk).
3. **Apps e `packages/db`** importam somente `@muziks/spotify`, nunca o pacote `@spotify` diretamente.
4. **Web Playback SDK** (browser) não migra para este SDK; continua script global + `/api/spotify/token`.

## Consequências

- Tipos de player reexportados do SDK (`PlaybackState`, `Device`, `Track`, `Queue`).
- Retry 429 centralizado em `fetch-with-retry.ts` injetado no SDK.
- Facade permite trocar implementação sem alterar handlers em `apps/player` / `apps/web`.
- SDK oficial com release estável (jan/2024); risco mitigado pela camada `@muziks/spotify`.

## Fora de escopo

- Substituir Web Playback SDK.
- OAuth via `SpotifyApi.withUserAuthorization` no browser.
- librespot / Connect (ver [ADR-librespot-playback-sidecar.md](./ADR-librespot-playback-sidecar.md)).

## Referências

- [spotify-web-api-ts-sdk](https://github.com/spotify/spotify-web-api-ts-sdk)
- [packages/spotify/README.md](../../packages/spotify/README.md)
