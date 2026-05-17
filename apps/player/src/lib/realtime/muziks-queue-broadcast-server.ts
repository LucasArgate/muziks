import {
  QUEUE_SNAPSHOT_BROADCAST_EVENT,
  queueSnapshotBroadcastSchema,
  type QueueSnapshotBroadcast,
} from "@muziks/types";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

import { playerSessionChannelName } from "./player-session-channel";

async function withBroadcastChannel<T>(
  playerId: string,
  send: (channel: ReturnType<
    ReturnType<typeof createSupabaseAdminClient>["channel"]
  >) => Promise<T>,
): Promise<T> {
  const supabase = createSupabaseAdminClient();
  const channel = supabase.channel(playerSessionChannelName(playerId), {
    config: { broadcast: { self: false } },
  });

  await new Promise<void>((resolve, reject) => {
    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        resolve();
        return;
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        reject(err ?? new Error(`realtime_${status.toLowerCase()}`));
      }
    });
  });

  try {
    return await send(channel);
  } finally {
    await channel.unsubscribe();
  }
}

export async function broadcastQueueSnapshotFromServer(
  playerId: string,
  payload: QueueSnapshotBroadcast,
): Promise<void> {
  const parsed = queueSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  try {
    await withBroadcastChannel(playerId, async (channel) => {
      await channel.send({
        type: "broadcast",
        event: QUEUE_SNAPSHOT_BROADCAST_EVENT,
        payload: parsed.data,
      });
    });
  } catch {
    // best-effort fan-out
  }
}
