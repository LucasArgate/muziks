import {
  getCurrentPlayback,
  normalizeApiPlaybackState,
} from "@muziks/spotify";
import type { NormalizedSpotifyPlayerState, PlaybackSyncMode } from "@muziks/types";

const CACHE_MS = 3500;

const INTERVAL_HYBRID_PLAYING_MS = 18_000;
const INTERVAL_HYBRID_PAUSED_MS = 35_000;
const INTERVAL_HYBRID_IDLE_MS = 60_000;

const INTERVAL_API_PLAYING_MS = 8_000;
const INTERVAL_API_PAUSED_MS = 25_000;
const INTERVAL_API_IDLE_MS = 45_000;

const MAX_BACKOFF_MULTIPLIER = 4;

export type ApiPlaybackPollerOptions = {
  syncMode?: PlaybackSyncMode;
  onState: (state: NormalizedSpotifyPlayerState) => void;
  onError?: (message: string) => void;
};

export class ApiPlaybackPoller {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private options: ApiPlaybackPollerOptions | null = null;
  private lastState: NormalizedSpotifyPlayerState | null = null;
  private lastFingerprint: string | null = null;
  private backoffMultiplier = 1;
  private cachedState: NormalizedSpotifyPlayerState | null = null;
  private cacheExpiresAt = 0;
  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  start(options: ApiPlaybackPollerOptions): void {
    this.stop();
    this.options = options;
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
    this.lastState = null;
    this.lastFingerprint = null;
    this.backoffMultiplier = 1;
    this.cachedState = null;
    this.cacheExpiresAt = 0;
    this.accessToken = null;
    this.tokenExpiresAt = 0;
  }

  async refreshOnce(): Promise<void> {
    if (!this.options) return;
    this.backoffMultiplier = 1;
    this.cacheExpiresAt = 0;
    await this.tick();
  }

  get active(): boolean {
    return this.running;
  }

  private scheduleNext(): void {
    if (!this.running) return;

    const interval = this.resolveInterval(this.lastState) * this.backoffMultiplier;
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.tick();
    }, interval);
  }

  private resolveInterval(state: NormalizedSpotifyPlayerState | null): number {
    const hybrid = this.options?.syncMode === "hybrid";
    if (!state || state.status === "idle") {
      return hybrid ? INTERVAL_HYBRID_IDLE_MS : INTERVAL_API_IDLE_MS;
    }
    if (state.paused || state.status === "paused") {
      return hybrid ? INTERVAL_HYBRID_PAUSED_MS : INTERVAL_API_PAUSED_MS;
    }
    return hybrid ? INTERVAL_HYBRID_PLAYING_MS : INTERVAL_API_PLAYING_MS;
  }

  private fingerprint(state: NormalizedSpotifyPlayerState): string {
    return [
      state.trackUri ?? "",
      state.paused ? "1" : "0",
      state.status ?? "",
      state.deviceId ?? "",
    ].join("|");
  }

  private async resolveAccessToken(): Promise<string | null> {
    if (this.accessToken && this.tokenExpiresAt > Date.now() + 30_000) {
      return this.accessToken;
    }

    const response = await fetch("/api/spotify/token");
    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { access_token?: string };
    if (!body.access_token) {
      return null;
    }

    this.accessToken = body.access_token;
    this.tokenExpiresAt = Date.now() + 3_500_000;
    return this.accessToken;
  }

  private async fetchPlaybackState(): Promise<NormalizedSpotifyPlayerState | null> {
    const now = Date.now();
    if (this.cachedState && now < this.cacheExpiresAt) {
      return this.cachedState;
    }

    const accessToken = await this.resolveAccessToken();
    if (!accessToken) {
      return null;
    }

    const raw = await getCurrentPlayback({ accessToken });
    const state = normalizeApiPlaybackState(raw);
    this.cachedState = state;
    this.cacheExpiresAt = now + CACHE_MS;
    return state;
  }

  private async tick(): Promise<void> {
    if (!this.running || !this.options) return;

    try {
      const state = await this.fetchPlaybackState();
      if (!state) {
        this.options.onError?.("spotify_not_connected");
        this.scheduleNext();
        return;
      }

      const fp = this.fingerprint(state);
      if (fp === this.lastFingerprint) {
        this.backoffMultiplier = Math.min(
          this.backoffMultiplier * 2,
          MAX_BACKOFF_MULTIPLIER,
        );
      } else {
        this.backoffMultiplier = 1;
        this.lastFingerprint = fp;
        this.lastState = state;
        this.options.onState(state);
      }
    } catch (error) {
      this.options.onError?.(
        error instanceof Error ? error.message : "poll_error",
      );
    }

    this.scheduleNext();
  }
}
