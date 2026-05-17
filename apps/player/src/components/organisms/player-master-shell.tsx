"use client";

import type { PlayerMasterViewState } from "@muziks/types";

import { SpotifyConnectButton } from "@/src/components/molecules/spotify-connect-button";
import { DeviceSelector } from "@/src/features/playback/components/DeviceSelector";
import { PlaybackMasterGate } from "@/src/features/playback/components/PlaybackMasterGate";
import { PlaybackModeBadge } from "@/src/features/playback/components/PlaybackModeBadge";
import { PlayerMasterLayout } from "@/src/features/playback/components/PlayerMasterLayout";
import { usePlaybackSession } from "@/src/features/playback/hooks/usePlaybackSession";
import { usePlaybackSync } from "@/src/features/playback/hooks/usePlaybackSync";

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
  const hasSpotify = viewState.spotify === "connected";
  const { onLocalState } = usePlaybackSession(viewState.playback);
  const sync = usePlaybackSync({
    slug,
    playerName: `Muziks — ${slug}`,
    enabled: hasSpotify,
    sessionMeta: viewState.sessionMeta,
    initialPlayback: viewState.playback,
    onLocalState,
  });

  const displayPlayback = sync.playback;
  const error = sync.pollError ?? sync.sdkError;

  return (
    <PlayerMasterLayout
      slug={slug}
      spotifyNotice={spotifyNotice}
      playback={displayPlayback}
      ready={sync.ready}
      error={error}
      onTogglePlay={() => void sync.togglePlay()}
    >
      <PlaybackMasterGate
        isAuthenticated={hasSpotify}
        fallback={<SpotifyConnectButton slug={slug} />}
      >
        <div className="space-y-4">
          <PlaybackModeBadge
            syncMode={sync.syncMode}
            deviceName={sync.activeDeviceName}
          />

          {sync.requiresDeviceSelection ? (
            <DeviceSelector onSelect={sync.selectDevice} />
          ) : (
            <>
              <NowPlayingDetails playback={displayPlayback} />

              {sync.syncMode === "sdk" ? (
                <button
                  type="button"
                  onClick={() => sync.disconnectSdk()}
                  className="w-full text-center text-sm text-on-surface-variant underline-offset-2 hover:underline"
                >
                  Voltar para dispositivo externo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void sync.connectSdk()}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-outline/50 bg-surface-container-low px-6 py-3 text-sm font-medium text-on-surface transition hover:border-primary/50"
                >
                  Tocar neste navegador (opcional)
                </button>
              )}
            </>
          )}
        </div>

        <form
          action={`/api/spotify/logout?slug=${encodeURIComponent(slug)}`}
          method="post"
          className="pt-2"
        >
          <button
            type="submit"
            className="w-full text-center text-sm text-on-surface-variant underline-offset-2 hover:underline"
          >
            Desconectar Spotify
          </button>
        </form>
      </PlaybackMasterGate>

      <form action="/logout" method="post" className="pt-4">
        <button
          type="submit"
          className="w-full text-center text-sm text-on-surface-variant/80 underline-offset-2 hover:underline"
        >
          Sair do Muziks
        </button>
      </form>
    </PlayerMasterLayout>
  );
}

function NowPlayingDetails({
  playback,
}: {
  playback: ReturnType<typeof usePlaybackSync>["playback"];
}) {
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
      {playback?.durationMs && playback.durationMs > 0 ? (
        <div className="mt-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-outline/30">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{
                width: `${Math.min(100, (playback.positionMs / playback.durationMs) * 100)}%`,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
