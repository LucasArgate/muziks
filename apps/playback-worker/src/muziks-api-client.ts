import { getPlaybackWorkerConfig } from "./config.js";

export type PlaybackTickResponse = {
  playersProcessed: number;
  eventsEmitted: number;
};

export async function runPlaybackTick(): Promise<PlaybackTickResponse> {
  const config = getPlaybackWorkerConfig();
  const response = await fetch(
    `${config.playerApiUrl}/api/internal/playback-tick`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.workerSecret}`,
      },
    },
  );

  const body = (await response.json().catch(() => ({}))) as
    | PlaybackTickResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error("error" in body && body.error ? body.error : "tick_failed");
  }

  return body as PlaybackTickResponse;
}
