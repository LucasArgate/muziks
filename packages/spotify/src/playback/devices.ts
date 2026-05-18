import { sdkForAccessToken } from "../client";
import type { SpotifyApiDevicesResponse } from "./types";

export type GetDevicesParams = {
  accessToken: string;
};

export async function getDevices(
  params: GetDevicesParams,
): Promise<SpotifyApiDevicesResponse> {
  const sdk = sdkForAccessToken(params.accessToken);
  return sdk.player.getAvailableDevices();
}

export type TransferPlaybackParams = {
  accessToken: string;
  deviceIds: string[];
  play?: boolean;
};

export async function transferPlayback(
  params: TransferPlaybackParams,
): Promise<void> {
  const sdk = sdkForAccessToken(params.accessToken);
  await sdk.player.transferPlayback(params.deviceIds, params.play ?? false);
}
