import type { PlayerMasterViewState } from "@muziks/types";
import { getDefaultSavedPlaylistForPlayer } from "@muziks/db";

import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";
import { resolveSpotifyConnectionState } from "@/src/lib/auth/spotify-connection-state";
import {
  getPlaybackSessionByPlayerId,
  playbackSessionToNormalized,
} from "@/src/lib/playback/playback-session-repository";

export async function buildPlayerMasterViewState(): Promise<PlayerMasterViewState> {
  const muziks = await getMuziksSession();
  const spotify = await resolveSpotifyConnectionState();

  let playback: PlayerMasterViewState["playback"] = null;
  let sessionMeta: PlayerMasterViewState["sessionMeta"] = null;
  let defaultPlaylist: PlayerMasterViewState["defaultPlaylist"] = null;

  if (muziks.status === "authenticated") {
    const session = await getPlaybackSessionByPlayerId(muziks.player.id);
    defaultPlaylist = await getDefaultSavedPlaylistForPlayer(muziks.player.id);
    if (session) {
      playback = playbackSessionToNormalized(session);
      sessionMeta = {
        syncMode: session.syncMode,
        preferredDeviceId: session.preferredDeviceId,
        activeDeviceName: session.activeDeviceName,
        stateVersion: session.stateVersion,
      };
    }
  }

  return {
    muziks,
    spotify,
    playback,
    sessionMeta,
    defaultPlaylist,
  };
}
