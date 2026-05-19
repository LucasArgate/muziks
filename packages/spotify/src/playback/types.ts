/**
 * Public aliases over @spotify/web-api-ts-sdk types (Player / catalog subset).
 */
import type {
  Device,
  Devices,
  PlaybackState,
  Queue,
  Track,
  TrackItem,
} from "@spotify/web-api-ts-sdk";

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

export type SpotifyApiTrack = Track;

export type SpotifyApiDevice = Device;

export type SpotifyApiPlaybackState = PlaybackState;

export type SpotifyApiDevicesResponse = Devices;

export type SpotifyApiPlaybackQueueResponse = Queue;

export type { TrackItem };

export function isSpotifyApiTrack(item: TrackItem | null): item is Track {
  return item !== null && item.type === "track";
}
