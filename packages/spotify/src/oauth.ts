import {
  SPOTIFY_ACCOUNTS_BASE,
  SPOTIFY_PLAYBACK_SCOPES,
} from "./constants";

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

export type BuildAuthorizeUrlParams = {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
};

export function buildAuthorizeUrl({
  clientId,
  redirectUri,
  state,
  codeChallenge,
}: BuildAuthorizeUrlParams): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    scope: SPOTIFY_PLAYBACK_SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });
  return `${SPOTIFY_ACCOUNTS_BASE}/authorize?${params.toString()}`;
}

export type ExchangeCodeParams = {
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientSecret?: string;
};

export async function exchangeAuthorizationCode(
  params: ExchangeCodeParams,
): Promise<SpotifyTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    code_verifier: params.codeVerifier,
  });

  if (params.clientSecret) {
    body.set("client_secret", params.clientSecret);
  }

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token exchange failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}

export type RefreshTokenParams = {
  clientId: string;
  refreshToken: string;
  clientSecret?: string;
};

export async function refreshAccessToken(
  params: RefreshTokenParams,
): Promise<SpotifyTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    client_id: params.clientId,
  });

  if (params.clientSecret) {
    body.set("client_secret", params.clientSecret);
  }

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Spotify token refresh failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}
