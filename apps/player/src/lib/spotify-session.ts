import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  isSpotifyRefreshTokenRevoked,
  refreshAccessToken,
  type SpotifyTokenResponse,
} from "@muziks/spotify";
import {
  getSpotifyClientId,
  getSpotifyClientSecret,
} from "@/src/config/spotify-env";

const ACCESS_COOKIE = "muziks_spotify_access";
const REFRESH_COOKIE = "muziks_spotify_refresh";
const EXPIRES_COOKIE = "muziks_spotify_expires_at";
const PKCE_VERIFIER_COOKIE = "muziks_spotify_pkce_verifier";
const OAUTH_STATE_COOKIE = "muziks_spotify_oauth_state";
const RETURN_SLUG_COOKIE = "muziks_spotify_return_slug";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const transientCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600,
};

const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: COOKIE_MAX_AGE,
};

export const spotifySessionCookies = {
  pkceVerifier: PKCE_VERIFIER_COOKIE,
  oauthState: OAUTH_STATE_COOKIE,
  returnSlug: RETURN_SLUG_COOKIE,
} as const;

/** Attach OAuth PKCE/state cookies to a redirect response (required for Next.js). */
export function applyOAuthTransientCookies(
  response: NextResponse,
  input: { codeVerifier: string; state: string; returnSlug: string },
): void {
  response.cookies.set(
    PKCE_VERIFIER_COOKIE,
    input.codeVerifier,
    transientCookieOptions,
  );
  response.cookies.set(OAUTH_STATE_COOKIE, input.state, transientCookieOptions);
  response.cookies.set(
    RETURN_SLUG_COOKIE,
    input.returnSlug,
    transientCookieOptions,
  );
}

export function clearOAuthTransientCookiesOnResponse(
  response: NextResponse,
): void {
  response.cookies.delete(PKCE_VERIFIER_COOKIE);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(RETURN_SLUG_COOKIE);
}

export async function readOAuthTransientCookies(): Promise<{
  codeVerifier: string | undefined;
  state: string | undefined;
  returnSlug: string | undefined;
}> {
  const jar = await cookies();
  return {
    codeVerifier: jar.get(PKCE_VERIFIER_COOKIE)?.value,
    state: jar.get(OAUTH_STATE_COOKIE)?.value,
    returnSlug: jar.get(RETURN_SLUG_COOKIE)?.value,
  };
}

export function applyPersistTokenResponse(
  response: NextResponse,
  tokens: SpotifyTokenResponse,
): void {
  const expiresAt = Date.now() + tokens.expires_in * 1000;

  response.cookies.set(ACCESS_COOKIE, tokens.access_token, sessionCookieOptions);
  response.cookies.set(
    EXPIRES_COOKIE,
    String(expiresAt),
    sessionCookieOptions,
  );

  if (tokens.refresh_token) {
    response.cookies.set(
      REFRESH_COOKIE,
      tokens.refresh_token,
      sessionCookieOptions,
    );
  }
}

export async function persistTokenResponse(
  tokens: SpotifyTokenResponse,
): Promise<void> {
  const jar = await cookies();
  const expiresAt = Date.now() + tokens.expires_in * 1000;

  jar.set(ACCESS_COOKIE, tokens.access_token, sessionCookieOptions);
  jar.set(EXPIRES_COOKIE, String(expiresAt), sessionCookieOptions);

  if (tokens.refresh_token) {
    jar.set(REFRESH_COOKIE, tokens.refresh_token, sessionCookieOptions);
  }
}

/** Use in Route Handlers / Server Actions only (Next.js cookie mutation rules). */
export function clearSpotifySessionOnResponse(response: NextResponse): void {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  response.cookies.delete(EXPIRES_COOKIE);
}

export async function clearSpotifySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
  jar.delete(EXPIRES_COOKIE);
}

/**
 * Read-only session check for Server Components (no cookie writes).
 * Probes refresh when access expired; does not persist new tokens.
 */
export async function checkSpotifySessionConnected(): Promise<boolean> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  const expiresRaw = jar.get(EXPIRES_COOKIE)?.value;
  const expiresAt = expiresRaw ? Number(expiresRaw) : 0;

  if (access && expiresAt > Date.now() + 60_000) {
    return true;
  }

  if (!refresh) {
    return false;
  }

  try {
    await refreshAccessToken({
      clientId: getSpotifyClientId(),
      refreshToken: refresh,
      clientSecret: getSpotifyClientSecret(),
    });
    return true;
  } catch (error) {
    if (isSpotifyRefreshTokenRevoked(error)) {
      return false;
    }
    throw error;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get(ACCESS_COOKIE)?.value;
  const refresh = jar.get(REFRESH_COOKIE)?.value;
  const expiresRaw = jar.get(EXPIRES_COOKIE)?.value;
  const expiresAt = expiresRaw ? Number(expiresRaw) : 0;

  if (access && expiresAt > Date.now() + 60_000) {
    return access;
  }

  if (!refresh) {
    return null;
  }

  try {
    const tokens = await refreshAccessToken({
      clientId: getSpotifyClientId(),
      refreshToken: refresh,
      clientSecret: getSpotifyClientSecret(),
    });

    await persistTokenResponse({
      ...tokens,
      refresh_token: tokens.refresh_token ?? refresh,
    });

    return tokens.access_token;
  } catch (error) {
    if (isSpotifyRefreshTokenRevoked(error)) {
      await clearSpotifySession();
      return null;
    }
    throw error;
  }
}

export async function hasSpotifySession(): Promise<boolean> {
  return checkSpotifySessionConnected();
}
