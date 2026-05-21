import type {
  PublicPlaybackSession,
  SessionSnapshotBroadcast,
} from "@muziks/types";

/** Maps a Realtime `session.snapshot` payload to the public participant view model. */
export function mapBroadcastToPublic(
  payload: SessionSnapshotBroadcast,
): PublicPlaybackSession {
  const { playback, stateVersion } = payload;
  const updatedAt = playback.positionUpdatedAt
    ? new Date(playback.positionUpdatedAt).toISOString()
    : new Date().toISOString();

  return {
    trackName: playback.trackName,
    artistName: playback.artistName,
    albumImageUrl: playback.albumImageUrl ?? null,
    progressMs: playback.positionMs,
    durationMs: playback.durationMs,
    paused: playback.paused,
    status: playback.status ?? (playback.paused ? "paused" : "playing"),
    stateVersion,
    updatedAt,
  };
}
