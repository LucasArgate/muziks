import { transferPlayback } from "@muziks/spotify";
import { z } from "zod";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";
import { readNormalizedSpotifyPlaybackState } from "@/src/lib/spotify/read-playback-state";

const transferBodySchema = z.object({
  deviceId: z.string().min(1),
  play: z.boolean().optional(),
});

function logSpotifyTransferDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "cc732b",
    },
    body: JSON.stringify({
      sessionId: "cc732b",
      runId: "initial",
      hypothesisId,
      location:
        "apps/player/src/slices/playback/transfer-spotify-playback/handler.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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

  logSpotifyTransferDebug("H5", "server spotify transfer accepted", {
    deviceId: parsed.data.deviceId,
    play: parsed.data.play ?? null,
  });

  await transferPlayback({
    accessToken,
    deviceIds: [parsed.data.deviceId],
    play: parsed.data.play,
  });

  const state = await readNormalizedSpotifyPlaybackState(accessToken);

  logSpotifyTransferDebug("H5", "server spotify transfer state read", {
    requestDeviceId: parsed.data.deviceId,
    play: parsed.data.play ?? null,
    stateDeviceId: state.deviceId,
    stateTrackUri: state.trackUri,
    stateStatus: state.status,
    statePaused: state.paused,
  });

  return { status: 200 as const, body: { ok: true, state } };
}
