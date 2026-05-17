import type { NormalizedSpotifyPlayerState, PlaybackSessionStatus } from "@muziks/types";

import {
  normalizeErrorState,
  normalizeIdleState,
  normalizeReadyState,
  normalizeSpotifyPlaybackState,
} from "../lib/normalize-spotify-state";
import type { SpotifyServiceInstance } from "./SpotifyService";

type ListenerEntry<E extends keyof Spotify.PlayerEventMap> = {
  event: E;
  callback: (payload: Spotify.PlayerEventMap[E]) => void;
};

export type SdkPlaybackSourceOptions = {
  onState: (state: NormalizedSpotifyPlayerState, status?: PlaybackSessionStatus) => void;
};

export class SdkPlaybackSource {
  private service: SpotifyServiceInstance | null = null;
  private options: SdkPlaybackSourceOptions | null = null;
  private listeners: ListenerEntry<keyof Spotify.PlayerEventMap>[] = [];

  start(
    service: SpotifyServiceInstance,
    options: SdkPlaybackSourceOptions,
  ): void {
    this.stop();
    this.service = service;
    this.options = options;

    const emit = (
      state: NormalizedSpotifyPlayerState,
      status?: PlaybackSessionStatus,
    ) => {
      this.options?.onState(state, status);
    };

    const onReady = ({ device_id }: Spotify.DeviceMessage) => {
      emit(normalizeReadyState(device_id), "ready");
    };

    const onNotReady = () => {
      emit(normalizeIdleState(), "idle");
    };

    const onStateChanged = (playbackState: Spotify.PlaybackState | null) => {
      const deviceId = service.getDeviceId();
      const state = normalizeSpotifyPlaybackState(playbackState, deviceId);
      const status = state.status ?? (state.paused ? "paused" : "playing");
      emit(state, status);
    };

    const onError = (message: string) => {
      const deviceId = service.getDeviceId();
      emit(normalizeErrorState(deviceId, message), "error");
    };

    this.addListener("ready", onReady);
    this.addListener("not_ready", onNotReady);
    this.addListener("player_state_changed", onStateChanged);
    this.addListener("initialization_error", (p) => onError(p.message));
    this.addListener("authentication_error", (p) => onError(p.message));
    this.addListener("account_error", (p) => onError(p.message));
    this.addListener("playback_error", (p) => onError(p.message));
  }

  stop(): void {
    if (this.service) {
      for (const { event, callback } of this.listeners) {
        this.service.player.removeListener(event, callback);
      }
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
    this.service.player.addListener(event, callback);
    this.listeners.push({ event, callback });
  }
}
