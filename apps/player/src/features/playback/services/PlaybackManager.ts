import type {
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
  PublishPlaybackSessionInput,
} from "@muziks/types";

import {
  normalizeErrorState,
  normalizeIdleState,
  normalizeReadyState,
  normalizeSpotifyPlaybackState,
} from "../lib/normalize-spotify-state";
import type { SpotifyServiceInstance } from "./SpotifyService";

const SYNC_DEBOUNCE_MS = 800;

export type PlaybackManagerOptions = {
  slug: string;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
};

type ListenerEntry<E extends keyof Spotify.PlayerEventMap> = {
  event: E;
  callback: (payload: Spotify.PlayerEventMap[E]) => void;
};

export class PlaybackManager {
  private service: SpotifyServiceInstance | null = null;
  private options: PlaybackManagerOptions | null = null;
  private listeners: ListenerEntry<keyof Spotify.PlayerEventMap>[] = [];
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private lastTrackUri: string | null = null;

  start(
    service: SpotifyServiceInstance,
    options: PlaybackManagerOptions,
  ): void {
    this.stop();
    this.service = service;
    this.options = options;

    const onReady = ({ device_id }: Spotify.DeviceMessage) => {
      const state = normalizeReadyState(device_id);
      this.emitLocal(state);
      void this.syncStateToSupabase(state, "ready");
    };

    const onNotReady = () => {
      const state = normalizeIdleState();
      this.emitLocal(state);
      void this.syncStateToSupabase(state, "idle");
    };

    const onStateChanged = (playbackState: Spotify.PlaybackState | null) => {
      const deviceId = service.getDeviceId();
      const state = normalizeSpotifyPlaybackState(playbackState, deviceId);
      this.emitLocal(state);

      const trackChanged = state.trackUri !== this.lastTrackUri;
      if (trackChanged) {
        this.lastTrackUri = state.trackUri;
        this.flushSync(state);
        return;
      }

      this.scheduleSync(state);
    };

    const onError = (message: string) => {
      const deviceId = service.getDeviceId();
      const state = normalizeErrorState(deviceId, message);
      this.emitLocal(state);
      void this.syncStateToSupabase(state, "error");
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
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.service) {
      for (const { event, callback } of this.listeners) {
        this.service.player.removeListener(event, callback);
      }
    }

    this.listeners = [];
    this.service = null;
    this.options = null;
    this.lastTrackUri = null;
  }

  get active(): boolean {
    return this.service !== null;
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

  private emitLocal(state: NormalizedSpotifyPlayerState): void {
    this.options?.onLocalState(state);
  }

  private scheduleSync(state: NormalizedSpotifyPlayerState): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      const status = state.status ?? (state.paused ? "paused" : "playing");
      void this.syncStateToSupabase(state, status);
    }, SYNC_DEBOUNCE_MS);
  }

  private flushSync(state: NormalizedSpotifyPlayerState): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    const status = state.status ?? (state.paused ? "paused" : "playing");
    void this.syncStateToSupabase(state, status);
  }

  async syncStateToSupabase(
    state: NormalizedSpotifyPlayerState,
    status: PlaybackSessionStatus,
  ): Promise<void> {
    const slug = this.options?.slug;
    if (!slug) return;

    const body: PublishPlaybackSessionInput = {
      trackUri: state.trackUri,
      trackName: state.trackName,
      artistName: state.artistName,
      albumImageUrl: state.albumImageUrl ?? null,
      positionMs: state.positionMs,
      durationMs: state.durationMs,
      paused: state.paused,
      deviceId: state.deviceId,
      status,
      lastError: state.lastError ?? null,
    };

    try {
      await fetch(`/api/players/${encodeURIComponent(slug)}/playback/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // sync is best-effort; UI keeps local SDK state
    }
  }
}
