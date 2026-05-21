import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import { playbackDebug } from "../lib/playback-debug";
import { computeExpectedEndAt } from "../lib/expected-track-end";

/** Fire near-end callback this many ms before expected track end. */
export const NEAR_END_LEAD_MS = 10_000;

export type TrackEndSchedulerOptions = {
  onNearEnd: (state: NormalizedSpotifyPlayerState) => void;
};

export class TrackEndScheduler {
  private options: TrackEndSchedulerOptions | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private scheduledTrackUri: string | null = null;

  configure(options: TrackEndSchedulerOptions): void {
    this.options = options;
  }

  schedule(state: NormalizedSpotifyPlayerState): void {
    this.clearTimer();

    if (!state.trackUri || state.durationMs <= 0 || state.paused) {
      this.scheduledTrackUri = null;
      return;
    }

    const positionUpdatedAt = state.positionUpdatedAt ?? Date.now();
    const expectedEndAt = computeExpectedEndAt({
      positionUpdatedAt,
      positionMs: state.positionMs,
      durationMs: state.durationMs,
    });

    const nearEndAt =
      expectedEndAt.getTime() - NEAR_END_LEAD_MS - Date.now();
    if (nearEndAt <= 0) {
      this.fireNearEnd(state);
      return;
    }

    this.scheduledTrackUri = state.trackUri;
    playbackDebug("scheduler", "near_end_scheduled", {
      trackUri: state.trackUri,
      inMs: Math.round(nearEndAt),
    });

    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.scheduledTrackUri === state.trackUri) {
        this.fireNearEnd(state);
      }
    }, nearEndAt);
  }

  dispose(): void {
    this.clearTimer();
    this.options = null;
    this.scheduledTrackUri = null;
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private fireNearEnd(state: NormalizedSpotifyPlayerState): void {
    playbackDebug("scheduler", "near_end", { trackUri: state.trackUri });
    this.options?.onNearEnd(state);
  }
}
