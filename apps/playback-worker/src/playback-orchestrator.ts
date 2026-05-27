import {
  createDrizzleSpotifyBackgroundPlaybackPorts,
  runBackgroundPlaybackOrchestrator,
  type RunPlaybackOrchestratorResult,
} from "@muziks/playback";

import { publishWorkerSessionSnapshot } from "./lib/realtime/session-broadcast.js";
import { publishWorkerSpotifyQueueSnapshot } from "./lib/realtime/spotify-queue-broadcast.js";
import { getAccessTokenForPlayer } from "./lib/spotify/token-vault.js";

export type { RunPlaybackOrchestratorResult };

export async function runPlaybackOrchestrator(): Promise<RunPlaybackOrchestratorResult> {
  const ports = createDrizzleSpotifyBackgroundPlaybackPorts({
    getAccessToken: getAccessTokenForPlayer,
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
  });

  return runBackgroundPlaybackOrchestrator(ports);
}
