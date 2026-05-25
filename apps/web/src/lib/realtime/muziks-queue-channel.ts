import {
  QUEUE_SNAPSHOT_BROADCAST_EVENT,
  queueSnapshotBroadcastSchema,
  type QueueSnapshotBroadcast,
} from "@muziks/types";

import {
  ensurePlayerSessionChannel,
  getOrCreatePlayerChannel,
  removePlayerChannel,
} from "@/src/lib/realtime/player-session-channel";

export function subscribeQueueSnapshots(
  playerId: string,
  onSnapshot: (payload: QueueSnapshotBroadcast) => void,
  onError?: (error: unknown) => void,
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

  void ensurePlayerSessionChannel(playerId).catch((error) => {
    onError?.(error);
  });

  return () => {
    void removePlayerChannel(playerId).catch((error) => {
      onError?.(error);
    });
  };
}
