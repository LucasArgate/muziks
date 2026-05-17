import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";
import { getAccessTokenForUser } from "@/src/lib/spotify/spotify-token-vault";
import { getValidAccessToken } from "@/src/lib/spotify-session";

/**
 * Resolves Spotify access token for the authenticated owner:
 * cookies first, then encrypted refresh in spotify_connections (vault).
 *
 * The vault is the cross-app contract: apps/web reads the same row by slug
 * without calling the player over HTTP.
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

  return getAccessTokenForUser(muziks.userId);
}
