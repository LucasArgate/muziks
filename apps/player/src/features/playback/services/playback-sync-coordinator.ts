import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";

import { isSdkUiAuthoritative } from "../lib/playback-control-routing";
import { playbackSemanticFingerprint } from "../lib/playback-semantic-state";
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

const API_RECONCILE_DEBOUNCE_MS = 2500;

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
  private lastSdkSemanticFingerprint: string | null = null;
  private reconcileDebounceTimer: ReturnType<typeof setTimeout> | null = null;

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
  }

  stopSdk(): void {
    this.sdkSource.stop();
    this.sdkService?.disconnect();
    this.sdkService = null;
    this.options?.onSdkQueue?.(null);
    this.publisher.setSdkAuthoritativeForUi(false);
  }

  stop(): void {
    this.clearReconcileDebounce();
    this.stopApiPolling();
    this.stopSdk();
    this.publisher.dispose();
    this.trackEndScheduler.dispose();
    this.options = null;
    this.lastSdkSemanticFingerprint = null;
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

  async refreshSdkOnce(): Promise<void> {
    await this.sdkSource.refreshFromCurrentState();
  }

  /** Single GET — only for `api_device` UI or hybrid reconcile when SDK is not authoritative. */
  async refreshApiOnce(): Promise<void> {
    if (!this.options || this.requiresDeviceSelection) {
      return;
    }
    if (this.syncMode === "hybrid" || this.syncMode === "sdk") {
      return;
    }

    if (this.apiPoller.active) {
      await this.apiPoller.refreshOnce();
      return;
    }

    await this.fetchApiPlaybackOnce();
  }

  /**
   * Pontual reconcile when playback runs on another Connect device (hybrid).
   * Never starts the continuous state poll loop.
   */
  async reconcileExternalPlaybackOnce(): Promise<void> {
    if (
      !this.options ||
      this.requiresDeviceSelection ||
      this.syncMode !== "hybrid"
    ) {
      return;
    }
    if (this.publisher.isSdkUiAuthoritative) {
      return;
    }
    await this.fetchApiPlaybackOnce();
  }

  private async fetchApiPlaybackOnce(): Promise<void> {
    if (!this.options) return;

    await this.apiPoller.fetchOnce(
      {
        onState: (state) => this.applyApiState(state),
        onError: (message) => this.options?.onPollError?.(message),
      },
      this.resolveApiPollProfile(),
    );
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

    if (needsReconcile) {
      this.publisher.setSdkAuthoritativeForUi(false);
      this.externalReconcileActive = true;
      return;
    }

    if (this.externalReconcileActive) {
      this.externalReconcileActive = false;
      this.updateSdkAuthoritative();
    }
  }

  private sdkSourceOptions(): Parameters<SdkPlaybackSource["start"]>[1] {
    return {
      onState: (state, status) => {
        this.trackEndScheduler.schedule(state);

        const semanticFp = playbackSemanticFingerprint(state);
        const semanticChanged = semanticFp !== this.lastSdkSemanticFingerprint;
        if (semanticChanged) {
          this.lastSdkSemanticFingerprint = semanticFp;
          this.publisher.ingest(state, status, "sdk");
          this.updateSdkAuthoritative();

          const apiState = this.publisher.apiPlaybackState;
          if (
            this.syncMode === "hybrid" &&
            apiState &&
            statesDiverge(state, apiState) &&
            !this.publisher.isSdkUiAuthoritative
          ) {
            this.scheduleApiReconcile();
          }
        }
      },
      onQueue: (queue) => this.options?.onSdkQueue?.(queue),
      onEvent: (event) => {
        this.options?.onSdkEvent?.(event);
        if (event.kind === "lifecycle" && event.phase === "ready") {
          this.updateSdkAuthoritative();
        }
        if (event.kind === "lifecycle" && event.phase === "not_ready") {
          void this.reconcileExternalPlaybackOnce();
        }
      },
    };
  }

  private scheduleApiReconcile(): void {
    if (this.reconcileDebounceTimer) {
      return;
    }
    this.reconcileDebounceTimer = setTimeout(() => {
      this.reconcileDebounceTimer = null;
      void this.reconcileExternalPlaybackOnce();
    }, API_RECONCILE_DEBOUNCE_MS);
  }

  private clearReconcileDebounce(): void {
    if (this.reconcileDebounceTimer) {
      clearTimeout(this.reconcileDebounceTimer);
      this.reconcileDebounceTimer = null;
    }
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
