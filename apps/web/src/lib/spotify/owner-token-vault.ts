import { getDb, players, spotifyConnections } from "@muziks/db";
import {
  isSpotifyRefreshTokenRevoked,
  refreshAccessToken,
} from "@muziks/spotify";
import { eq } from "drizzle-orm";

import {
  getSpotifyClientId,
  getSpotifyClientSecret,
} from "@/src/config/env";
import { decryptToken, encryptToken } from "@/src/lib/crypto/token-encryption";

const EXPIRY_SKEW_MS = 60_000;

export async function getAccessTokenForUser(
  userId: string,
): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(spotifyConnections)
    .where(eq(spotifyConnections.userId, userId))
    .limit(1);

  const connection = rows[0];
  if (!connection?.refreshTokenEnc) {
    return null;
  }

  if (
    connection.accessTokenEnc &&
    connection.expiresAt &&
    connection.expiresAt.getTime() > Date.now() + EXPIRY_SKEW_MS
  ) {
    return decryptToken(connection.accessTokenEnc);
  }

  const refreshToken = decryptToken(connection.refreshTokenEnc);

  try {
    const tokens = await refreshAccessToken({
      clientId: getSpotifyClientId(),
      clientSecret: getSpotifyClientSecret(),
      refreshToken,
    });

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    await db
      .update(spotifyConnections)
      .set({
        accessTokenEnc: encryptToken(tokens.access_token),
        expiresAt,
        updatedAt: new Date(),
        ...(tokens.refresh_token
          ? { refreshTokenEnc: encryptToken(tokens.refresh_token) }
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

export async function getAccessTokenForPlayer(
  playerId: string,
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

  return getAccessTokenForUser(ownerId);
}
