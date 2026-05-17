import type {
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
  PlaybackSyncMode,
  PublishPlaybackSessionInput,
} from "@muziks/types";

import { broadcastSessionSnapshot } from "@/src/lib/realtime/player-session-channel";

import {
  mergeApiOverSdk,
  type PlaybackStateSource,
  statesDiverge,
} from "./playback-state-merge";

const DEBOUNCE_MS = 800;
const PLAYING_POSITION_BUCKET_MS = 5000;
const PAUSED_POSITION_BUCKET_MS = 10000;

export type PlaybackStatePublisherOptions = {
  slug: string;
  playerId?: string | null;
  syncMode: PlaybackSyncMode;
  preferredDeviceId?: string | null;
  activeDeviceName?: string | null;
  stateVersion?: number;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
  onStateVersion?: (version: number) => void;
  onTrackChanged?: (state: NormalizedSpotifyPlayerState) => void;
};

function positionBucket(ms: number, paused: boolean): number {
  const bucket = paused ? PAUSED_POSITION_BUCKET_MS : PLAYING_POSITION_BUCKET_MS;
  return Math.floor(ms / bucket);
}

function fingerprint(state: NormalizedSpotifyPlayerState): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
    positionBucket(state.positionMs, state.paused),
  ].join("|");
}

export function shouldPublish(
  prev: NormalizedSpotifyPlayerState | null,
  next: NormalizedSpotifyPlayerState,
): boolean {
  if (!prev) return true;
  if (prev.trackUri !== next.trackUri) return true;
  if (prev.paused !== next.paused) return true;
  if (prev.status !== next.status) return true;
  if (prev.deviceId !== next.deviceId) return true;
  return positionBucket(prev.positionMs, prev.paused) !==
    positionBucket(next.positionMs, next.paused);
}

export class PlaybackStatePublisher {
  private options: PlaybackStatePublisherOptions | null = null;
  private lastPublished: NormalizedSpotifyPlayerState | null = null;
  private lastFingerprint: string | null = null;
  private lastTrackUri: string | null = null;
  private lastSdkState: NormalizedSpotifyPlayerState | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private stateVersion = 0;

  configure(options: PlaybackStatePublisherOptions): void {
    this.options = options;
    this.stateVersion = options.stateVersion ?? 0;
  }

  get currentStateVersion(): number {
    return this.stateVersion;
  }

  setStateVersion(version: number): void {
    this.stateVersion = version;
  }

  emitLocal(state: NormalizedSpotifyPlayerState): void {
    this.options?.onLocalState(state);
  }

  ingest(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
    source: PlaybackStateSource = "sdk",
  ): void {
    const resolved: NormalizedSpotifyPlayerState = {
      ...state,
      status: status ?? state.status,
    };

    if (source === "sdk") {
      this.lastSdkState = resolved;
      this.ingestSdk(resolved, status);
      return;
    }

    this.ingestApi(resolved, status);
  }

  private ingestSdk(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
  ): void {
    this.emitLocal(state);

    const trackChanged = state.trackUri !== this.lastTrackUri;
    if (trackChanged && state.trackUri) {
      this.lastTrackUri = state.trackUri;
      this.options?.onTrackChanged?.(state);
      void this.flushPublish(state, status);
      return;
    }

    if (!shouldPublish(this.lastPublished, state)) {
      return;
    }

    this.schedulePublish(state, status);
  }

  private ingestApi(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
  ): void {
    const mode = this.options?.syncMode ?? "api_device";
    const diverged = statesDiverge(this.lastSdkState, state);

    if (mode === "hybrid" && !diverged) {
      return;
    }

    const display = mergeApiOverSdk(this.lastSdkState, state);
    this.emitLocal(display);

    const trackChanged = display.trackUri !== this.lastTrackUri;
    if (trackChanged && display.trackUri) {
      this.lastTrackUri = display.trackUri;
      this.options?.onTrackChanged?.(display);
      void this.flushPublish(display, status);
      return;
    }

    if (!shouldPublish(this.lastPublished, display)) {
      return;
    }

    if (diverged) {
      void this.flushPublish(display, status);
      return;
    }

    this.schedulePublish(display, status);
  }

  private schedulePublish(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
  ): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flushPublish(state, status);
    }, DEBOUNCE_MS);
  }

  private async flushPublish(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
  ): Promise<void> {
    const fp = fingerprint(state);
    if (fp === this.lastFingerprint) {
      return;
    }

    const slug = this.options?.slug;
    if (!slug) return;

    const resolvedStatus =
      status ?? state.status ?? (state.paused ? "paused" : "playing");

    const body: PublishPlaybackSessionInput = {
      trackUri: state.trackUri,
      trackName: state.trackName,
      artistName: state.artistName,
      albumImageUrl: state.albumImageUrl ?? null,
      positionMs: state.positionMs,
      durationMs: state.durationMs,
      paused: state.paused,
      deviceId: state.deviceId,
      status: resolvedStatus,
      lastError: state.lastError ?? null,
      syncMode: this.options?.syncMode,
      preferredDeviceId: this.options?.preferredDeviceId ?? null,
      activeDeviceName: this.options?.activeDeviceName ?? null,
      stateVersion: this.stateVersion,
    };

    try {
      const response = await fetch(
        `/api/players/${encodeURIComponent(slug)}/playback/session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) return;

      const session = (await response.json()) as {
        stateVersion: number;
        accepted?: boolean;
      };

      if (session.stateVersion !== undefined) {
        this.stateVersion = session.stateVersion;
        this.options?.onStateVersion?.(session.stateVersion);
      }

      this.lastPublished = state;
      this.lastFingerprint = fp;

      const playerId = this.options?.playerId;
      if (playerId && session.accepted !== false) {
        void broadcastSessionSnapshot(playerId, {
          playback: state,
          stateVersion: this.stateVersion,
        });
      }
    } catch {
      // best-effort sync
    }
  }

  dispose(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.options = null;
    this.lastPublished = null;
    this.lastFingerprint = null;
    this.lastTrackUri = null;
    this.lastSdkState = null;
  }
}
