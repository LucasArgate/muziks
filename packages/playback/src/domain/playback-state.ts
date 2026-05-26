import type {
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
} from "@muziks/types";

export type PlaybackSessionProjection = {
  currentTrackUri: string | null;
  trackName: string | null;
  artistName: string | null;
  albumImageUrl: string | null;
  progressMs: number;
  durationMs: number;
  paused: boolean;
  activeDeviceId: string | null;
  status: string;
  lastError: string | null;
  updatedAt: Date;
};

export function fingerprintPlaybackState(
  state: NormalizedSpotifyPlayerState,
): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
    Math.floor(state.positionMs / 5000),
  ].join("|");
}

export function hasSemanticPlaybackChange(
  previous: NormalizedSpotifyPlayerState | null,
  next: NormalizedSpotifyPlayerState,
): boolean {
  return (
    !previous ||
    fingerprintPlaybackState(previous) !== fingerprintPlaybackState(next)
  );
}

export function playbackSessionToNormalized(
  row: PlaybackSessionProjection,
): NormalizedSpotifyPlayerState {
  return {
    trackUri: row.currentTrackUri,
    trackName: row.trackName,
    artistName: row.artistName,
    albumImageUrl: row.albumImageUrl,
    positionMs: row.progressMs,
    positionUpdatedAt: row.updatedAt.getTime(),
    durationMs: row.durationMs,
    paused: row.paused,
    deviceId: row.activeDeviceId,
    status: row.status as PlaybackSessionStatus,
    lastError: row.lastError,
  };
}

export function resolvePlaybackSessionStatus(
  state: NormalizedSpotifyPlayerState,
): PlaybackSessionStatus {
  return (
    state.status ?? (state.paused ? "paused" : state.trackUri ? "playing" : "idle")
  );
}

export function resolvePersistedProgressMs(
  state: NormalizedSpotifyPlayerState,
  persistedAt: Date,
): number {
  const durationMs = Math.max(0, state.durationMs);
  const basePositionMs =
    durationMs > 0
      ? Math.min(state.positionMs, durationMs)
      : Math.max(0, state.positionMs);

  if (state.paused || !state.positionUpdatedAt || durationMs <= 0) {
    return basePositionMs;
  }

  const elapsedMs = Math.max(0, persistedAt.getTime() - state.positionUpdatedAt);
  return Math.min(basePositionMs + elapsedMs, durationMs);
}
