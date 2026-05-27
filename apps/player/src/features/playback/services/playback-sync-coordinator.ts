import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";
import { PlaybackStatePoller } from "@muziks/playback/client";
import { sendAgentDebugLog } from "@muziks/utils";

import { playbackDebug } from "../lib/playback-debug";
import type { SdkPlaybackEvent } from "../lib/sdk-events";
import {
  PlaybackStatePublisher,
  type PublishRemoteMode,
} from "./playback-state-publisher";
import { NearEndScheduler } from "./near-end-scheduler";
import { SdkPlaybackSource } from "./sdk-playback-source";
import type { SpotifyServiceInstance } from "./SpotifyService";
import { dequeueAfterTrackChange } from "./playback-queue-transition-client";

function normalizeRuntimeSyncMode(mode: PlaybackSyncMode | null | undefined): PlaybackSyncMode {
  return mode === "sdk" ? "sdk" : "api_device";
}

export type PlaybackSyncCoordinatorOptions = {
  slug: string;
  playerId?: string | null;
  browserInstanceId?: string | null;
  sessionMeta: PlayerMasterSessionMeta | null;
  publishRemote?: PublishRemoteMode;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
  onSdkQueue?: (queue: NormalizedSpotifyPlaybackQueue | null) => void;
  onStateVersion?: (version: number) => void;
  onTrackChanged?: (state: NormalizedSpotifyPlayerState) => void;
  onActiveDeviceName?: (deviceName: string | null) => void;
  onPollError?: (message: string) => void;
  onSdkEvent?: (event: SdkPlaybackEvent) => void;
};

/**
 * Orchestrates SDK, Web API poll, and (future) bridge WS snapshots.
 * Bridge ingest: call `applyBridgeState` when `apps/spotify-bridge` pushes state.
 */
export class PlaybackSyncCoordinator {
  private options: PlaybackSyncCoordinatorOptions | null = null;
  private syncMode: PlaybackSyncMode = "api_device";
  private preferredDeviceId: string | null = null;
  private activeDeviceName: string | null = null;

  private readonly publisher = new PlaybackStatePublisher();
  private readonly nearEndScheduler = new NearEndScheduler();
  private readonly sdkSource = new SdkPlaybackSource();
  private readonly apiPoller = new PlaybackStatePoller();
  private lastTrackUri: string | null = null;
  private sdkService: SpotifyServiceInstance | null = null;
  private apiPolling = false;
  private latestApiActiveDeviceName: string | null = null;

  configure(options: PlaybackSyncCoordinatorOptions): void {
    this.options = options;
    if (options.sessionMeta) {
      this.syncMode = normalizeRuntimeSyncMode(options.sessionMeta.syncMode);
      this.preferredDeviceId = options.sessionMeta.preferredDeviceId;
      this.activeDeviceName = options.sessionMeta.activeDeviceName;
      this.publisher.setStateVersion(options.sessionMeta.stateVersion);
    }
    playbackDebug("coordinator", "configure", {
      syncMode: this.syncMode,
      preferredDeviceId: this.preferredDeviceId,
      hasSdkService: Boolean(this.sdkService),
    });
    this.refreshPublisherConfig();
    this.reconcileSources();
  }

  get mode(): PlaybackSyncMode {
    return this.syncMode;
  }

  get preferredDevice(): string | null {
    return this.preferredDeviceId;
  }

  get requiresDeviceSelection(): boolean {
    return this.syncMode === "api_device" && !this.preferredDeviceId;
  }

  setSyncMode(mode: PlaybackSyncMode): void {
    this.syncMode = normalizeRuntimeSyncMode(mode);
    playbackDebug("coordinator", "sync-mode:set", { syncMode: this.syncMode });
    this.refreshPublisherConfig();
    this.reconcileSources();
  }

  setPreferredDevice(deviceId: string, deviceName: string): void {
    this.preferredDeviceId = deviceId;
    this.activeDeviceName = deviceName;
    playbackDebug("coordinator", "preferred-device:set", {
      deviceId,
      deviceName,
    });
    this.refreshPublisherConfig();
    this.reconcileSources();
  }

  /** Future: enable when bridge WS session is connected. */
  setBridgeActive(active: boolean): void {
    this.publisher.setBridgeActive(active);
  }

  private async onPlaybackState(
    state: NormalizedSpotifyPlayerState,
    deviceId?: string | null,
  ): Promise<void> {
    const slug = this.options?.slug;
    const previousTrackUri = this.lastTrackUri;

    if (state.trackUri && state.trackUri !== previousTrackUri) {
      this.nearEndScheduler.onTrackChanged(state.trackUri);
      if (previousTrackUri && slug) {
        void dequeueAfterTrackChange(slug);
      }
      this.lastTrackUri = state.trackUri;
    }

    if (slug) {
      void this.nearEndScheduler.maybeMirrorNext({
        slug,
        state,
        deviceId: deviceId ?? state.deviceId,
      });
    }
  }

  applyApiState(
    state: NormalizedSpotifyPlayerState,
    activeDeviceName?: string | null,
  ): void {
    if (activeDeviceName !== undefined) {
      this.activeDeviceName = activeDeviceName;
      this.options?.onActiveDeviceName?.(activeDeviceName);
      this.refreshPublisherConfig();
    }
    const status = state.status ?? (state.paused ? "paused" : "playing");
    this.publisher.ingest(state, status, "api");
    void this.onPlaybackState(state, state.deviceId);
  }

  applySyncedSessionState(state: NormalizedSpotifyPlayerState): void {
    this.publisher.applySyncedSnapshot(state);
  }

  /** Future: called by bridge WS client when librespot reports playback. */
  applyBridgeState(state: NormalizedSpotifyPlayerState): void {
    const status = state.status ?? (state.paused ? "paused" : "playing");
    this.publisher.ingest(state, status, "bridge");
  }

  publishBrowserHeartbeat(): void {
    this.publisher.publishBrowserHeartbeat();
  }

  startSessionPolling(): void {
    this.startApiPolling();
  }

  startApiPolling(): void {
    playbackDebug("coordinator", "api-poll:start", {
      syncMode: this.syncMode,
      preferredDeviceId: this.preferredDeviceId,
    });
    if (this.apiPolling) {
      return;
    }
    this.apiPolling = true;
    this.apiPoller.start({
      fetchState: () => this.fetchApiState(),
      onState: (state) => {
        sendAgentDebugLog({
          sessionId: "cc732b",
          sameOriginPath: "/api/debug/realtime",
          hypothesisId: "H7",
          location:
            "apps/player/src/features/playback/services/playback-sync-coordinator.ts",
          message: "coordinator api playback state accepted",
          data: {
            syncMode: this.syncMode,
            trackUri: state.trackUri,
            status: state.status,
            paused: state.paused,
            deviceId: state.deviceId,
          },
        });
        this.applyApiState(state, this.latestApiActiveDeviceName);
      },
      onError: (message) => this.options?.onPollError?.(message),
    });
  }

  stopApiPolling(): void {
    this.apiPolling = false;
    this.apiPoller.stop();
    playbackDebug("coordinator", "api-poll:stopped");
  }

  startSdk(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "sdk";
    playbackDebug("coordinator", "sdk:start", { syncMode: this.syncMode });
    this.refreshPublisherConfig();
    this.stopApiPolling();

    this.sdkSource.start(service, this.sdkSourceOptions());
  }

  stopSdk(): void {
    if (this.sdkService) {
      playbackDebug("coordinator", "sdk:stop");
    }
    this.sdkSource.stop();
    this.sdkService?.disconnect();
    this.sdkService = null;
    this.options?.onSdkQueue?.(null);
  }

  stop(): void {
    this.stopApiPolling();
    this.stopSdk();
    this.publisher.dispose();
    this.nearEndScheduler.reset();
    this.lastTrackUri = null;
    this.options = null;
  }

  reconcileSources(): void {
    if (!this.options) return;

    if (this.syncMode === "api_device") {
      playbackDebug("coordinator", "reconcile:api-device", {
        preferredDeviceId: this.preferredDeviceId,
      });
      this.stopSdk();
      this.startApiPolling();
      return;
    }

    if (this.syncMode === "sdk" && this.sdkService) {
      playbackDebug("coordinator", "reconcile:sdk");
      this.stopApiPolling();
      this.sdkSource.start(this.sdkService, this.sdkSourceOptions());
    }
  }

  async refreshSessionOnce(): Promise<void> {
    await this.refreshApiOnce();
  }

  async refreshApiOnce(): Promise<void> {
    await this.apiPoller.refreshOnce();
  }

  get sdkPlayer(): Spotify.Player | null {
    return this.sdkSource.player;
  }

  get activeControlDeviceId(): string | null {
    return this.publisher.activeControlDeviceId;
  }

  private sdkSourceOptions(): Parameters<SdkPlaybackSource["start"]>[1] {
    return {
      onState: (state, status) => {
        this.publisher.ingest(state, status, "sdk");
        void this.onPlaybackState(state, state.deviceId);
      },
      onQueue: (queue) => this.options?.onSdkQueue?.(queue),
      onEvent: (event) => this.options?.onSdkEvent?.(event),
    };
  }

  private async fetchApiState(): Promise<NormalizedSpotifyPlayerState | null> {
    const response = await fetch("/api/spotify/playback/state");
    const body = (await response.json().catch(() => ({}))) as {
      state?: NormalizedSpotifyPlayerState;
      activeDeviceName?: string | null;
      error?: string;
    };

    if (!response.ok) {
      throw new Error(body.error ?? "spotify_playback_state_failed");
    }
    if (!body.state) {
      return null;
    }

    this.latestApiActiveDeviceName = body.activeDeviceName ?? null;
    return body.state;
  }

  private refreshPublisherConfig(): void {
    if (!this.options) return;

    const publishRemote = this.options.publishRemote ?? "minimal";

    this.publisher.configure({
      slug: this.options.slug,
      playerId: this.options.playerId,
      browserInstanceId: this.options.browserInstanceId,
      syncMode: this.syncMode,
      preferredDeviceId: this.preferredDeviceId,
      activeDeviceName: this.activeDeviceName,
      stateVersion: this.publisher.currentStateVersion,
      publishRemote,
      onLocalState: this.options.onLocalState,
      onStateVersion: this.options.onStateVersion,
      onTrackChanged: this.options.onTrackChanged,
    });
  }
}
