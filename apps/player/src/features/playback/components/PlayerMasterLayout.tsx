"use client";

import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  ProfileSummary,
} from "@muziks/types";
import type { ReactNode } from "react";
import { useState } from "react";

import { PlayerMain } from "./PlayerMain";
import { PlayerMobileHeader } from "./PlayerMobileHeader";
import { PlayerMobileNav } from "./PlayerMobileNav";
import { PlayerBar } from "./PlayerBar";
import { PlayerSidebar } from "./PlayerSidebar";
import type { PlayerNavSection } from "./player-nav-items";

type PlayerMasterLayoutProps = {
  slug: string;
  profile: ProfileSummary | null;
  spotifyNotice?: string | null;
  playback: NormalizedSpotifyPlayerState | null;
  ready: boolean;
  error: string | null;
  onTogglePlay: () => void;
  syncMode?: PlaybackSyncMode;
  deviceName?: string | null;
  showConnectBadge?: boolean;
  onSelectDevice?: (deviceId: string, deviceName: string) => Promise<void>;
  activeNav: PlayerNavSection;
  children: ReactNode;
};

export function PlayerMasterLayout({
  slug,
  profile,
  spotifyNotice,
  playback,
  ready,
  error,
  onTogglePlay,
  syncMode,
  deviceName,
  showConnectBadge = false,
  onSelectDevice,
  activeNav,
  children,
}: PlayerMasterLayoutProps) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-on-surface">
      <PlayerSidebar
        slug={slug}
        profile={profile}
        playback={playback}
        ready={ready}
        onTogglePlay={onTogglePlay}
        syncMode={syncMode}
        deviceName={deviceName}
        showConnectBadge={showConnectBadge}
        onSelectDevice={onSelectDevice}
        activeNav={activeNav}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PlayerMobileHeader
          slug={slug}
          navOpen={navOpen}
          onOpenNav={() => setNavOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto pb-36 md:pb-0">
          <PlayerMain slug={slug} spotifyNotice={spotifyNotice} error={error}>
            {children}
          </PlayerMain>
        </main>
      </div>

      <PlayerMobileNav
        open={navOpen}
        slug={slug}
        profile={profile}
        activeNav={activeNav}
        onClose={() => setNavOpen(false)}
      />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-outline/40 bg-surface/95 backdrop-blur-md md:hidden">
        <PlayerBar
          playback={playback}
          ready={ready}
          onTogglePlay={onTogglePlay}
          syncMode={syncMode}
          deviceName={deviceName}
          showConnectBadge={showConnectBadge}
          onSelectDevice={onSelectDevice}
        />
      </div>
    </div>
  );
}
