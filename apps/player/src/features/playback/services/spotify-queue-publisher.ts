import type {
  NormalizedSpotifyPlaybackQueue,
  SpotifyQueueSnapshotSource,
} from "@muziks/types";
import { fingerprintSpotifyQueue } from "@muziks/playback/client";

import { broadcastSpotifyQueueSnapshot } from "@/src/lib/realtime/player-session-channel";

const DEBOUNCE_MS = 800;

export type SpotifyQueuePublisherOptions = {
  playerId: string | null | undefined;
  source: SpotifyQueueSnapshotSource;
  getStateVersion?: () => number;
};

export class SpotifyQueuePublisher {
  private options: SpotifyQueuePublisherOptions | null = null;
  private queueVersion = 0;
  private lastFingerprint: string | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingQueue: NormalizedSpotifyPlaybackQueue | null = null;

  configure(options: SpotifyQueuePublisherOptions): void {
    this.options = options;
  }

  dispose(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingQueue = null;
    this.options = null;
    this.lastFingerprint = null;
  }

  ingest(queue: NormalizedSpotifyPlaybackQueue | null): void {
    if (!queue || !this.options?.playerId) {
      return;
    }

    const fingerprint = fingerprintSpotifyQueue(queue);
    if (fingerprint === this.lastFingerprint) {
      return;
    }

    this.pendingQueue = queue;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flush();
    }, DEBOUNCE_MS);
  }

  private async flush(): Promise<void> {
    const options = this.options;
    const queue = this.pendingQueue;
    if (!options?.playerId || !queue) {
      return;
    }

    const fingerprint = fingerprintSpotifyQueue(queue);
    if (fingerprint === this.lastFingerprint) {
      this.pendingQueue = null;
      return;
    }

    this.lastFingerprint = fingerprint;
    this.pendingQueue = null;
    this.queueVersion += 1;

    const stateVersion = options.getStateVersion?.() ?? undefined;

    await broadcastSpotifyQueueSnapshot(options.playerId, {
      queue,
      queueVersion: this.queueVersion,
      stateVersion,
      source: options.source,
    });
  }
}
