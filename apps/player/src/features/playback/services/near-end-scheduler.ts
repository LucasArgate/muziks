import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import { mirrorNextOnSpotifyQueue } from "./queue-mirror-service";

export const PRELOAD_MS = 10_000;

export class NearEndScheduler {
  private scheduledForTrackUri: string | null = null;
  private inFlight = false;

  reset(): void {
    this.scheduledForTrackUri = null;
    this.inFlight = false;
  }

  onTrackChanged(nextTrackUri: string | null): void {
    if (nextTrackUri !== this.scheduledForTrackUri) {
      this.scheduledForTrackUri = null;
      this.inFlight = false;
    }
  }

  async maybeMirrorNext(input: {
    slug: string;
    state: NormalizedSpotifyPlayerState;
    deviceId?: string | null;
  }): Promise<void> {
    const { state, slug } = input;
    if (state.paused || !state.trackUri || state.durationMs <= 0) {
      return;
    }

    const positionUpdatedAt = state.positionUpdatedAt ?? Date.now();
    const livePositionMs = state.paused
      ? state.positionMs
      : Math.min(
          state.positionMs +
            Math.max(0, Date.now() - positionUpdatedAt),
          state.durationMs,
        );
    const timeLeft = state.durationMs - livePositionMs;

    if (timeLeft <= 0 || timeLeft > PRELOAD_MS) {
      return;
    }

    if (this.scheduledForTrackUri === state.trackUri || this.inFlight) {
      return;
    }

    this.scheduledForTrackUri = state.trackUri;
    this.inFlight = true;

    try {
      await mirrorNextOnSpotifyQueue(slug, {
        deviceId: input.deviceId ?? state.deviceId,
        currentTrackUri: state.trackUri,
      });
    } finally {
      this.inFlight = false;
    }
  }
}
