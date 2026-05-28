import {
  runBackgroundPlaybackOrchestrator,
  type RunPlaybackOrchestratorResult,
} from "@muziks/playback";

import { createSupervisePorts } from "./lib/supervise/create-supervise-ports.js";

export type { RunPlaybackOrchestratorResult };

export async function runPlaybackOrchestrator(): Promise<RunPlaybackOrchestratorResult> {
  const ports = createSupervisePorts();
  return runBackgroundPlaybackOrchestrator(ports);
}
