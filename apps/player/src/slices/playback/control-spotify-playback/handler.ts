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

function logSpotifyControlDebug(
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
        "apps/player/src/slices/playback/control-spotify-playback/handler.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

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

  logSpotifyControlDebug("H6", "server spotify control accepted", {
    action,
    deviceId: deviceId ?? null,
    hasUris: Boolean(uris?.length),
    hasContextUri: Boolean(contextUri),
  });

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

  logSpotifyControlDebug("H6", "server spotify control state read", {
    action,
    requestDeviceId: deviceId ?? null,
    stateDeviceId: state.deviceId,
    stateTrackUri: state.trackUri,
    stateStatus: state.status,
    statePaused: state.paused,
  });

  return { status: 200 as const, body: { ok: true, state } };
}
