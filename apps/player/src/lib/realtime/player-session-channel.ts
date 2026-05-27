import {
  PLAYER_SESSION_BROADCAST_EVENT,
  SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT,
  sessionSnapshotBroadcastSchema,
  spotifyQueueSnapshotBroadcastSchema,
  type SessionSnapshotBroadcast,
  type SpotifyQueueSnapshotBroadcast,
} from "@muziks/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

import { playerSessionChannelName } from "./player-session-channel-name";

const channels = new Map<string, RealtimeChannel>();

export { playerSessionChannelName } from "./player-session-channel-name";

export function getOrCreatePlayerChannel(playerId: string): RealtimeChannel {
  const name = playerSessionChannelName(playerId);
  const existing = channels.get(name);
  if (existing) {
    return existing;
  }

  const supabase = createSupabaseBrowserClient();
  const channel = supabase.channel(name, {
    config: { broadcast: { self: false } },
  });
  channels.set(name, channel);
  return channel;
}

export async function ensurePlayerSessionChannel(
  playerId: string,
): Promise<RealtimeChannel> {
  const channel = getOrCreatePlayerChannel(playerId);
  if (channel.state === "joined") {
    return channel;
  }

  return new Promise((resolve, reject) => {
    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        resolve(channel);
        return;
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        reject(err ?? new Error(`realtime_${status.toLowerCase()}`));
      }
    });
  });
}

export async function broadcastSessionSnapshot(
  playerId: string,
  payload: SessionSnapshotBroadcast,
): Promise<void> {
  const parsed = sessionSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  try {
    const channel = await ensurePlayerSessionChannel(playerId);
    await channel.send({
      type: "broadcast",
      event: PLAYER_SESSION_BROADCAST_EVENT,
      payload: parsed.data,
    });
  } catch {
    // best-effort fan-out
  }
}

export function subscribeSessionSnapshots(
  playerId: string,
  onSnapshot: (payload: SessionSnapshotBroadcast) => void,
): () => void {
  const channel = getOrCreatePlayerChannel(playerId);

  channel.on(
    "broadcast",
    { event: PLAYER_SESSION_BROADCAST_EVENT },
    (message) => {
      const parsed = sessionSnapshotBroadcastSchema.safeParse(message.payload);
      if (parsed.success) {
        onSnapshot(parsed.data);
      }
    },
  );

  void ensurePlayerSessionChannel(playerId).catch(() => {
    // subscribe best-effort
  });

  return () => {
    channel.unsubscribe();
    channels.delete(playerSessionChannelName(playerId));
  };
}

export async function broadcastSpotifyQueueSnapshot(
  playerId: string,
  payload: SpotifyQueueSnapshotBroadcast,
): Promise<void> {
  const parsed = spotifyQueueSnapshotBroadcastSchema.safeParse(payload);
  if (!parsed.success) {
    return;
  }

  try {
    const channel = await ensurePlayerSessionChannel(playerId);
    await channel.send({
      type: "broadcast",
      event: SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT,
      payload: parsed.data,
    });
  } catch {
    // best-effort fan-out
  }
}

export function subscribeSpotifyQueueSnapshots(
  playerId: string,
  onSnapshot: (payload: SpotifyQueueSnapshotBroadcast) => void,
): () => void {
  const channel = getOrCreatePlayerChannel(playerId);

  channel.on(
    "broadcast",
    { event: SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT },
    (message) => {
      const parsed = spotifyQueueSnapshotBroadcastSchema.safeParse(
        message.payload,
      );
      if (parsed.success) {
        onSnapshot(parsed.data);
      }
    },
  );

  void ensurePlayerSessionChannel(playerId).catch(() => {
    // subscribe best-effort
  });

  return () => {
    // Channel lifecycle is shared with session snapshots on the master.
  };
}
