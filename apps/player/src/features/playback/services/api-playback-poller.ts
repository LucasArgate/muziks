import type { NormalizedSpotifyPlayerState } from "@muziks/types";

const INTERVAL_PLAYING_MS = 5000;
const INTERVAL_PAUSED_MS = 20000;
const INTERVAL_IDLE_MS = 30000;

export type ApiPlaybackPollerOptions = {
  onState: (state: NormalizedSpotifyPlayerState) => void;
  onError?: (message: string) => void;
};

export class ApiPlaybackPoller {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  private options: ApiPlaybackPollerOptions | null = null;
  private lastState: NormalizedSpotifyPlayerState | null = null;

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
  }

  async refreshOnce(): Promise<void> {
    if (!this.options) return;
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
    if (!state || state.status === "idle") return INTERVAL_IDLE_MS;
    if (state.paused || state.status === "paused") return INTERVAL_PAUSED_MS;
    return INTERVAL_PLAYING_MS;
  }

  private async tick(): Promise<void> {
    if (!this.running || !this.options) return;

    try {
      const response = await fetch("/api/spotify/playback/state");
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        this.options.onError?.(body.error ?? `http_${response.status}`);
        this.scheduleNext();
        return;
      }

      const body = (await response.json()) as {
        state: NormalizedSpotifyPlayerState;
      };
      this.lastState = body.state;
      this.options.onState(body.state);
    } catch (error) {
      this.options.onError?.(
        error instanceof Error ? error.message : "poll_error",
      );
    }

    this.scheduleNext();
  }
}
