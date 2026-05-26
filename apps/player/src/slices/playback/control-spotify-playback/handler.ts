import {
  pausePlayback,
  skipToNext,
  startPlayback,
} from "@muziks/spotify";
import { sendAgentDebugLog } from "@muziks/utils";
import { z } from "zod";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";
import { readSpotifyPlaybackSnapshot } from "@/src/lib/spotify/read-playback-state";

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
  sendAgentDebugLog({
    sessionId: "cc732b",
    hypothesisId,
    location:
      "apps/player/src/slices/playback/control-spotify-playback/handler.ts",
    message,
    data,
  });
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

  const { state, activeDeviceName } =
    await readSpotifyPlaybackSnapshot(accessToken);

  logSpotifyControlDebug("H6", "server spotify control state read", {
    action,
    requestDeviceId: deviceId ?? null,
    stateDeviceId: state.deviceId,
    stateTrackUri: state.trackUri,
    stateStatus: state.status,
    statePaused: state.paused,
    activeDeviceName,
  });

  return { status: 200 as const, body: { ok: true, state, activeDeviceName } };
}
