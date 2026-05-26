"use client";

import type { PlayerMasterViewState } from "@muziks/types";

import { SpotifyConnectButton } from "@/src/components/molecules/spotify-connect-button";
import { PlayerAppFrame } from "@/src/components/organisms/player-app-frame";
import { PlaybackMasterGate } from "@/src/components/organisms/playback-master-gate";
import { PlayerPlaylistsView } from "@/src/components/organisms/player-playlists-view";

type PlayerPlaylistsShellProps = {
  slug: string;
  viewState: PlayerMasterViewState;
};

export function PlayerPlaylistsShell({
  slug,
  viewState,
}: PlayerPlaylistsShellProps) {
  return (
    <PlayerAppFrame slug={slug} viewState={viewState} activeNav="playlists">
      {({ sync, hasSpotify }) => (
        <PlaybackMasterGate
          isAuthenticated={hasSpotify}
          fallback={<SpotifyConnectButton slug={slug} />}
        >
          <PlayerPlaylistsView
            slug={slug}
            defaultPlaylist={viewState.defaultPlaylist ?? null}
            playbackReady={sync.ready}
            playbackLoading={sync.playPauseLoading}
            onPlayPlaylist={(providerUri) =>
              sync.connectSdk(providerUri)
            }
          />
        </PlaybackMasterGate>
      )}
    </PlayerAppFrame>
  );
}
