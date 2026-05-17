import type { SpotifyConnectionState } from "@muziks/types";

import { checkSpotifySessionConnected } from "@/src/lib/spotify-session";

export async function resolveSpotifyConnectionState(): Promise<SpotifyConnectionState> {
  const connected = await checkSpotifySessionConnected();
  return connected ? "connected" : "disconnected";
}
