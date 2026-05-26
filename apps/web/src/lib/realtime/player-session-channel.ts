import type { RealtimeChannel } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

type BroadcastListener = (payload: unknown) => void;

type ChannelEntry = {
  channel: RealtimeChannel;
  refs: number;
  boundEvents: Set<string>;
  listeners: Map<string, Set<BroadcastListener>>;
};

const channels = new Map<string, ChannelEntry>();

export function playerSessionChannelName(playerId: string): string {
  return `player:${playerId}`;
}

export function getOrCreatePlayerChannel(playerId: string): RealtimeChannel {
  const name = playerSessionChannelName(playerId);
  const existing = channels.get(name);
  if (existing) {
    return existing.channel;
  }

  const supabase = createSupabaseBrowserClient();
  const channel = supabase.channel(name, {
    config: { broadcast: { self: false } },
  });
  channels.set(name, {
    channel,
    refs: 0,
    boundEvents: new Set(),
    listeners: new Map(),
  });
  return channel;
}

function getOrCreateChannelEntry(playerId: string): ChannelEntry {
  const name = playerSessionChannelName(playerId);
  getOrCreatePlayerChannel(playerId);
  const entry = channels.get(name);
  if (!entry) {
    throw new Error("player_channel_not_created");
  }
  return entry;
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

export async function removePlayerChannel(playerId: string): Promise<void> {
  const name = playerSessionChannelName(playerId);
  const entry = channels.get(name);
  if (!entry) {
    return;
  }

  channels.delete(name);
  await entry.channel.unsubscribe();
}

export function subscribePlayerBroadcastEvent(
  playerId: string,
  event: string,
  onPayload: BroadcastListener,
  onError?: (error: unknown) => void,
): () => void {
  const entry = getOrCreateChannelEntry(playerId);
  entry.refs += 1;

  let listeners = entry.listeners.get(event);
  if (!listeners) {
    listeners = new Set();
    entry.listeners.set(event, listeners);
  }
  listeners.add(onPayload);

  if (!entry.boundEvents.has(event)) {
    entry.boundEvents.add(event);
    entry.channel.on("broadcast", { event }, (message) => {
      const current = entry.listeners.get(event);
      if (!current) return;
      for (const listener of current) {
        listener(message.payload);
      }
    });
  }

  void ensurePlayerSessionChannel(playerId).catch((error) => {
    onError?.(error);
  });

  return () => {
    listeners?.delete(onPayload);
    entry.refs = Math.max(0, entry.refs - 1);
    if (entry.refs === 0) {
      void removePlayerChannel(playerId).catch((error) => {
        onError?.(error);
      });
    }
  };
}
