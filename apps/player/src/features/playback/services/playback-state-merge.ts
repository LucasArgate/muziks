import type { NormalizedSpotifyPlayerState } from "@muziks/types";

export type PlaybackStateSource = "sdk" | "api";

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

/** When fields match, keep SDK progress for smooth UI between API ticks. */
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
