import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import {
  PLAYBACK_CLIENT_IDLE_POLL_MS,
  PLAYBACK_CLIENT_MAX_BACKOFF_MULTIPLIER,
  PLAYBACK_CLIENT_PAUSED_POLL_MS,
  PLAYBACK_CLIENT_PLAYING_POLL_MS,
} from "../domain/polling";

export type PlaybackStatePollerOptions = {
  fetchState: () => Promise<NormalizedSpotifyPlayerState | null>;
  onState: (state: NormalizedSpotifyPlayerState) => void;
  onError?: (message: string) => void;
};

function fingerprintClientPlaybackState(
  state: NormalizedSpotifyPlayerState,
): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
  ].join("|");
}

export class PlaybackStatePoller {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private options: PlaybackStatePollerOptions | null = null;
  private inFlight: Promise<void> | null = null;
  private lastState: NormalizedSpotifyPlayerState | null = null;
  private lastFingerprint: string | null = null;
  private backoffMultiplier = 1;

  start(options: PlaybackStatePollerOptions): void {
    if (this.running) {
      this.options = options;
      return;
    }

    this.stop();
    this.options = options;
    this.running = true;
    void this.refreshOnce().finally(() => this.scheduleNext());
  }

  stop(): void {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.options = null;
    this.inFlight = null;
    this.lastState = null;
    this.lastFingerprint = null;
    this.backoffMultiplier = 1;
  }

  async refreshOnce(): Promise<void> {
    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.tick().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  private scheduleNext(): void {
    if (!this.running) return;

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.timer = null;
      void this.refreshOnce().finally(() => this.scheduleNext());
    }, this.resolveIntervalMs() * this.backoffMultiplier);
  }

  private resolveIntervalMs(): number {
    const state = this.lastState;
    if (!state || state.status === "idle") {
      return PLAYBACK_CLIENT_IDLE_POLL_MS;
    }
    if (state.paused || state.status === "paused") {
      return PLAYBACK_CLIENT_PAUSED_POLL_MS;
    }
    return PLAYBACK_CLIENT_PLAYING_POLL_MS;
  }

  private async tick(): Promise<void> {
    const options = this.options;
    if (!this.running || !options) return;

    try {
      const state = await options.fetchState();
      if (!this.running || this.options !== options || !state) return;

      const fingerprint = fingerprintClientPlaybackState(state);
      if (fingerprint === this.lastFingerprint) {
        this.backoffMultiplier = Math.min(
          this.backoffMultiplier * 2,
          PLAYBACK_CLIENT_MAX_BACKOFF_MULTIPLIER,
        );
        return;
      }

      this.backoffMultiplier = 1;
      this.lastState = state;
      this.lastFingerprint = fingerprint;
      options.onState(state);
    } catch (error) {
      this.backoffMultiplier = Math.min(
        this.backoffMultiplier * 2,
        PLAYBACK_CLIENT_MAX_BACKOFF_MULTIPLIER,
      );
      options.onError?.(
        error instanceof Error ? error.message : "playback_poll_error",
      );
    }
  }
}
