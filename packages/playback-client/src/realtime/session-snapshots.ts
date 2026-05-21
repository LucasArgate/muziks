import {
  PLAYER_SESSION_BROADCAST_EVENT,
  sessionSnapshotBroadcastSchema,
  type SessionSnapshotBroadcast,
} from "@muziks/types";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ensurePlayerSessionChannel,
  getOrCreatePlayerChannel,
  playerSessionChannelName,
  removePlayerChannel,
} from "./player-channel";

export async function broadcastSessionSnapshot(
  supabase: SupabaseClient,
  playerId: string,
  payload: SessionSnapshotBroadcast,
): Promise<void> {
  const parsed = sessionSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  try {
    const channel = await ensurePlayerSessionChannel(supabase, playerId);
    await channel.send({
      type: "broadcast",
      event: PLAYER_SESSION_BROADCAST_EVENT,
      payload: parsed.data,
    });
  } catch {
    // best-effort fan-out
  }
}

export function subscribeSessionSnapshots(
  supabase: SupabaseClient,
  playerId: string,
  onSnapshot: (payload: SessionSnapshotBroadcast) => void,
): () => void {
  const channel = getOrCreatePlayerChannel(supabase, playerId);

  channel.on(
    "broadcast",
    { event: PLAYER_SESSION_BROADCAST_EVENT },
    (message) => {
      const parsed = sessionSnapshotBroadcastSchema.safeParse(message.payload);
      if (parsed.success) {
        onSnapshot(parsed.data);
      }
    },
  );

  void ensurePlayerSessionChannel(supabase, playerId).catch(() => {
    // subscribe best-effort
  });

  return () => {
    channel.unsubscribe();
    removePlayerChannel(supabase, playerId);
  };
}

export { playerSessionChannelName };
