import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
} from "@muziks/types";

/** SDK controls only when browser is the sole source and has an active track. */
export function shouldControlViaSdk(
  syncMode: PlaybackSyncMode,
  playback: NormalizedSpotifyPlayerState | null,
): boolean {
  if (syncMode !== "sdk") return false;
  if (!playback?.trackUri) return false;
  if (playback.status === "error") return false;
  return true;
}

export function hasActivePlayback(
  playback: NormalizedSpotifyPlayerState | null,
): boolean {
  if (!playback) return false;
  if (playback.trackUri) return true;
  return playback.status === "playing" || playback.status === "paused";
}
