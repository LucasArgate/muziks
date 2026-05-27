import { getPlaybackWorkerConfig } from "./config.js";

export type PlaybackTickResult = {
  playersProcessed: number;
  eventsEmitted: number;
};

export async function postPlaybackTick(): Promise<PlaybackTickResult> {
  const config = getPlaybackWorkerConfig();
  const url = `${config.muziksPlayerApiUrl}/api/internal/playback-tick`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.playbackWorkerSecret}`,
      "Content-Type": "application/json",
    },
  });

  const body = (await response.json().catch(() => ({}))) as {
    playersProcessed?: number;
    eventsEmitted?: number;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(body.error ?? `playback_tick_failed_${response.status}`);
  }

  return {
    playersProcessed: body.playersProcessed ?? 0,
    eventsEmitted: body.eventsEmitted ?? 0,
  };
}
