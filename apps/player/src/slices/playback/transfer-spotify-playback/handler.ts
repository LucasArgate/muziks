import { transferPlayback } from "@muziks/spotify";
import { z } from "zod";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";
import { readNormalizedSpotifyPlaybackState } from "@/src/lib/spotify/read-playback-state";

const transferBodySchema = z.object({
  deviceId: z.string().min(1),
  play: z.boolean().optional(),
});

export async function transferSpotifyPlaybackHandler(rawBody: unknown) {
  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const parsed = transferBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_body", details: parsed.error.flatten() },
    };
  }

  await transferPlayback({
    accessToken,
    deviceIds: [parsed.data.deviceId],
    play: parsed.data.play,
  });

  const state = await readNormalizedSpotifyPlaybackState(accessToken);

  return { status: 200 as const, body: { ok: true, state } };
}
