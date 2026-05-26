"use client";

import type { NormalizedSpotifyPlayerState, PlaybackSyncMode, ProfileSummary } from "@muziks/types";
import { cn } from "@muziks/utils";
import Link from "next/link";

import { GlassNavItem, MuziksLogo } from "@muziks/ui";

import { OwnerProfileBlock } from "@/src/components/molecules/owner-profile-block";

import { PlayerBar } from "@/src/components/molecules/player-bar";
import {
  getPlayerNavItems,
  type PlayerNavSection,
} from "@/src/lib/player-nav-items";

type PlayerSidebarProps = {
  slug: string;
  profile: ProfileSummary | null;
  playback: NormalizedSpotifyPlayerState | null;
  ready: boolean;
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
  className?: string;
};

export function PlayerSidebar({
  slug,
  profile,
  playback,
  ready,
  canStartPlayback,
  playPauseLoading,
  skipLoading,
  onTogglePlay,
  onSkipNext,
  syncMode,
  deviceName,
  showConnectBadge,
  onSelectDevice,
  activeNav,
  className,
}: PlayerSidebarProps) {
  const navItems = getPlayerNavItems(slug, activeNav);

  return (
    <aside
      className={cn(
        "hidden h-dvh w-60 shrink-0 flex-col border-r border-outline/40 bg-surface/40 md:flex",
        className,
      )}
    >
      <div className="shrink-0 border-b border-outline/40 px-5 py-5">
        <MuziksLogo variant="light" className="mb-4 h-4 w-auto opacity-90" />
        <OwnerProfileBlock profile={profile} />
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <GlassNavItem
            key={item.label}
            active={item.active}
            disabled={item.disabled}
            asChild={!item.disabled}
          >
            {item.disabled ? (
              <span>
                {item.label}
                <span className="ml-2 text-[10px] uppercase">em breve</span>
              </span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </GlassNavItem>
        ))}
      </nav>

      <div className="mt-auto shrink-0 border-t border-outline/40">
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
    </aside>
  );
}
