import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";

import { ApiPlaybackPoller } from "./api-playback-poller";
import { PlaybackStatePublisher } from "./playback-state-publisher";
import { SdkPlaybackSource } from "./sdk-playback-source";
import type { SpotifyServiceInstance } from "./SpotifyService";

export type PlaybackSyncCoordinatorOptions = {
  slug: string;
  sessionMeta: PlayerMasterSessionMeta | null;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
  onStateVersion?: (version: number) => void;
  onTrackChanged?: (state: NormalizedSpotifyPlayerState) => void;
  onPollError?: (message: string) => void;
};

export class PlaybackSyncCoordinator {
  private options: PlaybackSyncCoordinatorOptions | null = null;
  private syncMode: PlaybackSyncMode = "api_device";
  private preferredDeviceId: string | null = null;
  private activeDeviceName: string | null = null;

  private readonly publisher = new PlaybackStatePublisher();
  private readonly poller = new ApiPlaybackPoller();
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

  startApiPolling(): void {
    if (!this.options || this.requiresDeviceSelection) return;
    this.stopSdk();
    this.poller.start({
      onState: (state) => {
        const status = state.status ?? (state.paused ? "paused" : "playing");
        this.publisher.ingest(state, status);
      },
      onError: (message) => this.options?.onPollError?.(message),
    });
  }

  startSdk(service: SpotifyServiceInstance): void {
    this.sdkService = service;
    this.syncMode = "sdk";
    this.refreshPublisherConfig();
    this.poller.stop();

    this.sdkSource.start(service, {
      onState: (state, status) => {
        this.publisher.ingest(state, status);
      },
    });
  }

  stopSdk(): void {
    this.sdkSource.stop();
    this.sdkService?.disconnect();
    this.sdkService = null;
  }

  stop(): void {
    this.poller.stop();
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
        this.poller.stop();
      }
      return;
    }

    if (this.syncMode === "sdk" && this.sdkService) {
      this.poller.stop();
      this.sdkSource.start(this.sdkService, {
        onState: (state, status) => {
          this.publisher.ingest(state, status);
        },
      });
    }
  }

  get sdkPlayer(): Spotify.Player | null {
    return this.sdkSource.player;
  }

  private refreshPublisherConfig(): void {
    if (!this.options) return;

    this.publisher.configure({
      slug: this.options.slug,
      syncMode: this.syncMode,
      preferredDeviceId: this.preferredDeviceId,
      activeDeviceName: this.activeDeviceName,
      stateVersion: this.publisher.currentStateVersion,
      onLocalState: this.options.onLocalState,
      onStateVersion: this.options.onStateVersion,
      onTrackChanged: this.options.onTrackChanged,
    });
  }
}
