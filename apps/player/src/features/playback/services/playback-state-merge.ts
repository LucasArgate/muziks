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

/** When fields match, keep SDK progress from the latest SDK event. */
export function mergeApiOverSdk(
  sdk: NormalizedSpotifyPlayerState | null,
  api: NormalizedSpotifyPlayerState,
): NormalizedSpotifyPlayerState {
  if (!sdk || statesDiverge(sdk, api)) {
    return api;
  }

  return {
    ...api,
    positionMs: sdk.positionMs,
    positionUpdatedAt: sdk.positionUpdatedAt,
  };
}

/**
 * Hybrid: borrow SDK position only when API and SDK agree on track, device, and play state.
 * When diverged (e.g. pause on phone), keep API display — do not copy SDK paused/playing.
 */
export function preferSdkProgressInHybrid(
  sdk: NormalizedSpotifyPlayerState | null,
  display: NormalizedSpotifyPlayerState,
): NormalizedSpotifyPlayerState {
  if (!sdk?.trackUri || statesDiverge(sdk, display)) {
    return display;
  }
  if (sdk.paused || sdk.status !== "playing") {
    return display;
  }
  return {
    ...display,
    positionMs: sdk.positionMs,
    positionUpdatedAt: sdk.positionUpdatedAt,
  };
}
