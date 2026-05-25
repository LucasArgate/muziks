import { SPOTIFY_ACCOUNTS_BASE, SPOTIFY_PLAYBACK_SCOPES } from "./constants";

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

type SpotifyOAuthErrorBody = {
  error?: string;
  error_description?: string;
};

export class SpotifyOAuthError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "SpotifyOAuthError";
    this.status = status;
    this.code = code;
  }

  get isRefreshTokenRevoked(): boolean {
    return this.status === 400 && this.code === "invalid_grant";
  }
}

export function isSpotifyRefreshTokenRevoked(error: unknown): boolean {
  return error instanceof SpotifyOAuthError && error.isRefreshTokenRevoked;
}

function parseOAuthErrorBody(text: string): SpotifyOAuthErrorBody | null {
  try {
    return JSON.parse(text) as SpotifyOAuthErrorBody;
  } catch {
    return null;
  }
}

function oauthError(
  action: string,
  status: number,
  text: string,
): SpotifyOAuthError {
  const body = parseOAuthErrorBody(text);
  const code = body?.error;
  const description = body?.error_description;
  const detail = description ? `${code}: ${description}` : text;
  return new SpotifyOAuthError(
    `Spotify ${action} failed (${status}): ${detail}`,
    status,
    code,
  );
}

export type BuildAuthorizeUrlParams = {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  scopes?: readonly string[];
};

export function buildAuthorizeUrl({
  clientId,
  redirectUri,
  state,
  codeChallenge,
  scopes = SPOTIFY_PLAYBACK_SCOPES,
}: BuildAuthorizeUrlParams): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    scope: scopes.join(" "),
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
    throw oauthError("token exchange", response.status, text);
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}

export type RefreshTokenParams = {
  clientId: string;
  refreshToken: string;
  clientSecret?: string;
};

export type ClientCredentialsParams = {
  clientId: string;
  clientSecret: string;
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
    throw oauthError("token refresh", response.status, text);
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}

export async function getClientCredentialsAccessToken(
  params: ClientCredentialsParams,
): Promise<SpotifyTokenResponse> {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${params.clientId}:${params.clientSecret}`,
      ).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw oauthError("client credentials token", response.status, text);
  }

  return response.json() as Promise<SpotifyTokenResponse>;
}
