import {
  PLAYER_SESSION_BROADCAST_EVENT,
  sessionSnapshotBroadcastSchema,
  type PublicPlaybackSession,
} from "@muziks/types";
import { sendAgentDebugLog } from "@muziks/utils";

import { subscribePlayerBroadcastEvent } from "@/src/lib/realtime/player-session-channel";

function mapBroadcastToPublicSession(
  payload: unknown,
): PublicPlaybackSession | null {
  const parsed = sessionSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    sendAgentDebugLog({
      sessionId: "867515",
      sameOriginPath: "/api/debug/realtime",
      hypothesisId: "H4",
      location: "apps/web/src/lib/realtime/playback-session-channel.ts",
      message: "web playback realtime payload parse failed",
      data: {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
          message: issue.message,
        })),
      },
    });
    return null;
  }

  const { playback, stateVersion, sourceUpdatedAt } = parsed.data;
  const progressUpdatedAt =
    playback.positionUpdatedAt ??
    (sourceUpdatedAt ? Date.parse(sourceUpdatedAt) : Date.now());

  return {
    trackName: playback.trackName,
    artistName: playback.artistName,
    albumImageUrl: playback.albumImageUrl ?? null,
    progressMs: playback.positionMs,
    durationMs: playback.durationMs,
    paused: playback.paused,
    status: playback.status ?? (playback.paused ? "paused" : "playing"),
    stateVersion,
    progressUpdatedAt: Number.isFinite(progressUpdatedAt)
      ? progressUpdatedAt
      : Date.now(),
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
