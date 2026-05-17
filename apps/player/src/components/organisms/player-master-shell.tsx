"use client";

import { GlassPanel } from "@muziks/ui";
import type { PlayerMasterViewState } from "@muziks/types";
import { cn } from "@muziks/utils";

import { SpotifyConnectButton } from "@/src/components/molecules/spotify-connect-button";
import { PlaybackMasterGate } from "@/src/features/playback/components/PlaybackMasterGate";
import { useSpotifyPlayer } from "@/src/features/playback/hooks/useSpotifyPlayer";

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
  const playback = useSpotifyPlayer(`Muziks — ${slug}`, hasSpotify);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg">
        <GlassPanel className="p-8 md:p-10">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-on-surface-variant">
            Player master
          </p>
          <h1 className="mt-2 text-center text-2xl font-semibold text-on-surface md:text-3xl">
            {slug}
          </h1>
          <p className="mt-3 text-center text-sm leading-relaxed text-on-surface-variant">
            Conta Spotify Premium do estabelecimento — reprodução via Web
            Playback SDK.
          </p>

          {spotifyNotice ? (
            <p
              className={cn(
                "mt-4 rounded-lg border px-3 py-2 text-center text-sm",
                "border-outline/60 text-on-surface-variant",
              )}
              role="status"
            >
              {spotifyNotice}
            </p>
          ) : null}

          <div className="mt-8 space-y-4">
            <PlaybackMasterGate
              isAuthenticated={hasSpotify}
              fallback={<SpotifyConnectButton slug={slug} />}
            >
              {!playback.ready ? (
                <button
                  type="button"
                  onClick={() => void playback.connect()}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-on-primary transition hover:opacity-90"
                >
                  Ativar reprodução neste navegador
                </button>
              ) : (
                <NowPlaying
                  trackName={playback.trackName}
                  artistName={playback.artistName}
                  deviceId={playback.deviceId}
                />
              )}

              {playback.error ? (
                <p className="text-center text-sm text-red-300" role="alert">
                  {playback.error}
                </p>
              ) : null}

              <form action={`/api/spotify/logout?slug=${encodeURIComponent(slug)}`} method="post">
                <button
                  type="submit"
                  className="w-full text-center text-sm text-on-surface-variant underline-offset-2 hover:underline"
                >
                  Desconectar Spotify
                </button>
              </form>
            </PlaybackMasterGate>

            <form action="/logout" method="post">
              <button
                type="submit"
                className="w-full text-center text-sm text-on-surface-variant/80 underline-offset-2 hover:underline"
              >
                Sair do Muziks
              </button>
            </form>
          </div>
        </GlassPanel>
      </div>
    </main>
  );
}

function NowPlaying({
  trackName,
  artistName,
  deviceId,
}: {
  trackName: string | null;
  artistName: string | null;
  deviceId: string | null;
}) {
  return (
    <div>
      <p className="text-center text-xs uppercase tracking-wide text-on-surface-variant">
        Dispositivo ativo
      </p>
      <p className="mt-1 text-center font-mono text-xs text-on-surface-variant/80">
        {deviceId ?? "—"}
      </p>
      <p className="mt-4 text-center text-lg font-medium text-on-surface">
        {trackName ?? "Nenhuma faixa em reprodução"}
      </p>
      {artistName ? (
        <p className="mt-1 text-center text-sm text-on-surface-variant">
          {artistName}
        </p>
      ) : null}
      <p className="mt-4 text-center text-xs text-on-surface-variant">
        Atribuição: conteúdo reproduzido via Spotify
      </p>
    </div>
  );
}
