import type {
  NormalizedSpotifyPlayerState,
  PlaybackSession,
} from "@muziks/types";

const CACHE_MS = 3500;
const INTERVAL_PLAYING_MS = 8_000;
const INTERVAL_PAUSED_MS = 25_000;
const INTERVAL_IDLE_MS = 45_000;
const MAX_BACKOFF_MULTIPLIER = 4;

export type SessionPlaybackPollerOptions = {
  slug: string;
  onState: (state: NormalizedSpotifyPlayerState) => void;
  onError?: (message: string) => void;
};

function sessionToNormalized(
  session: PlaybackSession,
): NormalizedSpotifyPlayerState {
  return {
    trackUri: session.currentTrackUri,
    trackName: session.trackName,
    artistName: session.artistName,
    albumImageUrl: session.albumImageUrl,
    positionMs: session.progressMs,
    positionUpdatedAt: Date.parse(session.updatedAt),
    durationMs: session.durationMs,
    paused: session.paused,
    deviceId: session.activeDeviceId,
    status: session.status,
    lastError: session.lastError,
  };
}

export class SessionPlaybackPoller {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private options: SessionPlaybackPollerOptions | null = null;
  private lastState: NormalizedSpotifyPlayerState | null = null;
  private lastFingerprint: string | null = null;
  private backoffMultiplier = 1;
  private cachedState: NormalizedSpotifyPlayerState | null = null;
  private cacheExpiresAt = 0;

  start(options: SessionPlaybackPollerOptions): void {
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
    if (!state || state.status === "idle") {
      return INTERVAL_IDLE_MS;
    }
    if (state.paused || state.status === "paused") {
      return INTERVAL_PAUSED_MS;
    }
    return INTERVAL_PLAYING_MS;
  }

  private fingerprint(state: NormalizedSpotifyPlayerState): string {
    return [
      state.trackUri ?? "",
      state.paused ? "1" : "0",
      state.status ?? "",
      state.deviceId ?? "",
    ].join("|");
  }

  private async fetchSessionState(): Promise<NormalizedSpotifyPlayerState | null> {
    const options = this.options;
    if (!options) return null;

    const now = Date.now();
    if (this.cachedState && now < this.cacheExpiresAt) {
      return this.cachedState;
    }

    const response = await fetch(
      `/api/players/${encodeURIComponent(options.slug)}/playback/session`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? "session_fetch_failed");
    }

    const session = (await response.json()) as PlaybackSession;
    const state = sessionToNormalized(session);
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
      const state = await this.fetchSessionState();
      if (!this.running || this.options !== options) {
        return;
      }

      if (!state) {
        options.onError?.("session_not_found");
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
