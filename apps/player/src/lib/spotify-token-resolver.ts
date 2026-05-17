import { getDb, spotifyConnections } from "@muziks/db";
import { refreshAccessToken } from "@muziks/spotify";
import { eq } from "drizzle-orm";

import {
  getSpotifyClientId,
  getSpotifyClientSecret,
} from "@/src/config/spotify-env";
import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";
import { decryptToken, encryptToken } from "@/src/lib/crypto/token-encryption";
import { getValidAccessToken } from "@/src/lib/spotify-session";

/**
 * Resolves Spotify access token for the authenticated owner:
 * cookies first, then encrypted refresh in spotify_connections.
 */
export async function getOwnerSpotifyAccessToken(): Promise<string | null> {
  const fromCookies = await getValidAccessToken();
  if (fromCookies) {
    return fromCookies;
  }

  const muziks = await getMuziksSession();
  if (muziks.status === "anonymous") {
    return null;
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(spotifyConnections)
    .where(eq(spotifyConnections.userId, muziks.userId))
    .limit(1);

  const connection = rows[0];
  if (!connection?.refreshTokenEnc) {
    return null;
  }

  const refreshToken = decryptToken(connection.refreshTokenEnc);
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
    .where(eq(spotifyConnections.userId, muziks.userId));

  return tokens.access_token;
}
