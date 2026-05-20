import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  NormalizedSpotifyQueueTrack,
  PlaybackSessionStatus,
} from "@muziks/types";

function pickAlbumImageUrl(
  track: Spotify.PlaybackTrack | undefined,
): string | null {
  const images = track?.album.images;
  if (!images?.length) return null;
  return images[0]?.url ?? null;
}

function deriveStatus(
  state: Spotify.PlaybackState | null,
  deviceId: string | null,
): PlaybackSessionStatus {
  if (!deviceId) return "idle";
  if (!state) return "ready";
  if (state.paused) return "paused";
  return "playing";
}

export function normalizeSpotifyPlaybackState(
  state: Spotify.PlaybackState | null,
  deviceId: string | null,
): NormalizedSpotifyPlayerState {
  const track = state?.track_window.current_track;

  return {
    trackUri: track?.uri ?? null,
    trackName: track?.name ?? null,
    artistName: track
      ? track.artists.map((artist) => artist.name).join(", ")
      : null,
    albumImageUrl: pickAlbumImageUrl(track),
    positionMs: state?.position ?? 0,
    positionUpdatedAt: Date.now(),
    durationMs: state?.duration ?? 0,
    paused: state?.paused ?? true,
    deviceId,
    status: deriveStatus(state, deviceId),
  };
}

export function normalizeErrorState(
  deviceId: string | null,
  message: string,
): NormalizedSpotifyPlayerState {
  return {
    trackUri: null,
    trackName: null,
    artistName: null,
    albumImageUrl: null,
    positionMs: 0,
    durationMs: 0,
    paused: true,
    deviceId,
    status: "error",
    lastError: message,
  };
}

export function normalizeReadyState(
  deviceId: string,
): NormalizedSpotifyPlayerState {
  return {
    trackUri: null,
    trackName: null,
    artistName: null,
    albumImageUrl: null,
    positionMs: 0,
    durationMs: 0,
    paused: true,
    deviceId,
    status: "ready",
  };
}

function normalizeSdkQueueTrack(
  track: Spotify.PlaybackTrack,
  durationMs: number,
): NormalizedSpotifyQueueTrack {
  return {
    uri: track.uri,
    name: track.name,
    artistName: track.artists.map((artist) => artist.name).join(", "),
    albumImageUrl: pickAlbumImageUrl(track),
    durationMs,
  };
}

/** Queue lookahead from Web Playback SDK `track_window` (no HTTP poll). */
export function normalizeSdkPlaybackQueue(
  state: Spotify.PlaybackState | null,
): NormalizedSpotifyPlaybackQueue | null {
  if (!state?.track_window.current_track) {
    return null;
  }

  const current = state.track_window.current_track;
  const nextTracks = state.track_window.next_tracks ?? [];

  return {
    currentlyPlaying: normalizeSdkQueueTrack(current, state.duration ?? 0),
    upcoming: nextTracks.map((track) => normalizeSdkQueueTrack(track, 0)),
  };
}

export function normalizeIdleState(): NormalizedSpotifyPlayerState {
  return {
    trackUri: null,
    trackName: null,
    artistName: null,
    albumImageUrl: null,
    positionMs: 0,
    durationMs: 0,
    paused: true,
    deviceId: null,
    status: "idle",
  };
}
