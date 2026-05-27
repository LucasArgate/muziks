import { postPlaybackTick, type PlaybackTickResult } from "./muziks-api-client.js";

export type RunPlaybackOrchestratorResult = PlaybackTickResult;

/** Delegates to the player internal tick (full lifecycle + queue transitions). */
export async function runPlaybackOrchestrator(): Promise<RunPlaybackOrchestratorResult> {
  return postPlaybackTick();
}
