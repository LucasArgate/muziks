import { schedules } from "@trigger.dev/sdk";

import { runPlaybackOrchestrator } from "../playback-orchestrator.js";

const DEFAULT_PLAYBACK_TICK_CRON = "* * * * *";

export const playbackTick = schedules.task({
  id: "playback-tick",
  cron: process.env.PLAYBACK_WORKER_CRON ?? DEFAULT_PLAYBACK_TICK_CRON,
  run: async (payload) => {
    const result = await runPlaybackOrchestrator();
    return {
      scheduledAt: payload.timestamp.toISOString(),
      playersProcessed: result.playersProcessed,
      eventsEmitted: result.eventsEmitted,
    };
  },
});