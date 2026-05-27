import {
  PLAYBACK_TRACK_EVENT_BROADCAST,
  PLAYER_SESSION_BROADCAST_EVENT,
  playbackTrackEventBroadcastSchema,
  sessionSnapshotBroadcastSchema,
  type PlaybackTrackEventBroadcast,
  type SessionSnapshotBroadcast,
} from "@muziks/types";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

import { playerSessionChannelName } from "./player-session-channel-name";

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

export async function broadcastSessionSnapshotFromServer(
  playerId: string,
  payload: SessionSnapshotBroadcast,
): Promise<void> {
  const parsed = sessionSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  try {
    await withBroadcastChannel(playerId, async (channel) => {
      await channel.send({
        type: "broadcast",
        event: PLAYER_SESSION_BROADCAST_EVENT,
        payload: parsed.data,
      });
    });
  } catch {
    // best-effort fan-out
  }
}

export async function broadcastTrackEventFromServer(
  playerId: string,
  payload: PlaybackTrackEventBroadcast,
): Promise<void> {
  const parsed = playbackTrackEventBroadcastSchema.safeParse(payload);
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
