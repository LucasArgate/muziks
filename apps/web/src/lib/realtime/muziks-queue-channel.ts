import {
  QUEUE_SNAPSHOT_BROADCAST_EVENT,
  queueSnapshotBroadcastSchema,
  type QueueSnapshotBroadcast,
} from "@muziks/types";

import {
  subscribePlayerBroadcastEvent,
} from "@/src/lib/realtime/player-session-channel";

export function subscribeQueueSnapshots(
  playerId: string,
  onSnapshot: (payload: QueueSnapshotBroadcast) => void,
  onError?: (error: unknown) => void,
): () => void {
  return subscribePlayerBroadcastEvent(
    playerId,
    QUEUE_SNAPSHOT_BROADCAST_EVENT,
    (payload) => {
      const parsed = queueSnapshotBroadcastSchema.safeParse(payload);
      if (parsed.success) {
        onSnapshot(parsed.data);
      }
    },
    onError,
  );
}
