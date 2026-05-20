"use client";

import type { PlayerMasterViewState } from "@muziks/types";

import { PlayerAppFrame } from "@/src/components/organisms/player-app-frame";
import { MuziksCustomerQueueList } from "@/src/components/organisms/muziks-customer-queue-list";
import { useMuziksCustomerQueue } from "@/src/features/queue/hooks/useMuziksCustomerQueue";

type PlayerQueueShellProps = {
  slug: string;
  viewState: PlayerMasterViewState;
};

export function PlayerQueueShell({ slug, viewState }: PlayerQueueShellProps) {
  const playerId =
    viewState.muziks.status === "authenticated"
      ? viewState.muziks.player.id
      : null;

  return (
    <PlayerAppFrame slug={slug} viewState={viewState} activeNav="queue">
      <PlayerQueueContent slug={slug} playerId={playerId} />
    </PlayerAppFrame>
  );
}

function PlayerQueueContent({
  slug,
  playerId,
}: {
  slug: string;
  playerId: string | null;
}) {
  const { items, loading, error } = useMuziksCustomerQueue({
    slug,
    playerId,
    transport: "realtime",
    pollMs: 4000,
  });

  return (
    <MuziksCustomerQueueList items={items} loading={loading} error={error} />
  );
}
