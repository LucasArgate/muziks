import { mirrorNextToSpotifyQueueForPlayer } from "@muziks/playback";

import { getAccessTokenForPlayer } from "@/src/lib/spotify/spotify-token-vault";

export async function mirrorNextToSpotifyQueueHandler(
  playerId: string,
  rawBody: unknown,
) {
  return mirrorNextToSpotifyQueueForPlayer(
    playerId,
    rawBody,
    getAccessTokenForPlayer,
  );
}
