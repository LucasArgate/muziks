"use client";

import type { PlayerMasterViewState } from "@muziks/types";

import { PlayerAppFrame } from "@/src/components/organisms/player-app-frame";
import { PlayerSettingsView } from "@/src/features/settings/components/PlayerSettingsView";

type PlayerSettingsShellProps = {
  slug: string;
  viewState: PlayerMasterViewState;
};

export function PlayerSettingsShell({
  slug,
  viewState,
}: PlayerSettingsShellProps) {
  return (
    <PlayerAppFrame slug={slug} viewState={viewState} activeNav="settings">
      <PlayerSettingsView slug={slug} />
    </PlayerAppFrame>
  );
}
