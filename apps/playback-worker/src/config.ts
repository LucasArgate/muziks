const DEFAULT_PLAYBACK_TICK_CRON = "* * * * *";

export function getPlaybackWorkerConfig() {
  return {
    playbackTickCron:
      process.env.PLAYBACK_WORKER_CRON ?? DEFAULT_PLAYBACK_TICK_CRON,
  };
}
