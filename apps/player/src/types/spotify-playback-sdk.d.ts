declare namespace Spotify {
  interface DeviceMessage {
    device_id: string;
  }

  type PlayerEventMap = {
    ready: DeviceMessage;
    not_ready: DeviceMessage;
    player_state_changed: PlaybackState | null;
    initialization_error: { message: string };
    authentication_error: { message: string };
    account_error: { message: string };
    playback_error: { message: string };
  };

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener<E extends keyof PlayerEventMap>(
      event: E,
      callback: (payload: PlayerEventMap[E]) => void,
    ): void;
    removeListener<E extends keyof PlayerEventMap>(
      event: E,
      callback?: (payload: PlayerEventMap[E]) => void,
    ): void;
    getCurrentState(): Promise<PlaybackState | null>;
    setName(name: string): Promise<void>;
    getVolume(): Promise<number>;
    setVolume(volume: number): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    previousTrack(): Promise<void>;
    nextTrack(): Promise<void>;
  }

  interface PlaybackState {
    paused: boolean;
    position: number;
    duration: number;
    track_window: {
      current_track: {
        name: string;
        artists: { name: string }[];
        album: { name: string; images: { url: string }[] };
      };
    };
  }

  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface PlayerConstructor {
    new (options: PlayerInit): Player;
  }
}

interface Window {
  Spotify?: {
    Player: Spotify.PlayerConstructor;
  };
}
