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

function readSupabaseUrl(): string {
  return stripTrailingSlash(
    process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL ??
      readRequiredEnv("SUPABASE_URL"),
  );
}

export function getPlaybackWorkerConfig() {
  const supabaseServiceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  return {
    supabaseUrl: readSupabaseUrl(),
    supabaseServiceRoleKey,
    spotifyClientId: readRequiredEnv("SPOTIFY_CLIENT_ID"),
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET?.trim(),
    spotifyTokenEncryptionKey:
      process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY?.trim() ??
      supabaseServiceRoleKey,
    playbackTickCron:
      process.env.PLAYBACK_WORKER_CRON ?? DEFAULT_PLAYBACK_TICK_CRON,
  };
}
