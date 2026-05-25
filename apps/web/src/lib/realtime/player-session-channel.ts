import type { RealtimeChannel } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

const channels = new Map<string, RealtimeChannel>();

export function playerSessionChannelName(playerId: string): string {
  return `player:${playerId}`;
}

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

export async function removePlayerChannel(playerId: string): Promise<void> {
  const name = playerSessionChannelName(playerId);
  const channel = channels.get(name);
  if (!channel) {
    return;
  }

  channels.delete(name);
  await channel.unsubscribe();
}
