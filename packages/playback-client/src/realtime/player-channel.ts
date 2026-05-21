import type { SupabaseClient } from "@supabase/supabase-js";

export function playerSessionChannelName(playerId: string): string {
  return `player:${playerId}`;
}

const channelRegistries = new WeakMap<
  SupabaseClient,
  Map<string, ReturnType<SupabaseClient["channel"]>>
>();

function getRegistry(supabase: SupabaseClient): Map<string, ReturnType<SupabaseClient["channel"]>> {
  let registry = channelRegistries.get(supabase);
  if (!registry) {
    registry = new Map();
    channelRegistries.set(supabase, registry);
  }
  return registry;
}

export function getOrCreatePlayerChannel(
  supabase: SupabaseClient,
  playerId: string,
): ReturnType<SupabaseClient["channel"]> {
  const name = playerSessionChannelName(playerId);
  const registry = getRegistry(supabase);
  const existing = registry.get(name);
  if (existing) {
    return existing;
  }

  const channel = supabase.channel(name, {
    config: { broadcast: { self: false } },
  });
  registry.set(name, channel);
  return channel;
}

export async function ensurePlayerSessionChannel(
  supabase: SupabaseClient,
  playerId: string,
): Promise<ReturnType<SupabaseClient["channel"]>> {
  const channel = getOrCreatePlayerChannel(supabase, playerId);
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

export function removePlayerChannel(
  supabase: SupabaseClient,
  playerId: string,
): void {
  const name = playerSessionChannelName(playerId);
  const registry = getRegistry(supabase);
  registry.delete(name);
}
