import type { SpotifyConnectionState } from "@muziks/types";

import { hasSpotifySession } from "@/src/lib/spotify-session";

export async function resolveSpotifyConnectionState(): Promise<SpotifyConnectionState> {
  const connected = await hasSpotifySession();
  return connected ? "connected" : "disconnected";
}
