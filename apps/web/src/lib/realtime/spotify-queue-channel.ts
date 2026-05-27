import {
  SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT,
  spotifyQueueSnapshotBroadcastSchema,
  type SpotifyQueueSnapshotBroadcast,
} from "@muziks/types";

import { subscribePlayerBroadcastEvent } from "@/src/lib/realtime/player-session-channel";

export function subscribeSpotifyQueueSnapshots(
  playerId: string,
  onSnapshot: (payload: SpotifyQueueSnapshotBroadcast) => void,
  onError?: (error: unknown) => void,
): () => void {
  return subscribePlayerBroadcastEvent(
    playerId,
    SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT,
    (payload) => {
      const parsed = spotifyQueueSnapshotBroadcastSchema.safeParse(payload);
      if (parsed.success) {
        onSnapshot(parsed.data);
      }
    },
    onError,
  );
}
