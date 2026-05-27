import { transferPlayback } from "@muziks/spotify";
import { z } from "zod";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";
import { readSpotifyPlaybackSnapshot } from "@/src/lib/spotify/read-playback-state";

const transferBodySchema = z.object({
  deviceId: z.string().min(1),
  play: z.boolean().optional(),
});

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

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

  try {
    const { state, activeDeviceName } =
      await readSpotifyPlaybackSnapshot(accessToken);

    return { status: 200 as const, body: { ok: true, state, activeDeviceName } };
  } catch (error) {
    return {
      status: 200 as const,
      body: {
        ok: true,
        state: null,
        activeDeviceName: null,
        stateReadError: errorMessage(error),
      },
    };
  }
}
