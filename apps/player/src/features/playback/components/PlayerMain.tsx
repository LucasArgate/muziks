"use client";

import { GlassPanel } from "@muziks/ui";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import { cn } from "@muziks/utils";
import type { ReactNode } from "react";

type PlayerMainProps = {
  slug: string;
  spotifyNotice?: string | null;
  playback: NormalizedSpotifyPlayerState | null;
  error: string | null;
  children: ReactNode;
};

function statusLabel(status: NormalizedSpotifyPlayerState["status"]): string {
  switch (status) {
    case "connected":
      return "Spotify conectado";
    case "ready":
      return "Dispositivo pronto";
    case "playing":
      return "Reproduzindo";
    case "paused":
      return "Pausado";
    case "error":
      return "Erro de reprodução";
    case "idle":
    default:
      return "Inativo";
  }
}

export function PlayerMain({
  slug,
  spotifyNotice,
  playback,
  error,
  children,
}: PlayerMainProps) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col pb-28 md:pb-0">
      <header className="border-b border-outline/30 px-4 py-4 md:px-8">
        <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant md:hidden">
          Muziks Player
        </p>
        <h1 className="text-xl font-semibold text-on-surface md:text-2xl">
          {slug}
        </h1>
        {playback?.status ? (
          <p className="mt-1 text-sm text-on-surface-variant">
            {statusLabel(playback.status)}
            {playback.deviceId ? (
              <span className="ml-2 font-mono text-xs opacity-70">
                {playback.deviceId.slice(0, 8)}…
              </span>
            ) : null}
          </p>
        ) : null}
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-8">
        <div className="w-full max-w-xl">
          <GlassPanel className="p-6 md:p-8">
            {spotifyNotice ? (
              <p
                className={cn(
                  "mb-4 rounded-lg border px-3 py-2 text-center text-sm",
                  "border-outline/60 text-on-surface-variant",
                )}
                role="status"
              >
                {spotifyNotice}
              </p>
            ) : null}

            {playback?.albumImageUrl ? (
              <img
                src={playback.albumImageUrl}
                alt=""
                className="mx-auto mb-6 aspect-square w-full max-w-xs rounded-xl object-cover shadow-lg"
              />
            ) : null}

            <div className="space-y-4">{children}</div>

            {playback?.lastError ? (
              <p className="mt-4 text-center text-sm text-red-300" role="alert">
                {playback.lastError}
              </p>
            ) : null}

            {error ? (
              <p className="mt-4 text-center text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}

            <p className="mt-6 text-center text-xs text-on-surface-variant">
              Atribuição: conteúdo reproduzido via Spotify
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

