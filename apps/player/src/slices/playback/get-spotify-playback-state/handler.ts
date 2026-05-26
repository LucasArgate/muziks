import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";
import { readSpotifyPlaybackSnapshot } from "@/src/lib/spotify/read-playback-state";

export async function getSpotifyPlaybackStateHandler() {
  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const { raw, state, activeDeviceName } =
    await readSpotifyPlaybackSnapshot(accessToken);

  return {
    status: 200 as const,
    body: { state, raw, activeDeviceName },
  };
}
