"use client";

import type { NormalizedSpotifyPlayerState, PlaybackSyncMode, ProfileSummary } from "@muziks/types";
import { cn } from "@muziks/utils";
import Link from "next/link";

import { MuziksLogo } from "@muziks/ui";

import { OwnerProfileBlock } from "@/src/components/molecules/owner-profile-block";
import { Button } from "@/src/components/ui/button";

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
  spotifyActionLoading?: boolean;
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
  spotifyActionLoading,
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
        "hidden h-dvh w-60 shrink-0 flex-col border-r border-outline/40 bg-surface/80 md:flex",
        className,
      )}
    >
      <div className="shrink-0 border-b border-outline/40 px-5 py-5">
        <OwnerProfileBlock profile={profile} className="mb-4" />
        <MuziksLogo variant="light" className="h-6 w-auto" />
        <p className="mt-2 truncate text-lg font-semibold text-on-surface">
          {slug}
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-hidden px-3 py-4">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            disabled={item.disabled}
            className={cn(
              "h-auto w-full justify-start rounded-lg px-3 py-2 text-sm font-medium",
              item.active
                ? "bg-surface-container-high text-on-surface hover:bg-surface-container-high"
                : "text-on-surface-variant",
            )}
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
          </Button>
        ))}
      </nav>

      <div className="mt-auto shrink-0 border-t border-outline/40">
        <PlayerBar
          playback={playback}
          ready={ready}
          spotifyActionLoading={spotifyActionLoading}
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
