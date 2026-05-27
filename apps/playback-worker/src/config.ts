const DEFAULT_PLAYBACK_SUPERVISOR_CRON = "*/15 * * * *";
const DEFAULT_PLAYBACK_REALTIME_WATCHER_CRON = "*/5 * * * *";
const DEFAULT_PLAYBACK_TICK_CRON = "0 0 1 1 *";

export function getPlaybackWorkerConfig() {
  const legacyBatchTickEnabled =
    process.env.PLAYBACK_WORKER_LEGACY_TICK === "1";

  return {
    legacyBatchTickEnabled,
    playbackTickCron: legacyBatchTickEnabled
      ? (process.env.PLAYBACK_WORKER_CRON ?? "* * * * *")
      : (process.env.PLAYBACK_WORKER_CRON ?? DEFAULT_PLAYBACK_TICK_CRON),
    playbackSupervisorCron:
      process.env.PLAYBACK_WORKER_SUPERVISOR_CRON ??
      DEFAULT_PLAYBACK_SUPERVISOR_CRON,
    playbackRealtimeWatcherCron:
      process.env.PLAYBACK_WORKER_REALTIME_WATCHER_CRON ??
      DEFAULT_PLAYBACK_REALTIME_WATCHER_CRON,
    realtimeWatcher: {
      durationMs: Number(
        process.env.PLAYBACK_REALTIME_WATCHER_DURATION_MS ?? "50000",
      ),
      chainDelayMs: Number(
        process.env.PLAYBACK_REALTIME_WATCHER_CHAIN_DELAY_MS ?? "10000",
      ),
    },
  };
}
