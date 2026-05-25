import {
  isSpotifyRefreshTokenRevoked,
  refreshAccessToken,
  type SpotifyTokenResponse,
} from "@muziks/spotify";
import { isValidPlayerSlug, normalizePlayerSlug } from "@muziks/types";
import { eq } from "drizzle-orm";

import { getDb } from "../client";
import { players, spotifyConnections } from "../schema";

const EXPIRY_SKEW_MS = 60_000;

const inflight = new Map<string, Promise<string | null>>();

export type SpotifyTokenVaultDeps = {
  clientId: string;
  clientSecret?: string;
  encrypt: (plain: string) => string;
  decrypt: (enc: string) => string;
};

export type PlayerSpotifyAccessTokenError =
  | "invalid_slug"
  | "player_not_found"
  | "spotify_not_connected"
  | "token_unreadable";

export type PlayerSpotifyAccessTokenResult =
  | { ok: true; accessToken: string; playerId: string }
  | { ok: false; code: PlayerSpotifyAccessTokenError };

function isTokenVaultReadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /Unsupported state|authenticate data|bad decrypt|invalid/i.test(
    error.message,
  );
}

async function loadConnection(userId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(spotifyConnections)
    .where(eq(spotifyConnections.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function persistSpotifyTokens(
  userId: string,
  tokens: SpotifyTokenResponse,
  deps: SpotifyTokenVaultDeps,
): Promise<void> {
  const refreshToken = tokens.refresh_token;
  const db = getDb();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  if (!refreshToken) {
    await persistSpotifyAccessToken(userId, tokens.access_token, expiresAt, deps);
    return;
  }

  await db
    .insert(spotifyConnections)
    .values({
      userId,
      refreshTokenEnc: deps.encrypt(refreshToken),
      accessTokenEnc: deps.encrypt(tokens.access_token),
      expiresAt,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: spotifyConnections.userId,
      set: {
        refreshTokenEnc: deps.encrypt(refreshToken),
        accessTokenEnc: deps.encrypt(tokens.access_token),
        expiresAt,
        updatedAt: new Date(),
      },
    });
}

export async function persistSpotifyAccessToken(
  userId: string,
  accessToken: string,
  expiresAt: Date,
  deps: SpotifyTokenVaultDeps,
): Promise<void> {
  const db = getDb();

  await db
    .update(spotifyConnections)
    .set({
      accessTokenEnc: deps.encrypt(accessToken),
      expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(spotifyConnections.userId, userId));
}

async function resolveAccessTokenForUserInner(
  userId: string,
  deps: SpotifyTokenVaultDeps,
): Promise<string | null> {
  const connection = await loadConnection(userId);
  if (
    connection?.accessTokenEnc &&
    connection.expiresAt &&
    connection.expiresAt.getTime() > Date.now() + EXPIRY_SKEW_MS
  ) {
    return deps.decrypt(connection.accessTokenEnc);
  }

  if (!connection?.refreshTokenEnc) {
    return null;
  }

  const refreshToken = deps.decrypt(connection.refreshTokenEnc);
  const db = getDb();

  try {
    const tokens = await refreshAccessToken({
      clientId: deps.clientId,
      clientSecret: deps.clientSecret,
      refreshToken,
    });

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await db
      .update(spotifyConnections)
      .set({
        accessTokenEnc: deps.encrypt(tokens.access_token),
        expiresAt,
        updatedAt: new Date(),
        ...(tokens.refresh_token
          ? { refreshTokenEnc: deps.encrypt(tokens.refresh_token) }
          : {}),
      })
      .where(eq(spotifyConnections.userId, userId));

    return tokens.access_token;
  } catch (error) {
    if (isSpotifyRefreshTokenRevoked(error)) {
      await db
        .delete(spotifyConnections)
        .where(eq(spotifyConnections.userId, userId));
      return null;
    }
    throw error;
  }
}

/** Server-side token vault: refresh automático persistido em `spotify_connections`. */
export async function getAccessTokenForUser(
  userId: string,
  deps: SpotifyTokenVaultDeps,
): Promise<string | null> {
  const existing = inflight.get(userId);
  if (existing) {
    return existing;
  }

  const promise = resolveAccessTokenForUserInner(userId, deps).finally(() => {
    inflight.delete(userId);
  });
  inflight.set(userId, promise);
  return promise;
}

export async function hasValidConnectionForUser(
  userId: string,
  deps: SpotifyTokenVaultDeps,
): Promise<boolean> {
  const token = await getAccessTokenForUser(userId, deps);
  return token !== null;
}

export async function getAccessTokenForPlayer(
  playerId: string,
  deps: SpotifyTokenVaultDeps,
): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ ownerId: players.ownerId })
    .from(players)
    .where(eq(players.id, playerId))
    .limit(1);

  const ownerId = rows[0]?.ownerId;
  if (!ownerId) {
    return null;
  }

  return getAccessTokenForUser(ownerId, deps);
}

export async function getAccessTokenForPlayerSlug(
  slug: string,
  deps: SpotifyTokenVaultDeps,
): Promise<PlayerSpotifyAccessTokenResult> {
  const normalized = normalizePlayerSlug(slug);
  if (!isValidPlayerSlug(normalized)) {
    return { ok: false, code: "invalid_slug" };
  }

  const db = getDb();
  const rows = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.slug, normalized))
    .limit(1);

  const playerId = rows[0]?.id;
  if (!playerId) {
    return { ok: false, code: "player_not_found" };
  }

  try {
    const accessToken = await getAccessTokenForPlayer(playerId, deps);
    if (!accessToken) {
      return { ok: false, code: "spotify_not_connected" };
    }

    return { ok: true, accessToken, playerId };
  } catch (error) {
    if (isTokenVaultReadError(error) || isSpotifyRefreshTokenRevoked(error)) {
      return { ok: false, code: "token_unreadable" };
    }

    throw error;
  }
}
