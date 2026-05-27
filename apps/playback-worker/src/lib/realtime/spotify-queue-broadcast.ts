import {
  SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT,
  spotifyQueueSnapshotBroadcastSchema,
  type SpotifyQueueSnapshotBroadcast,
} from "@muziks/types";

import { createSupabaseAdminClient } from "../supabase/admin.js";
import { playerSessionChannelName } from "./player-session-channel-name.js";

async function withBroadcastChannel<T>(
  playerId: string,
  send: (
    channel: ReturnType<ReturnType<typeof createSupabaseAdminClient>["channel"]>,
  ) => Promise<T>,
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

export async function publishWorkerSpotifyQueueSnapshot(
  payload: SpotifyQueueSnapshotBroadcast & { playerId: string },
): Promise<void> {
  const { playerId, ...broadcast } = payload;
  const parsed = spotifyQueueSnapshotBroadcastSchema.safeParse(broadcast);
  if (!parsed.success) {
    return;
  }

  try {
    await withBroadcastChannel(playerId, async (channel) => {
      await channel.send({
        type: "broadcast",
        event: SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT,
        payload: parsed.data,
      });
    });
  } catch {
    // best-effort fan-out
  }
}
