import { sdkForAccessToken } from "../client";
import type { SpotifyApiPlaybackState } from "./types";

export type GetCurrentPlaybackParams = {
  accessToken: string;
};

/** Returns null when nothing is playing (HTTP 204). */
export async function getCurrentPlayback(
  params: GetCurrentPlaybackParams,
): Promise<SpotifyApiPlaybackState | null> {
  const sdk = sdkForAccessToken(params.accessToken);
  return sdk.player.getPlaybackState();
}
