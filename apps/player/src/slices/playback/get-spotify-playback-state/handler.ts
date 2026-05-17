import { getCurrentPlayback, normalizeApiPlaybackState } from "@muziks/spotify";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";

export async function getSpotifyPlaybackStateHandler() {
  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const raw = await getCurrentPlayback({ accessToken });
  const state = normalizeApiPlaybackState(raw);

  return {
    status: 200 as const,
    body: { state, raw: raw ?? null },
  };
}
