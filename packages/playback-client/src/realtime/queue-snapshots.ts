import {
  QUEUE_SNAPSHOT_BROADCAST_EVENT,
  queueSnapshotBroadcastSchema,
  type QueueSnapshotBroadcast,
} from "@muziks/types";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  ensurePlayerSessionChannel,
  getOrCreatePlayerChannel,
} from "./player-channel";

export async function broadcastQueueSnapshot(
  supabase: SupabaseClient,
  playerId: string,
  payload: QueueSnapshotBroadcast,
): Promise<void> {
  const parsed = queueSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  try {
    const channel = await ensurePlayerSessionChannel(supabase, playerId);
    await channel.send({
      type: "broadcast",
      event: QUEUE_SNAPSHOT_BROADCAST_EVENT,
      payload: parsed.data,
    });
  } catch {
    // best-effort fan-out
  }
}

export function subscribeQueueSnapshots(
  supabase: SupabaseClient,
  playerId: string,
  onSnapshot: (payload: QueueSnapshotBroadcast) => void,
): () => void {
  const channel = getOrCreatePlayerChannel(supabase, playerId);

  channel.on(
    "broadcast",
    { event: QUEUE_SNAPSHOT_BROADCAST_EVENT },
    (message) => {
      const parsed = queueSnapshotBroadcastSchema.safeParse(message.payload);
      if (parsed.success) {
        onSnapshot(parsed.data);
      }
    },
  );

  void ensurePlayerSessionChannel(supabase, playerId).catch(() => {
    // subscribe best-effort
  });

  return () => {
    // Shared channel with playback session — do not unsubscribe here.
  };
}
