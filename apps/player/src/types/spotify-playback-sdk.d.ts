declare namespace Spotify {
  interface DeviceMessage {
    device_id: string;
  }

  interface ErrorMessage {
    message: string;
  }

  type PlayerEventMap = {
    ready: DeviceMessage;
    not_ready: DeviceMessage;
    player_state_changed: PlaybackState | null;
    initialization_error: ErrorMessage;
    authentication_error: ErrorMessage;
    account_error: ErrorMessage;
    playback_error: ErrorMessage;
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

  interface PlaybackTrack {
    uri: string;
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string; height: number | null; width: number | null }[];
    };
  }

  interface PlaybackState {
    paused: boolean;
    /** Current position in ms (SDK may briefly report seconds — normalize before use). */
    position: number;
    duration: number;
    /** Present on some SDK builds; ms epoch when this state was sampled. */
    timestamp?: number;
    track_window: {
      current_track: PlaybackTrack;
      next_tracks: PlaybackTrack[];
      previous_tracks?: PlaybackTrack[];
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
