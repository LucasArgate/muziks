"use client";

import type { PlayerMasterViewState } from "@muziks/types";

import { PlayerAppFrame } from "@/src/components/organisms/player-app-frame";
import { SpotifyConnectButton } from "@/src/components/molecules/spotify-connect-button";
import { Button } from "@/src/components/ui/button";
import { DeviceSelector } from "@/src/features/playback/components/DeviceSelector";
import { PlaybackMasterGate } from "@/src/features/playback/components/PlaybackMasterGate";
import { DequeueTestButton } from "@/src/features/queue/components/DequeueTestButton";
import { SpotifyPlaybackQueueList } from "@/src/features/queue/components/SpotifyPlaybackQueueList";

type PlayerMasterShellProps = {
  slug: string;
  viewState: PlayerMasterViewState;
  spotifyNotice?: string | null;
};

export function PlayerMasterShell({
  slug,
  viewState,
  spotifyNotice,
}: PlayerMasterShellProps) {
  return (
    <PlayerAppFrame
      slug={slug}
      viewState={viewState}
      spotifyNotice={spotifyNotice}
      activeNav="home"
    >
      {({ sync, hasSpotify }) => (
        <PlaybackMasterGate
          isAuthenticated={hasSpotify}
          fallback={<SpotifyConnectButton slug={slug} />}
        >
          <div className="space-y-6">
            {sync.requiresDeviceSelection ? (
              <DeviceSelector onSelect={sync.selectDevice} />
            ) : (
              <>
                <SpotifyPlaybackQueueList
                  enabled={hasSpotify}
                  trackUri={sync.playback?.trackUri}
                  paused={sync.playback?.paused ?? true}
                />

                <DequeueTestButton slug={slug} />

                {sync.syncMode === "hybrid" || sync.syncMode === "sdk" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-on-surface-variant"
                    onClick={() => sync.disconnectSdk()}
                  >
                    Usar só dispositivo externo (Connect)
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => void sync.connectSdk()}
                  >
                    Ativar player neste navegador
                  </Button>
                )}
              </>
            )}
          </div>
        </PlaybackMasterGate>
      )}
    </PlayerAppFrame>
  );
}
