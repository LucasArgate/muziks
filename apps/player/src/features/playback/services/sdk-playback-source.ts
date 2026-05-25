import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
} from "@muziks/types";

import {
  logSdkRawPlayerEvent,
  playbackDebug,
  summarizeSdkPlaybackEvent,
} from "../lib/playback-debug";
import type { SdkErrorCode, SdkPlaybackEvent } from "../lib/sdk-events";
import {
  normalizeErrorState,
  normalizeIdleState,
  normalizeReadyState,
  normalizeSdkPlaybackQueue,
  normalizeSpotifyPlaybackState,
} from "../lib/normalize-spotify-state";
import type { SpotifyServiceInstance } from "./SpotifyService";

type ListenerEntry = {
  event: keyof Spotify.PlayerEventMap;
  callback: (payload: Spotify.PlayerEventMap[keyof Spotify.PlayerEventMap]) => void;
};

export type SdkPlaybackSourceOptions = {
  onState: (state: NormalizedSpotifyPlayerState, status?: PlaybackSessionStatus) => void;
  onQueue?: (queue: NormalizedSpotifyPlaybackQueue | null) => void;
  onEvent?: (event: SdkPlaybackEvent) => void;
};

export class SdkPlaybackSource {
  private service: SpotifyServiceInstance | null = null;
  private options: SdkPlaybackSourceOptions | null = null;
  private listeners: ListenerEntry[] = [];

  start(
    service: SpotifyServiceInstance,
    options: SdkPlaybackSourceOptions,
  ): void {
    this.stop();
    this.service = service;
    this.options = options;
    playbackDebug("sdk", "source:start");

    const emitEvent = (event: SdkPlaybackEvent) => {
      playbackDebug(
        "sdk",
        `event:${event.kind}`,
        summarizeSdkPlaybackEvent(event, service.getDeviceId()),
      );
      this.options?.onEvent?.(event);
    };

    const emit = (
      state: NormalizedSpotifyPlayerState,
      status?: PlaybackSessionStatus,
    ) => {
      playbackDebug("sdk", "normalized_state", {
        status,
        trackUri: state.trackUri,
        paused: state.paused,
        positionMs: state.positionMs,
        deviceId: state.deviceId,
      });
      this.options?.onState(state, status);
    };

    const emitPlayback = (playbackState: Spotify.PlaybackState | null) => {
      const deviceId = service.getDeviceId();
      const state = normalizeSpotifyPlaybackState(playbackState, deviceId);
      const status = state.status ?? (state.paused ? "paused" : "playing");
      emit(state, status);
      options.onQueue?.(normalizeSdkPlaybackQueue(playbackState));
      emitEvent({ kind: "playback", state: playbackState });
    };

    const hydrateFromCurrentState = () => {
      playbackDebug("sdk", "hydrate:getCurrentState");
      void service.getCurrentState().then((playbackState) => {
        if (!this.service || this.options !== options) return;
        playbackDebug(
          "sdk",
          "hydrate:result",
          playbackState
            ? {
                paused: playbackState.paused,
                position: playbackState.position,
                trackUri:
                  playbackState.track_window.current_track?.uri ?? null,
              }
            : { empty: true },
        );
        if (playbackState?.track_window.current_track) {
          emitPlayback(playbackState);
        }
      });
    };

    const onReady = ({ device_id }: Spotify.DeviceMessage) => {
      service.setDeviceId(device_id);
      emit(normalizeReadyState(device_id), "ready");
      emitEvent({
        kind: "lifecycle",
        phase: "ready",
        deviceId: device_id,
      });
      hydrateFromCurrentState();
    };

    const onNotReady = ({ device_id }: Spotify.DeviceMessage) => {
      service.setDeviceId(null);
      emit(normalizeIdleState(), "idle");
      emitEvent({
        kind: "lifecycle",
        phase: "not_ready",
        deviceId: device_id ?? null,
      });
    };

    const onStateChanged = (playbackState: Spotify.PlaybackState | null) => {
      emitPlayback(playbackState);
    };

    const onError = (code: SdkErrorCode, message: string) => {
      const deviceId = service.getDeviceId();
      emit(normalizeErrorState(deviceId, message), "error");
      emitEvent({ kind: "error", code, message });
    };

    this.addListener("ready", onReady);
    this.addListener("not_ready", onNotReady);
    this.addListener("player_state_changed", onStateChanged);
    this.addListener("initialization_error", (p) =>
      onError("initialization", p.message),
    );
    this.addListener("authentication_error", (p) =>
      onError("authentication", p.message),
    );
    this.addListener("account_error", (p) => onError("account", p.message));
    this.addListener("playback_error", (p) => onError("playback", p.message));
  }

  stop(): void {
    playbackDebug("sdk", "source:stop");
    if (this.service) {
      for (const { event, callback } of this.listeners) {
        this.service.player.removeListener(event, callback);
      }
      this.service.setDeviceId(null);
    }
    this.listeners = [];
    this.service = null;
    this.options = null;
  }

  get player(): Spotify.Player | null {
    return this.service?.player ?? null;
  }

  private addListener<E extends keyof Spotify.PlayerEventMap>(
    event: E,
    callback: (payload: Spotify.PlayerEventMap[E]) => void,
  ): void {
    if (!this.service) return;

    const wrapped = (payload: Spotify.PlayerEventMap[E]) => {
      logSdkRawPlayerEvent(event, payload, this.service?.getDeviceId() ?? null);
      callback(payload);
    };

    this.service.player.addListener(event, wrapped);
    this.listeners.push({
      event,
      callback: wrapped as ListenerEntry["callback"],
    });
  }
}
