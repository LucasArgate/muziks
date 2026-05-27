import { schedules } from "@trigger.dev/sdk";

/**
 * @deprecated Use `playback-supervisor` + `playback-supervise-player` + Realtime watcher.
 * Kept when PLAYBACK_WORKER_LEGACY_TICK=1 for rollback during migration.
 */
import { runPlaybackOrchestrator } from "../playback-orchestrator.js";
import { getPlaybackWorkerConfig } from "../config.js";

export const playbackTick = schedules.task({
  id: "playback-tick",
  cron: getPlaybackWorkerConfig().playbackTickCron,
  run: async (payload) => {
    if (!getPlaybackWorkerConfig().legacyBatchTickEnabled) {
      return {
        scheduledAt: payload.timestamp.toISOString(),
        skipped: true,
        reason: "legacy_batch_tick_disabled",
      };
    }

    const result = await runPlaybackOrchestrator();
    return {
      scheduledAt: payload.timestamp.toISOString(),
      playersProcessed: result.playersProcessed,
      eventsEmitted: result.eventsEmitted,
    };
  },
});
