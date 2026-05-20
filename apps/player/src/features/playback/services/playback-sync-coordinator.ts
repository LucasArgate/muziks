import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";

import {
  PlaybackStatePublisher,
  type PublishRemoteMode,
} from "./playback-state-publisher";
import { SdkPlaybackSource } from "./sdk-playback-source";
import { SessionPlaybackPoller } from "./session-playback-poller";
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
};

export class PlaybackSyncCoordinator {
  private options: PlaybackSyncCoordinatorOptions | null = null;
  private syncMode: PlaybackSyncMode = "hybrid";
  private preferredDeviceId: string | null = null;
  private activeDeviceName: string | null = null;

  private readonly publisher = new PlaybackStatePublisher();
  private readonly sessionPoller = new SessionPlaybackPoller();
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

  applyApiState(state: NormalizedSpotifyPlayerState): void {
    const status = state.status ?? (state.paused ? "paused" : "playing");
    this.publisher.ingest(state, status, "api");
  }

  startSessionPolling(): void {
    const slug = this.options?.slug;
    if (!slug || this.requiresDeviceSelection) return;

    this.sessionPoller.start({
      slug,
      onState: (state) => this.applyApiState(state),
      onError: (message) => this.options?.onPollError?.(message),
    });
  }

  startSdk(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "sdk";
    this.refreshPublisherConfig();
    this.sessionPoller.stop();

    this.sdkSource.start(service, {
      onState: (state, status) => {
        this.publisher.ingest(state, status, "sdk");
      },
      onQueue: (queue) => this.options?.onSdkQueue?.(queue),
    });
  }

  startHybrid(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "hybrid";
    this.refreshPublisherConfig();
    this.sessionPoller.stop();

    this.sdkSource.start(service, {
      onState: (state, status) => {
        this.publisher.ingest(state, status, "sdk");
      },
      onQueue: (queue) => this.options?.onSdkQueue?.(queue),
    });
  }

  stopSdk(): void {
    this.sdkSource.stop();
    this.sdkService?.disconnect();
    this.sdkService = null;
    this.options?.onSdkQueue?.(null);
  }

  stop(): void {
    this.sessionPoller.stop();
    this.stopSdk();
    this.publisher.dispose();
    this.options = null;
  }

  reconcileSources(): void {
    if (!this.options) return;

    if (this.syncMode === "api_device") {
      this.stopSdk();
      if (this.preferredDeviceId) {
        this.startSessionPolling();
      } else {
        this.sessionPoller.stop();
      }
      return;
    }

    if (this.syncMode === "hybrid" && this.sdkService) {
      this.sessionPoller.stop();
      this.startSdkListeners();
      return;
    }

    if (this.syncMode === "sdk" && this.sdkService) {
      this.sessionPoller.stop();
      this.startSdkListeners();
    }
  }

  async refreshSessionOnce(): Promise<void> {
    await this.sessionPoller.refreshOnce();
  }

  get sdkPlayer(): Spotify.Player | null {
    return this.sdkSource.player;
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

  private startSdkListeners(): void {
    if (!this.sdkService) return;

    this.sdkSource.start(this.sdkService, {
      onState: (state, status) => {
        this.publisher.ingest(state, status, "sdk");
      },
      onQueue: (queue) => this.options?.onSdkQueue?.(queue),
    });
  }
}
