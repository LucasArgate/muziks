import type { SessionSnapshotBroadcast } from "@muziks/types";
import { subscribeSessionSnapshots as subscribeSessionSnapshotsCore } from "@muziks/playback-client";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

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
