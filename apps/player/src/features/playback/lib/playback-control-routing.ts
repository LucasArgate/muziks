import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
} from "@muziks/types";

/**
 * SDK controls when the browser is the active playback device.
 * In hybrid, requires matching SDK device id (or playback without device yet).
 */
export function shouldControlViaSdk(
  syncMode: PlaybackSyncMode,
  playback: NormalizedSpotifyPlayerState | null,
  sdkDeviceId: string | null,
): boolean {
  if (syncMode === "api_device") return false;
  if (!playback?.trackUri) return false;
  if (playback.status === "error") return false;
  if (syncMode === "sdk") return true;
  if (!sdkDeviceId) return false;
  if (playback.deviceId && playback.deviceId !== sdkDeviceId) {
    return false;
  }
  return true;
}

export function hasActivePlayback(
  playback: NormalizedSpotifyPlayerState | null,
): boolean {
  if (!playback) return false;
  if (playback.trackUri) return true;
  return playback.status === "playing" || playback.status === "paused";
}

/** Browser SDK is the UI source when hybrid and devices are aligned. */
export function isSdkUiAuthoritative(
  syncMode: PlaybackSyncMode,
  sdkDeviceId: string | null,
  playbackDeviceId: string | null | undefined,
  apiDeviceId: string | null | undefined,
): boolean {
  if (syncMode !== "hybrid" || !sdkDeviceId) return syncMode === "sdk";
  if (playbackDeviceId && playbackDeviceId !== sdkDeviceId) return false;
  if (apiDeviceId && apiDeviceId !== sdkDeviceId) return false;
  return true;
}
