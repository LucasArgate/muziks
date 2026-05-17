"use client";

import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import type { ReactNode } from "react";

import { PlayerBar } from "./PlayerBar";
import { PlayerMain } from "./PlayerMain";
import { PlayerSidebar } from "./PlayerSidebar";

type PlayerMasterLayoutProps = {
  slug: string;
  spotifyNotice?: string | null;
  playback: NormalizedSpotifyPlayerState | null;
  ready: boolean;
  error: string | null;
  onTogglePlay: () => void;
  children: ReactNode;
};

export function PlayerMasterLayout({
  slug,
  spotifyNotice,
  playback,
  ready,
  error,
  onTogglePlay,
  children,
}: PlayerMasterLayoutProps) {
  return (
    <div className="flex min-h-dvh bg-background text-on-surface">
      <PlayerSidebar
        slug={slug}
        playback={playback}
        ready={ready}
        onTogglePlay={onTogglePlay}
      />

      <PlayerMain
        slug={slug}
        spotifyNotice={spotifyNotice}
        playback={playback}
        error={error}
      >
        {children}
      </PlayerMain>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-outline/40 bg-surface/95 backdrop-blur-md md:hidden">
        <PlayerBar
          playback={playback}
          ready={ready}
          onTogglePlay={onTogglePlay}
        />
      </div>
    </div>
  );
}

