import {
  QUEUE_SNAPSHOT_BROADCAST_EVENT,
  queueSnapshotBroadcastSchema,
  type QueueSnapshotBroadcast,
} from "@muziks/types";

import {
  ensurePlayerSessionChannel,
  getOrCreatePlayerChannel,
} from "@/src/lib/realtime/player-session-channel";

export async function broadcastQueueSnapshot(
  playerId: string,
  payload: QueueSnapshotBroadcast,
): Promise<void> {
  const parsed = queueSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  try {
    const channel = await ensurePlayerSessionChannel(playerId);
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
  playerId: string,
  onSnapshot: (payload: QueueSnapshotBroadcast) => void,
): () => void {
  const channel = getOrCreatePlayerChannel(playerId);

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

  void ensurePlayerSessionChannel(playerId).catch(() => {
    // subscribe best-effort
  });

  return () => {
    // Shared channel with playback session — do not unsubscribe here.
  };
}
