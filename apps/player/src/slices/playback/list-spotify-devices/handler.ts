import { getDevices } from "@muziks/spotify";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";

export async function listSpotifyDevicesHandler() {
  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const { devices } = await getDevices({ accessToken });
  return { status: 200 as const, body: { devices } };
}
