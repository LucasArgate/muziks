import {
  PLAYBACK_TRACK_EVENT_BROADCAST,
  playbackTrackEventBroadcastSchema,
  type PlaybackTrackEvent,
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

export async function publishWorkerTrackEvent(
  playerId: string,
  event: PlaybackTrackEvent,
): Promise<void> {
  const parsed = playbackTrackEventBroadcastSchema.safeParse({ event });
  if (!parsed.success) {
    return;
  }

  try {
    await withBroadcastChannel(playerId, async (channel) => {
      await channel.send({
        type: "broadcast",
        event: PLAYBACK_TRACK_EVENT_BROADCAST,
        payload: parsed.data,
      });
    });
  } catch {
    // best-effort fan-out
  }
}
