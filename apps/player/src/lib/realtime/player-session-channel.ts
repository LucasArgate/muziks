import type { SessionSnapshotBroadcast } from "@muziks/types";
import {
  broadcastSessionSnapshot as broadcastSessionSnapshotCore,
  ensurePlayerSessionChannel as ensurePlayerSessionChannelCore,
  getOrCreatePlayerChannel as getOrCreatePlayerChannelCore,
  playerSessionChannelName,
  subscribeSessionSnapshots as subscribeSessionSnapshotsCore,
} from "@muziks/playback-client";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export { playerSessionChannelName };

export function getOrCreatePlayerChannel(playerId: string): RealtimeChannel {
  return getOrCreatePlayerChannelCore(createSupabaseBrowserClient(), playerId);
}

export async function ensurePlayerSessionChannel(
  playerId: string,
): Promise<RealtimeChannel> {
  return ensurePlayerSessionChannelCore(
    createSupabaseBrowserClient(),
    playerId,
  );
}

export async function broadcastSessionSnapshot(
  playerId: string,
  payload: SessionSnapshotBroadcast,
): Promise<void> {
  return broadcastSessionSnapshotCore(
    createSupabaseBrowserClient(),
    playerId,
    payload,
  );
}

export function subscribeSessionSnapshots(
  playerId: string,
  onSnapshot: (payload: SessionSnapshotBroadcast) => void,
): () => void {
  return subscribeSessionSnapshotsCore(
    createSupabaseBrowserClient(),
    playerId,
    onSnapshot,
  );
}
