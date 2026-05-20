import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
} from "@muziks/types";

export type PlaybackStateSource = "sdk" | "api" | "bridge";

/** API is authoritative for track, device, pause, and status. */
export function statesDiverge(
  sdk: NormalizedSpotifyPlayerState | null,
  api: NormalizedSpotifyPlayerState,
): boolean {
  if (!sdk) return true;
  return (
    sdk.trackUri !== api.trackUri ||
    sdk.deviceId !== api.deviceId ||
    sdk.paused !== api.paused ||
    (sdk.status ?? "") !== (api.status ?? "")
  );
}

/**
 * In hybrid, do not let empty browser SDK state overwrite Connect/API playback.
 */
export function shouldSdkSuppressLocalDisplay(
  mode: PlaybackSyncMode,
  sdk: NormalizedSpotifyPlayerState,
  api: NormalizedSpotifyPlayerState | null,
): boolean {
  if (mode !== "hybrid" || !api?.trackUri) {
    return false;
  }
  if (!statesDiverge(sdk, api)) {
    return false;
  }
  if (!sdk.trackUri) {
    return true;
  }
  if (api.deviceId && sdk.deviceId && api.deviceId !== sdk.deviceId) {
    return true;
  }
  return false;
}

/** When fields match, keep SDK progress only if it looks valid (ms + within duration). */
export function mergeApiOverSdk(
  sdk: NormalizedSpotifyPlayerState | null,
  api: NormalizedSpotifyPlayerState,
): NormalizedSpotifyPlayerState {
  if (!sdk || statesDiverge(sdk, api)) {
    return api;
  }

  const sdkProgressValid =
    sdk.durationMs > 0 &&
    sdk.positionMs >= 0 &&
    sdk.positionMs <= sdk.durationMs + 1500 &&
    (sdk.positionUpdatedAt ?? 0) > 0;

  if (!sdkProgressValid) {
    return api;
  }

  return {
    ...api,
    positionMs: sdk.positionMs,
    positionUpdatedAt: sdk.positionUpdatedAt,
  };
}
