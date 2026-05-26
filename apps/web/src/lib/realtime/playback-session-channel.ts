import {
  PLAYER_SESSION_BROADCAST_EVENT,
  sessionSnapshotBroadcastSchema,
  type PublicPlaybackSession,
} from "@muziks/types";

import { subscribePlayerBroadcastEvent } from "@/src/lib/realtime/player-session-channel";

function mapBroadcastToPublicSession(
  payload: unknown,
): PublicPlaybackSession | null {
  const parsed = sessionSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }

  const { playback, stateVersion, sourceUpdatedAt } = parsed.data;
  return {
    trackName: playback.trackName,
    artistName: playback.artistName,
    albumImageUrl: playback.albumImageUrl ?? null,
    progressMs: playback.positionMs,
    durationMs: playback.durationMs,
    paused: playback.paused,
    status: playback.status ?? (playback.paused ? "paused" : "playing"),
    stateVersion,
    updatedAt:
      sourceUpdatedAt ??
      (playback.positionUpdatedAt
        ? new Date(playback.positionUpdatedAt).toISOString()
        : new Date().toISOString()),
  };
}

export function subscribePlaybackSessionSnapshots(
  playerId: string,
  onSnapshot: (payload: PublicPlaybackSession) => void,
  onError?: (error: unknown) => void,
): () => void {
  return subscribePlayerBroadcastEvent(
    playerId,
    PLAYER_SESSION_BROADCAST_EVENT,
    (payload) => {
      const session = mapBroadcastToPublicSession(payload);
      if (session) {
        onSnapshot(session);
      }
    },
    onError,
  );
}
