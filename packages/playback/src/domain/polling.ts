export const PLAYBACK_ACTIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
export const PLAYBACK_ENDING_SOON_MS = 90_000;
export const PLAYBACK_BROWSER_HEALTH_WINDOW_MS = 30_000;
export const PLAYBACK_PLAYING_NEXT_TICK_MS = 15_000;
export const PLAYBACK_PAUSED_NEXT_TICK_MS = 60_000;
export const PLAYBACK_IDLE_NEXT_TICK_MS = 5 * 60_000;
export const PLAYBACK_ERROR_BACKOFF_MS = 30_000;

export type PlaybackTickScheduleInput = {
  ok: boolean;
  skipped?: "no_token" | "spotify_error";
  paused?: boolean;
};

export function resolveNextPlaybackTickAt(
  result: PlaybackTickScheduleInput,
  nowMs = Date.now(),
): Date {
  if (!result.ok) {
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
