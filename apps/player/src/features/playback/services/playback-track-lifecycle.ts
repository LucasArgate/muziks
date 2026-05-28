import {
  applyLifecycleFromSample as applyLifecycleFromSampleShared,
  computeExpectedEndAt,
  spotifyTrackIdFromUri,
  type ApplyLifecycleResult,
} from "@muziks/playback";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import { logPlaybackLifecycle } from "@/src/lib/playback/playback-lifecycle-log";
import { broadcastTrackEventFromServer } from "@/src/lib/realtime/player-session-broadcast-server";

export { computeExpectedEndAt, spotifyTrackIdFromUri, type ApplyLifecycleResult };

const playerLifecycleDeps = {
  publishTrackEvent: async (
    playerId: string,
    event: Parameters<typeof broadcastTrackEventFromServer>[1]["event"],
  ) => {
    await broadcastTrackEventFromServer(playerId, { event });
  },
  logLifecycle: logPlaybackLifecycle,
};

export async function applyLifecycleFromSample(
  playerId: string,
  state: NormalizedSpotifyPlayerState,
): Promise<ApplyLifecycleResult> {
  return applyLifecycleFromSampleShared(playerId, state, playerLifecycleDeps);
}
