import {
  getPlaybackQueue,
  normalizeSpotifyPlaybackQueue,
} from "@muziks/spotify";
import { normalizedSpotifyPlaybackQueueSchema } from "@muziks/types";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";

export async function getSpotifyPlaybackQueueHandler() {
  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const raw = await getPlaybackQueue({ accessToken });
  const queue = normalizeSpotifyPlaybackQueue(raw);

  return {
    status: 200 as const,
    body: {
      queue: normalizedSpotifyPlaybackQueueSchema.parse(queue),
    },
  };
}
