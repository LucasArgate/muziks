import type {
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
  PlaybackSyncMode,
  PublishPlaybackSessionInput,
} from "@muziks/types";

import { broadcastSessionSnapshot } from "@/src/lib/realtime/player-session-channel";

import {
  mergeApiOverSdk,
  preferSdkProgressInHybrid,
  type PlaybackStateSource,
  shouldSdkSuppressLocalDisplay,
  statesDiverge,
} from "./playback-state-merge";

const DEBOUNCE_MS = 800;
const PLAYING_POSITION_BUCKET_MS = 5000;
const PAUSED_POSITION_BUCKET_MS = 10000;

function logPlaybackPublisherDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "cc732b",
    },
    body: JSON.stringify({
      sessionId: "cc732b",
      runId: "initial",
      hypothesisId,
      location:
        "apps/player/src/features/playback/services/playback-state-publisher.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export type PublishRemoteMode = "off" | "minimal" | "full";

export type PlaybackStatePublisherOptions = {
  slug: string;
  playerId?: string | null;
  browserInstanceId?: string | null;
  syncMode: PlaybackSyncMode;
  preferredDeviceId?: string | null;
  activeDeviceName?: string | null;
  stateVersion?: number;
  /** Master default: semantic-only POST + broadcast (no progress buckets). */
  publishRemote?: PublishRemoteMode;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
  onStateVersion?: (version: number) => void;
  onTrackChanged?: (state: NormalizedSpotifyPlayerState) => void;
};

function positionBucket(ms: number, paused: boolean): number {
  const bucket = paused ? PAUSED_POSITION_BUCKET_MS : PLAYING_POSITION_BUCKET_MS;
  return Math.floor(ms / bucket);
}

function fingerprintFull(state: NormalizedSpotifyPlayerState): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
    positionBucket(state.positionMs, state.paused),
  ].join("|");
}

function fingerprintSemantic(state: NormalizedSpotifyPlayerState): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
  ].join("|");
}

function fingerprintForMode(
  state: NormalizedSpotifyPlayerState,
  mode: PublishRemoteMode,
): string {
  return mode === "full" ? fingerprintFull(state) : fingerprintSemantic(state);
}

export function shouldPublishRemote(
  prev: NormalizedSpotifyPlayerState | null,
  next: NormalizedSpotifyPlayerState,
  mode: PublishRemoteMode,
): boolean {
  if (mode === "off") return false;
  if (!prev) return true;
  if (prev.trackUri !== next.trackUri) return true;
  if (prev.paused !== next.paused) return true;
  if (prev.status !== next.status) return true;
  if (prev.deviceId !== next.deviceId) return true;
  if (mode === "minimal") return false;
  return positionBucket(prev.positionMs, prev.paused) !==
    positionBucket(next.positionMs, next.paused);
}

/** @deprecated Use shouldPublishRemote with explicit mode. */
export function shouldPublish(
  prev: NormalizedSpotifyPlayerState | null,
  next: NormalizedSpotifyPlayerState,
): boolean {
  return shouldPublishRemote(prev, next, "full");
}

export class PlaybackStatePublisher {
  private options: PlaybackStatePublisherOptions | null = null;
  private lastPublished: NormalizedSpotifyPlayerState | null = null;
  private lastFingerprint: string | null = null;
  private lastTrackUri: string | null = null;
  private lastSdkState: NormalizedSpotifyPlayerState | null = null;
  private lastApiState: NormalizedSpotifyPlayerState | null = null;
  private lastBridgeState: NormalizedSpotifyPlayerState | null = null;
  private bridgeActive = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private stateVersion = 0;

  configure(options: PlaybackStatePublisherOptions): void {
    this.options = options;
    this.stateVersion = options.stateVersion ?? 0;
  }

  get currentStateVersion(): number {
    return this.stateVersion;
  }

  /** Last normalized state from Web API poll (authoritative in hybrid). */
  get apiPlaybackState(): NormalizedSpotifyPlayerState | null {
    return this.lastApiState;
  }

  /** Device id for Web API play/pause/skip (API state, then preferred Connect device). */
  get activeControlDeviceId(): string | null {
    const mode = this.options?.syncMode ?? "hybrid";
    if (mode === "api_device") {
      return this.options?.preferredDeviceId ?? this.lastApiState?.deviceId ?? null;
    }
    return this.lastApiState?.deviceId ?? this.lastSdkState?.deviceId ?? null;
  }

  setStateVersion(version: number): void {
    this.stateVersion = version;
  }

  /** When true, bridge snapshots take priority over SDK and API ingest. */
  setBridgeActive(active: boolean): void {
    this.bridgeActive = active;
    if (!active) {
      this.lastBridgeState = null;
    }
  }

  emitLocal(state: NormalizedSpotifyPlayerState): void {
    this.options?.onLocalState(state);
  }

  applySyncedSnapshot(state: NormalizedSpotifyPlayerState): void {
    this.lastApiState = state;
    this.lastPublished = state;
    this.lastFingerprint = fingerprintForMode(
      state,
      this.options?.publishRemote ?? "minimal",
    );
    this.lastTrackUri = state.trackUri;
    this.emitLocal(state);
  }

  publishBrowserHeartbeat(): void {
    if (!this.lastSdkState) {
      return;
    }
    void this.flushPublish(
      this.lastSdkState,
      this.lastSdkState.status,
      "sdk",
      true,
    );
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

    if (source === "bridge") {
      this.lastBridgeState = resolved;
      this.ingestBridge(resolved, status);
      return;
    }

    if (source === "api") {
      this.ingestApi(resolved, status);
      return;
    }

    if (
      this.bridgeActive &&
      this.lastBridgeState &&
      statesDiverge(resolved, this.lastBridgeState)
    ) {
      return;
    }

    this.lastSdkState = resolved;
    this.ingestSdk(resolved, status);
  }

  private ingestBridge(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
  ): void {
    this.emitLocal(state);
    this.publishIfNeeded(state, status, "bridge");
  }

  private ingestSdk(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
  ): void {
    const mode = this.options?.syncMode ?? "hybrid";
    logPlaybackPublisherDebug("H4", "publisher sdk ingest", {
      mode,
      status: status ?? state.status ?? null,
      sdkDeviceId: state.deviceId,
      apiDeviceId: this.lastApiState?.deviceId ?? null,
      preferredDeviceId: this.options?.preferredDeviceId ?? null,
      activeDeviceName: this.options?.activeDeviceName ?? null,
      suppressed: shouldSdkSuppressLocalDisplay(mode, state, this.lastApiState),
    });
    if (shouldSdkSuppressLocalDisplay(mode, state, this.lastApiState)) {
      return;
    }

    this.emitLocal(state);
    this.publishIfNeeded(state, status, "sdk");
  }

  private publishIfNeeded(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
    source: PlaybackStateSource = "sdk",
  ): void {
    const remoteMode = this.options?.publishRemote ?? "minimal";
    if (remoteMode === "off") {
      return;
    }

    const trackChanged = state.trackUri !== this.lastTrackUri;
    if (trackChanged && state.trackUri) {
      this.lastTrackUri = state.trackUri;
      this.options?.onTrackChanged?.(state);
      void this.flushPublish(state, status, source);
      return;
    }

    if (!shouldPublishRemote(this.lastPublished, state, remoteMode)) {
      return;
    }

    this.schedulePublish(state, status, source);
  }

  private ingestApi(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
  ): void {
    if (this.bridgeActive && this.lastBridgeState) {
      return;
    }

    this.lastApiState = state;

    const mode = this.options?.syncMode ?? "api_device";
    const diverged = statesDiverge(this.lastSdkState, state);
    logPlaybackPublisherDebug("H4", "publisher api ingest", {
      mode,
      status: status ?? state.status ?? null,
      apiDeviceId: state.deviceId,
      sdkDeviceId: this.lastSdkState?.deviceId ?? null,
      preferredDeviceId: this.options?.preferredDeviceId ?? null,
      activeDeviceName: this.options?.activeDeviceName ?? null,
      diverged,
    });

    if (mode === "hybrid" && !diverged) {
      return;
    }

    let display = mergeApiOverSdk(this.lastSdkState, state);
    if (mode === "hybrid") {
      display = preferSdkProgressInHybrid(this.lastSdkState, display);
    }
    this.emitLocal(display);

    const trackChanged = display.trackUri !== this.lastTrackUri;
    if (trackChanged && display.trackUri) {
      this.lastTrackUri = display.trackUri;
      this.options?.onTrackChanged?.(display);
      void this.flushPublish(display, status, "api");
      return;
    }

    const remoteMode = this.options?.publishRemote ?? "minimal";
    if (remoteMode === "off") {
      return;
    }

    if (!shouldPublishRemote(this.lastPublished, display, remoteMode)) {
      return;
    }

    if (diverged) {
      void this.flushPublish(display, status, "api");
      return;
    }

    this.schedulePublish(display, status, "api");
  }

  private schedulePublish(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
    source: PlaybackStateSource = "sdk",
  ): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      void this.flushPublish(state, status, source);
    }, DEBOUNCE_MS);
  }

  private async flushPublish(
    state: NormalizedSpotifyPlayerState,
    status?: PlaybackSessionStatus,
    source: PlaybackStateSource = "sdk",
    force = false,
  ): Promise<void> {
    const remoteMode = this.options?.publishRemote ?? "minimal";
    if (remoteMode === "off") {
      return;
    }

    const fp = fingerprintForMode(state, remoteMode);
    if (!force && fp === this.lastFingerprint) {
      return;
    }

    const slug = this.options?.slug;
    if (!slug) return;

    const resolvedStatus =
      status ?? state.status ?? (state.paused ? "paused" : "playing");
    const nowIso = new Date().toISOString();
    const browserVisibility =
      typeof document === "undefined"
        ? "unknown"
        : document.visibilityState === "hidden"
          ? "hidden"
          : "visible";
    const stateSource =
      source === "sdk"
        ? "sdk_browser"
        : source === "api"
          ? "browser_api"
          : "bridge";
    const authority = source === "bridge" ? "bridge" : "browser";
    const browserLastSeenAt = authority === "browser" ? nowIso : null;

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
      stateSource,
      authority,
      sdkDeviceId: this.lastSdkState?.deviceId ?? null,
      browserInstanceId: this.options?.browserInstanceId ?? null,
      browserVisibility,
      browserLastSeenAt,
      sourceUpdatedAt: nowIso,
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
          stateSource,
          authority,
          sourceUpdatedAt: nowIso,
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
    this.lastApiState = null;
    this.lastBridgeState = null;
    this.bridgeActive = false;
  }
}
