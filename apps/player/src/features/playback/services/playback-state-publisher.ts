import type {
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
  PlaybackSyncMode,
  PublishPlaybackSessionInput,
} from "@muziks/types";

const DEBOUNCE_MS = 800;
const PLAYING_POSITION_BUCKET_MS = 2000;
const PAUSED_POSITION_BUCKET_MS = 10000;

export type PlaybackStatePublisherOptions = {
  slug: string;
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

  ingest(state: NormalizedSpotifyPlayerState, status?: PlaybackSessionStatus): void {
    const resolved: NormalizedSpotifyPlayerState = {
      ...state,
      status: status ?? state.status,
    };

    this.emitLocal(resolved);

    const trackChanged = resolved.trackUri !== this.lastTrackUri;
    if (trackChanged && resolved.trackUri) {
      this.lastTrackUri = resolved.trackUri;
      this.options?.onTrackChanged?.(resolved);
      void this.flushPublish(resolved, status);
      return;
    }

    if (!shouldPublish(this.lastPublished, resolved)) {
      return;
    }

    this.schedulePublish(resolved, status);
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
  }
}
