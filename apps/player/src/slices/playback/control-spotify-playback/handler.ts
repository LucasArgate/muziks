import {
  pausePlayback,
  skipToNext,
  startPlayback,
} from "@muziks/spotify";
import { z } from "zod";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";
import { readNormalizedSpotifyPlaybackState } from "@/src/lib/spotify/read-playback-state";

const controlBodySchema = z.object({
  action: z.enum(["play", "pause", "next"]),
  deviceId: z.string().optional(),
  uris: z.array(z.string()).optional(),
  contextUri: z.string().optional(),
});

export async function controlSpotifyPlaybackHandler(rawBody: unknown) {
  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const parsed = controlBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_body", details: parsed.error.flatten() },
    };
  }

  const { action, deviceId, uris, contextUri } = parsed.data;
  const params = { accessToken, deviceId };

  switch (action) {
    case "play":
      await startPlayback({ ...params, uris, contextUri });
      break;
    case "pause":
      await pausePlayback(params);
      break;
    case "next":
      await skipToNext(params);
      break;
  }

  const state = await readNormalizedSpotifyPlaybackState(accessToken);

  return { status: 200 as const, body: { ok: true, state } };
}
