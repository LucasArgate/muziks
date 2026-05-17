import type { PlayerMasterViewState } from "@muziks/types";

import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";
import { resolveSpotifyConnectionState } from "@/src/lib/auth/spotify-connection-state";

export async function buildPlayerMasterViewState(): Promise<PlayerMasterViewState> {
  const muziks = await getMuziksSession();
  const spotify = await resolveSpotifyConnectionState();

  return {
    muziks,
    spotify,
    playback: null,
  };
}
