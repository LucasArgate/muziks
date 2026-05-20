"use client";

import type { PlayerMasterViewState } from "@muziks/types";
import type { ReactNode } from "react";

import type { PlayerNavSection } from "@/src/lib/player-nav-items";
import { PlayerMasterLayout } from "@/src/components/templates/player-master-layout";
import { usePlaybackSession } from "@/src/features/playback/hooks/usePlaybackSession";
import { usePlaybackSync } from "@/src/features/playback/hooks/usePlaybackSync";

export type PlayerAppFrameContext = {
  sync: ReturnType<typeof usePlaybackSync>;
  hasSpotify: boolean;
};

type PlayerAppFrameProps = {
  slug: string;
  viewState: PlayerMasterViewState;
  spotifyNotice?: string | null;
  activeNav: PlayerNavSection;
  children: ReactNode | ((ctx: PlayerAppFrameContext) => ReactNode);
};

export function PlayerAppFrame({
  slug,
  viewState,
  spotifyNotice,
  activeNav,
  children,
}: PlayerAppFrameProps) {
  const hasSpotify = viewState.spotify === "connected";
  const playerId =
    viewState.muziks.status === "authenticated"
      ? viewState.muziks.player.id
      : null;

  const session = usePlaybackSession({
    playerId,
    initialPlayback: viewState.playback,
    subscribeRealtime: false,
  });

  const sync = usePlaybackSync({
    slug,
    playerId,
    playerName: `Muziks — ${slug}`,
    enabled: hasSpotify,
    sessionMeta: viewState.sessionMeta,
    initialPlayback: viewState.playback,
    onLocalState: session.onLocalState,
  });

  const displayPlayback = sync.playback;
  const error =
    sync.pollError ?? sync.sdkError ?? displayPlayback?.lastError ?? null;
  const profile =
    viewState.muziks.status !== "anonymous" ? viewState.muziks.profile : null;

  const content =
    typeof children === "function"
      ? children({ sync, hasSpotify })
      : children;

  return (
    <PlayerMasterLayout
      slug={slug}
      profile={profile}
      spotifyNotice={spotifyNotice}
      playback={displayPlayback}
      ready={sync.ready}
      error={error}
      spotifyActionLoading={sync.spotifyActionLoading}
      onTogglePlay={() => void sync.togglePlay()}
      onSkipNext={() => void sync.skipToNext()}
      syncMode={sync.syncMode}
      deviceName={sync.activeDeviceName}
      showConnectBadge={hasSpotify}
      onSelectDevice={sync.selectDevice}
      activeNav={activeNav}
    >
      {content}
    </PlayerMasterLayout>
  );
}
