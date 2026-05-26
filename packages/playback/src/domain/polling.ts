export const PLAYBACK_ACTIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
export const PLAYBACK_ENDING_SOON_MS = 90_000;
export const PLAYBACK_BROWSER_HEALTH_WINDOW_MS = 30_000;
export const PLAYBACK_PLAYING_NEXT_TICK_MS = 15_000;
export const PLAYBACK_PAUSED_NEXT_TICK_MS = 60_000;
export const PLAYBACK_IDLE_NEXT_TICK_MS = 5 * 60_000;
export const PLAYBACK_ERROR_BACKOFF_MS = 30_000;
export const PLAYBACK_TICK_BATCH_SIZE = 20;
export const PLAYBACK_TICK_LOCK_MS = 2 * 60_000;
export const PLAYBACK_CLIENT_PLAYING_POLL_MS = 8_000;
export const PLAYBACK_CLIENT_PAUSED_POLL_MS = 25_000;
export const PLAYBACK_CLIENT_IDLE_POLL_MS = 45_000;
export const PLAYBACK_CLIENT_MAX_BACKOFF_MULTIPLIER = 4;

export type PlaybackTickScheduleInput = {
  ok: boolean;
  skipped?: "no_token" | "spotify_error";
  retryAfterMs?: number;
  paused?: boolean;
};

export function resolveNextPlaybackTickAt(
  result: PlaybackTickScheduleInput,
  nowMs = Date.now(),
): Date {
  if (!result.ok) {
    if (result.retryAfterMs !== undefined) {
      return new Date(nowMs + Math.max(result.retryAfterMs, 1000));
    }

    const delay =
      result.skipped === "no_token"
        ? PLAYBACK_IDLE_NEXT_TICK_MS
        : PLAYBACK_ERROR_BACKOFF_MS;
    return new Date(nowMs + delay);
  }

  if (result.paused) {
    return new Date(nowMs + PLAYBACK_PAUSED_NEXT_TICK_MS);
  }

  return new Date(nowMs + PLAYBACK_PLAYING_NEXT_TICK_MS);
}
