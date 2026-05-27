import {
  createDrizzleSpotifyBackgroundPlaybackPorts,
  runBackgroundPlaybackOrchestrator,
  type RunPlaybackOrchestratorResult,
} from "@muziks/playback";

import { publishWorkerSessionSnapshot } from "./lib/realtime/session-broadcast.js";
import { getAccessTokenForPlayer } from "./lib/spotify/token-vault.js";

export type { RunPlaybackOrchestratorResult };

export async function runPlaybackOrchestrator(): Promise<RunPlaybackOrchestratorResult> {
  const ports = createDrizzleSpotifyBackgroundPlaybackPorts({
    getAccessToken: getAccessTokenForPlayer,
    publishSessionSnapshot: publishWorkerSessionSnapshot,
  });

  return runBackgroundPlaybackOrchestrator(ports);
}
