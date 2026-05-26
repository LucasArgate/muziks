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
    // #region agent log
    fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "867515" }, body: JSON.stringify({ sessionId: "867515", runId: "initial", hypothesisId: "H4", location: "apps/web/src/lib/realtime/playback-session-channel.ts:16", message: "web playback realtime payload parse failed", data: { issues: parsed.error.issues.map((issue) => ({ path: issue.path.join("."), code: issue.code, message: issue.message })) }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
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
