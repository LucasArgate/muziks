import type { NormalizedSpotifyPlayerState } from "@muziks/types";

/** Slow reconcile — api_device / rate-limit friendly (ADR). */
const DEFAULT_PROFILE = {
  cacheMs: 3500,
  playingMs: 18_000,
  pausedMs: 35_000,
  idleMs: 35_000,
} as const;

/** Hybrid: phone / Connect controls — faster play/pause detection. */
const HYBRID_PROFILE = {
  cacheMs: 1200,
  playingMs: 3500,
  pausedMs: 3500,
  idleMs: 12_000,
} as const;

const FOLLOW_UP_AFTER_PLAY_STATE_MS = 1200;

export type SpotifyApiPollProfile = "default" | "hybrid";

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
  private followUpTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
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
    if (this.followUpTimer) {
      clearTimeout(this.followUpTimer);
      this.followUpTimer = null;
    }
    this.options = null;
    this.profile = "default";
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
    const p = this.profile === "hybrid" ? HYBRID_PROFILE : DEFAULT_PROFILE;
    if (!state || state.status === "idle") {
      return p.idleMs;
    }
    if (state.paused || state.status === "paused") {
      return p.pausedMs;
    }
    return p.playingMs;
  }

  private scheduleFollowUp(): void {
    if (this.profile !== "hybrid" || !this.running) {
      return;
    }
    if (this.followUpTimer) {
      clearTimeout(this.followUpTimer);
    }
    this.followUpTimer = setTimeout(() => {
      this.followUpTimer = null;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      void this.tick();
    }, FOLLOW_UP_AFTER_PLAY_STATE_MS);
  }

  private async fetchPlaybackState(): Promise<NormalizedSpotifyPlayerState> {
    const now = Date.now();
    const cacheMs =
      this.profile === "hybrid" ? HYBRID_PROFILE.cacheMs : DEFAULT_PROFILE.cacheMs;
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
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "spotify_playback_fetch_failed");
    }

    const body = (await response.json()) as {
      state: NormalizedSpotifyPlayerState;
    };

    const state = body.state;
    this.cachedState = state;
    this.cacheExpiresAt = now + cacheMs;
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

      const prevPaused = this.lastState?.paused;
      const fp = fingerprint(state);
      if (fp !== this.lastFingerprint) {
        this.lastFingerprint = fp;
        this.lastState = state;
        options.onState(state);
        if (prevPaused !== undefined && prevPaused !== state.paused) {
          this.scheduleFollowUp();
        }
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
