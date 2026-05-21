import { PLAYBACK_DEBUG } from "@/src/config/debug";

import type { SdkPlaybackEvent } from "./sdk-events";

const LOG_PREFIX = "[muziks:playback]";

export function playbackDebug(
  scope: string,
  message: string,
  data?: unknown,
): void {
  if (!PLAYBACK_DEBUG) return;
  if (data === undefined) {
    console.log(LOG_PREFIX, scope, message);
    return;
  }
  console.log(LOG_PREFIX, scope, message, data);
}

export function summarizeSdkRawPlaybackState(
  state: Spotify.PlaybackState | null,
  deviceId: string | null,
): Record<string, unknown> {
  if (!state) {
    return { deviceId, empty: true };
  }

  const current = state.track_window.current_track;
  const next = state.track_window.next_tracks?.[0];

  return {
    deviceId,
    paused: state.paused,
    position: state.position,
    duration: state.duration,
    trackUri: current?.uri ?? null,
    trackName: current?.name ?? null,
    nextUri: next?.uri ?? null,
    upcomingCount: state.track_window.next_tracks?.length ?? 0,
    disallows: state.disallows ?? null,
  };
}

export function summarizeSdkPlaybackEvent(
  event: SdkPlaybackEvent,
  deviceId: string | null,
): Record<string, unknown> {
  switch (event.kind) {
    case "lifecycle":
      return {
        kind: event.kind,
        phase: event.phase,
        deviceId: event.deviceId,
      };
    case "error":
      return {
        kind: event.kind,
        code: event.code,
        message: event.message,
        deviceId,
      };
    case "playback":
      return {
        kind: event.kind,
        ...summarizeSdkRawPlaybackState(event.state, deviceId),
      };
    default:
      return { kind: "unknown" };
  }
}

export function logSdkRawPlayerEvent<E extends keyof Spotify.PlayerEventMap>(
  event: E,
  payload: Spotify.PlayerEventMap[E],
  deviceId: string | null,
): void {
  if (!PLAYBACK_DEBUG) return;

  if (event === "player_state_changed") {
    playbackDebug(
      "sdk",
      `raw:${event}`,
      summarizeSdkRawPlaybackState(
        payload as Spotify.PlaybackState | null,
        deviceId,
      ),
    );
    return;
  }

  if (event === "ready" || event === "not_ready") {
    playbackDebug("sdk", `raw:${event}`, payload);
    return;
  }

  playbackDebug("sdk", `raw:${event}`, payload);
}
