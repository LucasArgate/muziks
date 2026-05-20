import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";

import type { SdkPlaybackEvent } from "../lib/sdk-events";
import {
  PlaybackStatePublisher,
  type PublishRemoteMode,
} from "./playback-state-publisher";
import { SdkPlaybackSource } from "./sdk-playback-source";
import { SpotifyApiPlaybackPoller } from "./spotify-api-playback-poller";
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

  private readonly publisher = new PlaybackStatePublisher();
  private readonly apiPoller = new SpotifyApiPlaybackPoller();
  private readonly sdkSource = new SdkPlaybackSource();
  private sdkService: SpotifyServiceInstance | null = null;

  configure(options: PlaybackSyncCoordinatorOptions): void {
    this.options = options;
    if (options.sessionMeta) {
      this.syncMode = options.sessionMeta.syncMode;
      this.preferredDeviceId = options.sessionMeta.preferredDeviceId;
      this.activeDeviceName = options.sessionMeta.activeDeviceName;
      this.publisher.setStateVersion(options.sessionMeta.stateVersion);
    }
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

  /** Future: enable when bridge WS session is connected. */
  setBridgeActive(active: boolean): void {
    this.publisher.setBridgeActive(active);
  }

  applyApiState(state: NormalizedSpotifyPlayerState): void {
    const status = state.status ?? (state.paused ? "paused" : "playing");
    this.publisher.ingest(state, status, "api");
  }

  /** Future: called by bridge WS client when librespot reports playback. */
  applyBridgeState(state: NormalizedSpotifyPlayerState): void {
    const status = state.status ?? (state.paused ? "paused" : "playing");
    this.publisher.ingest(state, status, "bridge");
  }

  startSessionPolling(): void {
    this.startApiPolling();
  }

  startApiPolling(): void {
    if (this.requiresDeviceSelection) return;

    const profile =
      this.syncMode === "hybrid" ? ("hybrid" as const) : ("default" as const);

    this.apiPoller.start({
      profile,
      onState: (state) => this.applyApiState(state),
      onError: (message) => this.options?.onPollError?.(message),
    });
  }

  stopApiPolling(): void {
    this.apiPoller.stop();
  }

  startSdk(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "sdk";
    this.refreshPublisherConfig();
    this.stopApiPolling();

    this.sdkSource.start(service, this.sdkSourceOptions());
  }

  startHybrid(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "hybrid";
    this.refreshPublisherConfig();

    this.sdkSource.start(service, this.sdkSourceOptions());
    this.startApiPolling();
    void this.apiPoller.refreshOnce();
  }

  stopSdk(): void {
    this.sdkSource.stop();
    this.sdkService?.disconnect();
    this.sdkService = null;
    this.options?.onSdkQueue?.(null);
  }

  stop(): void {
    this.stopApiPolling();
    this.stopSdk();
    this.publisher.dispose();
    this.options = null;
  }

  reconcileSources(): void {
    if (!this.options) return;

    if (this.syncMode === "api_device") {
      this.stopSdk();
      if (this.preferredDeviceId) {
        this.startApiPolling();
      } else {
        this.stopApiPolling();
      }
      return;
    }

    if (this.syncMode === "hybrid" && this.sdkService) {
      this.sdkSource.start(this.sdkService, this.sdkSourceOptions());
      this.startApiPolling();
      return;
    }

    if (this.syncMode === "sdk" && this.sdkService) {
      this.stopApiPolling();
      this.sdkSource.start(this.sdkService, this.sdkSourceOptions());
    }
  }

  async refreshSessionOnce(): Promise<void> {
    await this.apiPoller.refreshOnce();
  }

  async refreshApiOnce(): Promise<void> {
    await this.apiPoller.refreshOnce();
  }

  get sdkPlayer(): Spotify.Player | null {
    return this.sdkSource.player;
  }

  private sdkSourceOptions(): Parameters<SdkPlaybackSource["start"]>[1] {
    return {
      onState: (state, status) => {
        this.publisher.ingest(state, status, "sdk");
      },
      onQueue: (queue) => this.options?.onSdkQueue?.(queue),
      onEvent: (event) => this.options?.onSdkEvent?.(event),
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
