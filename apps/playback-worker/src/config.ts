const DEFAULT_PLAYBACK_TICK_CRON = "* * * * *";

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name}_missing`);
  }
  return value;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getPlaybackWorkerConfig() {
  return {
    muziksPlayerApiUrl: stripTrailingSlash(
      readRequiredEnv("MUZIKS_PLAYER_API_URL"),
    ),
    playbackWorkerSecret: readRequiredEnv("PLAYBACK_WORKER_SECRET"),
    playbackTickCron:
      process.env.PLAYBACK_WORKER_CRON ?? DEFAULT_PLAYBACK_TICK_CRON,
  };
}
