import { transferPlayback } from "@muziks/spotify";
import { sendAgentDebugLog } from "@muziks/utils";
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

function logSpotifyTransferDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  sendAgentDebugLog({
    sessionId: "cc732b",
    hypothesisId,
    location:
      "apps/player/src/slices/playback/transfer-spotify-playback/handler.ts",
    message,
    data,
  });
}

function logSpotifyTransferCurrentDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  sendAgentDebugLog({
    hypothesisId,
    location:
      "apps/player/src/slices/playback/transfer-spotify-playback/handler.ts",
    message,
    data,
  });
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

  try {
    const { state, activeDeviceName } =
      await readSpotifyPlaybackSnapshot(accessToken);

    logSpotifyTransferDebug("H5", "server spotify transfer state read", {
      requestDeviceId: parsed.data.deviceId,
      play: parsed.data.play ?? null,
      stateDeviceId: state.deviceId,
      stateTrackUri: state.trackUri,
      stateStatus: state.status,
      statePaused: state.paused,
      activeDeviceName,
    });
    logSpotifyTransferCurrentDebug("H2", "server spotify transfer state read", {
      requestDeviceId: parsed.data.deviceId,
      play: parsed.data.play ?? null,
      stateDeviceId: state.deviceId,
      stateTrackUri: state.trackUri,
      stateStatus: state.status,
      statePaused: state.paused,
      activeDeviceName,
    });

    return { status: 200 as const, body: { ok: true, state, activeDeviceName } };
  } catch (error) {
    logSpotifyTransferCurrentDebug("H2", "server spotify transfer state read failed", {
      requestDeviceId: parsed.data.deviceId,
      play: parsed.data.play ?? null,
      error: errorMessage(error),
    });

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
