"use client";

import type {
  NormalizedSpotifyPlayerState,
  PlayerMasterViewState,
} from "@muziks/types";

import { PlayerAppFrame } from "@/src/components/organisms/player-app-frame";
import { SpotifyConnectButton } from "@/src/components/molecules/spotify-connect-button";
import { Button } from "@/src/components/ui/button";
import { DeviceSelector } from "@/src/features/playback/components/DeviceSelector";
import { PlaybackMasterGate } from "@/src/features/playback/components/PlaybackMasterGate";
import { usePlaybackProgress } from "@/src/features/playback/hooks/usePlaybackProgress";

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
                <NowPlayingDetails playback={sync.playback} />

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

function NowPlayingDetails({
  playback,
}: {
  playback: NormalizedSpotifyPlayerState | null;
}) {
  const progress = usePlaybackProgress(playback);

  return (
    <div className="text-center">
      <p className="text-lg font-medium text-on-surface">
        {playback?.trackName ?? "Nenhuma faixa em reprodução"}
      </p>
      {playback?.artistName ? (
        <p className="mt-1 text-sm text-on-surface-variant">
          {playback.artistName}
        </p>
      ) : null}
      {progress.hasDuration ? (
        <div className="mt-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-outline/30">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
