import {
  handleConfirmedTrackTransition as handleConfirmedTrackTransitionShared,
} from "@muziks/playback";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import { broadcastQueueSnapshotFromServer } from "@/src/lib/realtime/muziks-queue-broadcast-server";
import { getAccessTokenForPlayer } from "@/src/lib/spotify/spotify-token-vault";

export async function handleConfirmedTrackTransition(input: {
  playerId: string;
  previousTrackUri: string | null;
  nextState: NormalizedSpotifyPlayerState;
}): Promise<{ dequeued: boolean; mirrored: boolean }> {
  return handleConfirmedTrackTransitionShared(input, {
    getAccessToken: getAccessTokenForPlayer,
    publishQueueSnapshot: broadcastQueueSnapshotFromServer,
  });
}
