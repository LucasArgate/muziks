import {
  createDrizzleSpotifyBackgroundPlaybackPorts,
  type DrizzleSpotifyBackgroundPlaybackOptions,
} from "@muziks/playback";

import { workerBackgroundTickSampleHook } from "../playback/worker-background-tick-sample-hook.js";
import { publishWorkerSessionSnapshot } from "../realtime/session-broadcast.js";
import { publishWorkerSpotifyQueueSnapshot } from "../realtime/spotify-queue-broadcast.js";
import { getAccessTokenForPlayer } from "../spotify/token-vault.js";

export function createSupervisePorts(
  overrides: Partial<DrizzleSpotifyBackgroundPlaybackOptions> = {},
) {
  return createDrizzleSpotifyBackgroundPlaybackPorts({
    getAccessToken: getAccessTokenForPlayer,
    afterSample: workerBackgroundTickSampleHook,
    publishSessionSnapshot: publishWorkerSessionSnapshot,
    publishSpotifyQueueSnapshot: async (input) => {
      await publishWorkerSpotifyQueueSnapshot({
        playerId: input.playerId,
        queue: input.queue,
        queueVersion: input.queueVersion,
        stateVersion: input.stateVersion,
        source: input.source,
      });
    },
    ...overrides,
  });
}
