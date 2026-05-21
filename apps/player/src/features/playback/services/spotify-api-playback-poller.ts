import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import { parseJsonResponse } from "../lib/parse-json-response";

/** Slow reconcile — api_device / rate-limit friendly (ADR). */
const DEFAULT_PROFILE = {
  cacheMs: 3500,
  playingMs: 18_000,
  pausedMs: 35_000,
  idleMs: 35_000,
} as const;

/** External device / visibility reconcile only (no UI hot path). */
const RECONCILE_PROFILE = {
  cacheMs: 0,
  playingMs: 45_000,
  pausedMs: 45_000,
  idleMs: 60_000,
} as const;

export type SpotifyApiPollProfile = "default" | "reconcile";

export type SpotifyApiPlaybackPollerOptions = {
  profile?: SpotifyApiPollProfile;
  onState: (state: NormalizedSpotifyPlayerState) => void;
  onError?: (message: string) => void;
};

function fingerprint(state: NormalizedSpotifyPlayerState): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
  ].join("|");
}

export class SpotifyApiPlaybackPoller {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private tickInFlight = false;
  private options: SpotifyApiPlaybackPollerOptions | null = null;
  private profile: SpotifyApiPollProfile = "default";
  private lastFingerprint: string | null = null;
  private lastState: NormalizedSpotifyPlayerState | null = null;
  private cachedState: NormalizedSpotifyPlayerState | null = null;
  private cacheExpiresAt = 0;

  start(options: SpotifyApiPlaybackPollerOptions): void {
    this.stop();
    this.options = options;
    this.profile = options.profile ?? "default";
    this.running = true;
    void this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.options = null;
    this.profile = "default";
    this.lastFingerprint = null;
    this.lastState = null;
    this.cachedState = null;
    this.cacheExpiresAt = 0;
  }

  /**
   * Single GET without starting the interval loop (hybrid reconcile / hydration).
   */
  async fetchOnce(
    options: SpotifyApiPlaybackPollerOptions,
    profile: SpotifyApiPollProfile = "reconcile",
  ): Promise<NormalizedSpotifyPlayerState | null> {
    const prevOptions = this.options;
    const prevProfile = this.profile;
    this.options = options;
    this.profile = profile;
    this.cacheExpiresAt = 0;
    try {
      return await this.fetchPlaybackState();
    } catch (error) {
      options.onError?.(
        error instanceof Error ? error.message : "poll_error",
      );
      return null;
    } finally {
      this.options = prevOptions;
      this.profile = prevProfile;
    }
  }

  async refreshOnce(): Promise<void> {
    if (!this.options) return;
    this.cacheExpiresAt = 0;
    await this.tick();
  }

  get active(): boolean {
    return this.running;
  }

  private scheduleNext(): void {
    if (!this.running) return;

    const interval = this.resolveInterval(this.lastState);
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.tick();
    }, interval);
  }

  private resolveInterval(state: NormalizedSpotifyPlayerState | null): number {
    const p = this.profile === "reconcile" ? RECONCILE_PROFILE : DEFAULT_PROFILE;
    if (!state || state.status === "idle") {
      return p.idleMs;
    }
    if (state.paused || state.status === "paused") {
      return p.pausedMs;
    }
    return p.playingMs;
  }

  private async fetchPlaybackState(): Promise<NormalizedSpotifyPlayerState> {
    const now = Date.now();
    const cacheMs =
      this.profile === "reconcile"
        ? RECONCILE_PROFILE.cacheMs
        : DEFAULT_PROFILE.cacheMs;
    if (this.cachedState && now < this.cacheExpiresAt) {
      return this.cachedState;
    }

    const response = await fetch("/api/spotify/playback/state");

    if (response.status === 401) {
      const idle: NormalizedSpotifyPlayerState = {
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
      this.cachedState = idle;
      this.cacheExpiresAt = now + cacheMs;
      return idle;
    }

    if (!response.ok) {
      const body = await parseJsonResponse<{ error?: string }>(response);
      throw new Error(body?.error ?? "spotify_playback_fetch_failed");
    }

    const body = await parseJsonResponse<{
      state: NormalizedSpotifyPlayerState;
    }>(response);

    if (!body?.state) {
      throw new Error("spotify_playback_fetch_failed");
    }

    const state = body.state;
    this.cachedState = state;
    this.cacheExpiresAt = now + cacheMs;
    return state;
  }

  private async tick(): Promise<void> {
    const options = this.options;
    if (!this.running || !options || this.tickInFlight) {
      return;
    }

    this.tickInFlight = true;
    try {
      const state = await this.fetchPlaybackState();
      if (!this.running || this.options !== options) {
        return;
      }

      const fp = fingerprint(state);
      if (fp !== this.lastFingerprint) {
        this.lastFingerprint = fp;
        this.lastState = state;
        options.onState(state);
      }
    } catch (error) {
      if (this.running && this.options === options) {
        options.onError?.(
          error instanceof Error ? error.message : "poll_error",
        );
      }
    } finally {
      this.tickInFlight = false;
    }

    if (this.running && this.options === options) {
      this.scheduleNext();
    }
  }
}
