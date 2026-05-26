"use client";

import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  ProfileSummary,
} from "@muziks/types";
import type { ReactNode } from "react";
import { useState } from "react";

import { AmbientSpotlight } from "@muziks/ui";

import { PlayerBar } from "@/src/components/molecules/player-bar";
import { PlayerMobileHeader } from "@/src/components/molecules/player-mobile-header";
import { PlayerMobileNav } from "@/src/components/molecules/player-mobile-nav";
import { PlayerMain } from "@/src/components/organisms/player-main";
import { PlayerSidebar } from "@/src/components/organisms/player-sidebar";
import type { PlayerNavSection } from "@/src/lib/player-nav-items";

type PlayerMasterLayoutProps = {
  slug: string;
  profile: ProfileSummary | null;
  spotifyNotice?: string | null;
  playback: NormalizedSpotifyPlayerState | null;
  ready: boolean;
  error: string | null;
  canStartPlayback?: boolean;
  playPauseLoading?: boolean;
  skipLoading?: boolean;
  onTogglePlay: () => void | Promise<void>;
  onSkipNext: () => void | Promise<void>;
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
  canStartPlayback,
  playPauseLoading,
  skipLoading,
  onTogglePlay,
  onSkipNext,
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
        canStartPlayback={canStartPlayback}
        playPauseLoading={playPauseLoading}
        skipLoading={skipLoading}
        onTogglePlay={onTogglePlay}
        onSkipNext={onSkipNext}
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

        <main className="relative min-h-0 flex-1 overflow-y-auto pb-36 md:pb-0">
          <AmbientSpotlight opacity={0.45} className="min-h-full">
            <PlayerMain slug={slug} spotifyNotice={spotifyNotice} error={error}>
              {children}
            </PlayerMain>
          </AmbientSpotlight>
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
          canStartPlayback={canStartPlayback}
          playPauseLoading={playPauseLoading}
          skipLoading={skipLoading}
          onTogglePlay={onTogglePlay}
          onSkipNext={onSkipNext}
          syncMode={syncMode}
          deviceName={deviceName}
          showConnectBadge={showConnectBadge}
          onSelectDevice={onSelectDevice}
        />
      </div>
    </div>
  );
}
