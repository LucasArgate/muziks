import { schedules } from "@trigger.dev/sdk";

import { getPlaybackWorkerConfig } from "../config.js";
import { runPlaybackOrchestrator } from "../playback-orchestrator.js";

const config = getPlaybackWorkerConfig();

export const playbackTick = schedules.task({
  id: "playback-tick",
  cron: config.playbackTickCron,
  run: async (payload) => {
    const result = await runPlaybackOrchestrator();
    return {
      scheduledAt: payload.timestamp.toISOString(),
      playersProcessed: result.playersProcessed,
      eventsEmitted: result.eventsEmitted,
    };
  },
});
