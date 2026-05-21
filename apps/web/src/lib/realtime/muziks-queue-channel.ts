import type { QueueSnapshotBroadcast } from "@muziks/types";
import { subscribeQueueSnapshots as subscribeQueueSnapshotsCore } from "@muziks/playback-client";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function subscribeQueueSnapshots(
  playerId: string,
  onSnapshot: (payload: QueueSnapshotBroadcast) => void,
): () => void {
  return subscribeQueueSnapshotsCore(
    createSupabaseBrowserClient(),
    playerId,
    onSnapshot,
  );
}
