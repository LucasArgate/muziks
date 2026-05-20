import type { NormalizedSpotifyPlayerState } from "@muziks/types";

const CACHE_MS = 3500;
const INTERVAL_PLAYING_MS = 18_000;
const INTERVAL_PAUSED_MS = 35_000;
const INTERVAL_IDLE_MS = 35_000;

export type SpotifyApiPlaybackPollerOptions = {
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
  private options: SpotifyApiPlaybackPollerOptions | null = null;
  private lastFingerprint: string | null = null;
  private lastState: NormalizedSpotifyPlayerState | null = null;
  private cachedState: NormalizedSpotifyPlayerState | null = null;
  private cacheExpiresAt = 0;

  start(options: SpotifyApiPlaybackPollerOptions): void {
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
    this.lastFingerprint = null;
    this.lastState = null;
    this.cachedState = null;
    this.cacheExpiresAt = 0;
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
    if (!state || state.status === "idle") {
      return INTERVAL_IDLE_MS;
    }
    if (state.paused || state.status === "paused") {
      return INTERVAL_PAUSED_MS;
    }
    return INTERVAL_PLAYING_MS;
  }

  private async fetchPlaybackState(): Promise<NormalizedSpotifyPlayerState> {
    const now = Date.now();
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
      this.cacheExpiresAt = now + CACHE_MS;
      return idle;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "spotify_playback_fetch_failed");
    }

    const body = (await response.json()) as {
      state: NormalizedSpotifyPlayerState;
    };

    const state = body.state;
    this.cachedState = state;
    this.cacheExpiresAt = now + CACHE_MS;
    return state;
  }

  private async tick(): Promise<void> {
    const options = this.options;
    if (!this.running || !options) {
      return;
    }

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
    }

    if (this.running && this.options === options) {
      this.scheduleNext();
    }
  }
}
