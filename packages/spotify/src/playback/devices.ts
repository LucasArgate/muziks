import { spotifyFetch, type SpotifyFetchOptions } from "../api";
import type { SpotifyApiDevicesResponse } from "./types";

export type GetDevicesParams = Pick<SpotifyFetchOptions, "accessToken">;

export async function getDevices(
  params: GetDevicesParams,
): Promise<SpotifyApiDevicesResponse> {
  return spotifyFetch<SpotifyApiDevicesResponse>("/me/player/devices", {
    accessToken: params.accessToken,
  });
}

export type TransferPlaybackParams = Pick<SpotifyFetchOptions, "accessToken"> & {
  deviceIds: string[];
  play?: boolean;
};

export async function transferPlayback(
  params: TransferPlaybackParams,
): Promise<void> {
  await spotifyFetch<void>("/me/player", {
    accessToken: params.accessToken,
    method: "PUT",
    body: JSON.stringify({
      device_ids: params.deviceIds,
      play: params.play ?? false,
    }),
  });
}
