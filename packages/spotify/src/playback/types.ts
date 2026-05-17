/** Raw Spotify Web API — Player endpoints (subset) */

export type SpotifyApiImage = {
  url: string;
  height: number | null;
  width: number | null;
};

export type SpotifyApiArtist = {
  name: string;
};

export type SpotifyApiAlbum = {
  name: string;
  images: SpotifyApiImage[];
};

export type SpotifyApiTrack = {
  uri: string;
  name: string;
  duration_ms: number;
  artists: SpotifyApiArtist[];
  album: SpotifyApiAlbum;
};

export type SpotifyApiDevice = {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
};

export type SpotifyApiPlaybackState = {
  device: SpotifyApiDevice;
  repeat_state: string;
  shuffle_state: boolean;
  context: { uri: string } | null;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyApiTrack | null;
  currently_playing_type: string;
};

export type SpotifyApiDevicesResponse = {
  devices: SpotifyApiDevice[];
};
