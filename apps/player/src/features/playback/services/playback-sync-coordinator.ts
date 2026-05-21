import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";

import { isSdkUiAuthoritative } from "../lib/playback-control-routing";
import type { SdkPlaybackEvent } from "../lib/sdk-events";
import {
  PlaybackStatePublisher,
  type PublishRemoteMode,
} from "./playback-state-publisher";
import { statesDiverge } from "./playback-state-merge";
import { SdkPlaybackSource } from "./sdk-playback-source";
import { SpotifyApiPlaybackPoller } from "./spotify-api-playback-poller";
import { TrackEndScheduler } from "./track-end-scheduler";
import type { SpotifyServiceInstance } from "./SpotifyService";

export type PlaybackSyncCoordinatorOptions = {
  slug: string;
  playerId?: string | null;
  sessionMeta: PlayerMasterSessionMeta | null;
  publishRemote?: PublishRemoteMode;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
  onSdkQueue?: (queue: NormalizedSpotifyPlaybackQueue | null) => void;
  onStateVersion?: (version: number) => void;
  onTrackChanged?: (state: NormalizedSpotifyPlayerState) => void;
  onPollError?: (message: string) => void;
  onSdkEvent?: (event: SdkPlaybackEvent) => void;
  onNearEnd?: (state: NormalizedSpotifyPlayerState) => void;
};

/**
 * Orchestrates SDK, Web API poll, and (future) bridge WS snapshots.
 * Bridge ingest: call `applyBridgeState` when `apps/spotify-bridge` pushes state.
 */
export class PlaybackSyncCoordinator {
  private options: PlaybackSyncCoordinatorOptions | null = null;
  private syncMode: PlaybackSyncMode = "hybrid";
  private preferredDeviceId: string | null = null;
  private activeDeviceName: string | null = null;
  private externalReconcileActive = false;

  private readonly publisher = new PlaybackStatePublisher();
  private readonly apiPoller = new SpotifyApiPlaybackPoller();
  private readonly sdkSource = new SdkPlaybackSource();
  private readonly trackEndScheduler = new TrackEndScheduler();
  private sdkService: SpotifyServiceInstance | null = null;

  configure(options: PlaybackSyncCoordinatorOptions): void {
    this.options = options;
    if (options.sessionMeta) {
      this.syncMode = options.sessionMeta.syncMode;
      this.preferredDeviceId = options.sessionMeta.preferredDeviceId;
      this.activeDeviceName = options.sessionMeta.activeDeviceName;
      this.publisher.setStateVersion(options.sessionMeta.stateVersion);
    }
    this.trackEndScheduler.configure({
      onNearEnd: (state) => options.onNearEnd?.(state),
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
    this.syncMode = mode;
    this.refreshPublisherConfig();
    this.reconcileSources();
  }

  setPreferredDevice(deviceId: string, deviceName: string): void {
    this.preferredDeviceId = deviceId;
    this.activeDeviceName = deviceName;
    this.refreshPublisherConfig();
    this.reconcileSources();
  }

  setBridgeActive(active: boolean): void {
    this.publisher.setBridgeActive(active);
  }

  setPendingIntent(paused: boolean): void {
    this.publisher.setPendingIntent(paused);
  }

  applyApiState(state: NormalizedSpotifyPlayerState): void {
    const status = state.status ?? (state.paused ? "paused" : "playing");
    this.publisher.ingest(state, status, "api");
    this.updateSdkAuthoritative();
  }

  applyBridgeState(state: NormalizedSpotifyPlayerState): void {
    const status = state.status ?? (state.paused ? "paused" : "playing");
    this.publisher.ingest(state, status, "bridge");
  }

  startSessionPolling(): void {
    this.startApiPolling();
  }

  startApiPolling(): void {
    if (this.requiresDeviceSelection) return;

    const profile = this.resolveApiPollProfile();

    this.apiPoller.start({
      profile,
      onState: (state) => this.applyApiState(state),
      onError: (message) => this.options?.onPollError?.(message),
    });
  }

  stopApiPolling(): void {
    this.apiPoller.stop();
    this.externalReconcileActive = false;
  }

  startSdk(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "sdk";
    this.refreshPublisherConfig();
    this.stopApiPolling();
    this.publisher.setSdkAuthoritativeForUi(true);

    this.sdkSource.start(service, this.sdkSourceOptions());
  }

  startHybrid(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "hybrid";
    this.refreshPublisherConfig();

    this.sdkSource.start(service, this.sdkSourceOptions());
    this.updateSdkAuthoritative();
    void this.refreshApiOnce();
  }

  stopSdk(): void {
    this.sdkSource.stop();
    this.sdkService?.disconnect();
    this.sdkService = null;
    this.options?.onSdkQueue?.(null);
    this.publisher.setSdkAuthoritativeForUi(false);
  }

  stop(): void {
    this.stopApiPolling();
    this.stopSdk();
    this.publisher.dispose();
    this.trackEndScheduler.dispose();
    this.options = null;
  }

  reconcileSources(): void {
    if (!this.options) return;

    if (this.syncMode === "api_device") {
      this.stopSdk();
      this.publisher.setSdkAuthoritativeForUi(false);
      if (this.preferredDeviceId) {
        this.startApiPolling();
      } else {
        this.stopApiPolling();
      }
      return;
    }

    if (this.syncMode === "hybrid" && this.sdkService) {
      this.sdkSource.start(this.sdkService, this.sdkSourceOptions());
      this.stopApiPolling();
      this.updateSdkAuthoritative();
      this.maybeStartExternalReconcile();
      return;
    }

    if (this.syncMode === "sdk" && this.sdkService) {
      this.stopApiPolling();
      this.publisher.setSdkAuthoritativeForUi(true);
      this.sdkSource.start(this.sdkService, this.sdkSourceOptions());
    }
  }

  async refreshSessionOnce(): Promise<void> {
    await this.apiPoller.refreshOnce();
  }

  async refreshApiOnce(): Promise<void> {
    if (!this.options || this.requiresDeviceSelection) {
      return;
    }

    if (!this.apiPoller.active) {
      const profile = this.resolveApiPollProfile();
      this.apiPoller.start({
        profile,
        onState: (state) => this.applyApiState(state),
        onError: (message) => this.options?.onPollError?.(message),
      });
      await this.apiPoller.refreshOnce();
      if (!this.externalReconcileActive) {
        this.apiPoller.stop();
      }
      return;
    }

    await this.apiPoller.refreshOnce();
  }

  get sdkPlayer(): Spotify.Player | null {
    return this.sdkSource.player;
  }

  get sdkDeviceId(): string | null {
    return this.sdkService?.getDeviceId() ?? null;
  }

  get activeControlDeviceId(): string | null {
    return this.publisher.activeControlDeviceId;
  }

  private resolveApiPollProfile(): "default" | "reconcile" {
    if (this.syncMode === "hybrid" && this.sdkService) {
      return "reconcile";
    }
    return "default";
  }

  private updateSdkAuthoritative(): void {
    const sdkDeviceId = this.sdkService?.getDeviceId() ?? null;
    const sdkState = this.publisher.lastSdkPlaybackState;
    const apiState = this.publisher.apiPlaybackState;
    const authoritative = isSdkUiAuthoritative(
      this.syncMode,
      sdkDeviceId,
      sdkState?.deviceId,
      apiState?.deviceId,
    );
    this.publisher.setSdkAuthoritativeForUi(authoritative);
    this.maybeStartExternalReconcile();
  }

  private maybeStartExternalReconcile(): void {
    if (this.syncMode !== "hybrid" || !this.sdkService) {
      return;
    }

    const sdkDeviceId = this.sdkService.getDeviceId();
    const apiState = this.publisher.apiPlaybackState;
    const apiDeviceId = apiState?.deviceId;
    const needsReconcile =
      Boolean(sdkDeviceId) &&
      Boolean(apiDeviceId) &&
      apiDeviceId !== sdkDeviceId;

    if (needsReconcile && !this.externalReconcileActive) {
      this.externalReconcileActive = true;
      this.publisher.setSdkAuthoritativeForUi(false);
      this.startApiPolling();
      return;
    }

    if (!needsReconcile && this.externalReconcileActive) {
      this.stopApiPolling();
      this.externalReconcileActive = false;
      this.updateSdkAuthoritative();
    }
  }

  private sdkSourceOptions(): Parameters<SdkPlaybackSource["start"]>[1] {
    return {
      onState: (state, status) => {
        this.publisher.ingest(state, status, "sdk");
        this.updateSdkAuthoritative();
        this.trackEndScheduler.schedule(state);

        const apiState = this.publisher.apiPlaybackState;
        if (
          this.syncMode === "hybrid" &&
          apiState &&
          statesDiverge(state, apiState)
        ) {
          void this.refreshApiOnce();
        }
      },
      onQueue: (queue) => this.options?.onSdkQueue?.(queue),
      onEvent: (event) => {
        this.options?.onSdkEvent?.(event);
        if (event.kind === "lifecycle" && event.phase === "ready") {
          void this.refreshApiOnce();
          this.updateSdkAuthoritative();
        }
      },
    };
  }

  private refreshPublisherConfig(): void {
    if (!this.options) return;

    const publishRemote = this.options.publishRemote ?? "minimal";

    this.publisher.configure({
      slug: this.options.slug,
      playerId: this.options.playerId,
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
