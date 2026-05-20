import "server-only";

import {
  SpotifyApi,
  type AccessToken,
  type SdkOptions,
} from "@spotify/web-api-ts-sdk";

import { createSpotifyFetchWithRetry } from "./fetch-with-retry";

/**
 * SDK uses clientId only for built-in token refresh. Muziks refreshes via oauth.ts + vault.
 */
const FACADE_CLIENT_ID = "muziks";

export type CreateSpotifyApiOptions = {
  expiresAtMs?: number;
  refreshToken?: string;
  retries?: number;
};

function toAccessToken(
  accessToken: string,
  options?: CreateSpotifyApiOptions,
): AccessToken {
  const expires =
    options?.expiresAtMs ?? Date.now() + 55 * 60 * 1000;

  return {
    access_token: accessToken,
    token_type: "Bearer",
    expires_in: Math.max(60, Math.floor((expires - Date.now()) / 1000)),
    refresh_token: options?.refreshToken ?? "",
    expires,
  };
}

export function createSpotifyApi(
  clientId: string,
  accessToken: string,
  options?: CreateSpotifyApiOptions,
): SpotifyApi {
  const sdkOptions: SdkOptions = {
    fetch: createSpotifyFetchWithRetry(options?.retries),
  };

  return SpotifyApi.withAccessToken(
    clientId,
    toAccessToken(accessToken, options),
    sdkOptions,
  );
}

/** Server facade: one SDK instance per access token (no SDK-side refresh). */
export function sdkForAccessToken(
  accessToken: string,
  options?: CreateSpotifyApiOptions,
): SpotifyApi {
  return createSpotifyApi(FACADE_CLIENT_ID, accessToken, options);
}

export type { SpotifyApi };
