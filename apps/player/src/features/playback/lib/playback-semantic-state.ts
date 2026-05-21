import type { NormalizedSpotifyPlayerState } from "@muziks/types";

/** Track / device / play state — excludes position (progress is UI-only via SDK + RAF). */
export function playbackSemanticFingerprint(
  state: NormalizedSpotifyPlayerState,
): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
  ].join("|");
}

export function playbackSemanticChanged(
  prev: NormalizedSpotifyPlayerState | null,
  next: NormalizedSpotifyPlayerState,
): boolean {
  if (!prev) return true;
  return playbackSemanticFingerprint(prev) !== playbackSemanticFingerprint(next);
}
