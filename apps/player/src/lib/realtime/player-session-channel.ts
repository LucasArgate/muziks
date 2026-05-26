import {
  PLAYER_SESSION_BROADCAST_EVENT,
  sessionSnapshotBroadcastSchema,
  type SessionSnapshotBroadcast,
} from "@muziks/types";
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
      // #region agent log
      fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "867515" }, body: JSON.stringify({ sessionId: "867515", runId: "initial", hypothesisId: "H3", location: "apps/player/src/lib/realtime/player-session-channel.ts:46", message: "player browser realtime subscribe status", data: { playerId, channel: playerSessionChannelName(playerId), status, state: channel.state, error: err instanceof Error ? { name: err.name, message: err.message } : err ? { value: String(err) } : null }, timestamp: Date.now() }) }).catch(() => {});
      fetch("/api/debug/realtime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId: "same-origin", hypothesisId: "H3", location: "apps/player/src/lib/realtime/player-session-channel.ts:46", message: "player browser realtime subscribe status", data: { playerId, channel: playerSessionChannelName(playerId), status, state: channel.state, error: err instanceof Error ? { name: err.name, message: err.message } : err ? { value: String(err) } : null }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
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
    const result = await channel.send({
      type: "broadcast",
      event: PLAYER_SESSION_BROADCAST_EVENT,
      payload: parsed.data,
    });
    // #region agent log
    fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "867515" }, body: JSON.stringify({ sessionId: "867515", runId: "initial", hypothesisId: "H3", location: "apps/player/src/lib/realtime/player-session-channel.ts:78", message: "player browser realtime broadcast sent", data: { playerId, event: PLAYER_SESSION_BROADCAST_EVENT, result: String(result) }, timestamp: Date.now() }) }).catch(() => {});
    fetch("/api/debug/realtime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId: "same-origin", hypothesisId: "H3", location: "apps/player/src/lib/realtime/player-session-channel.ts:78", message: "player browser realtime broadcast sent", data: { playerId, event: PLAYER_SESSION_BROADCAST_EVENT, result: String(result) }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "867515" }, body: JSON.stringify({ sessionId: "867515", runId: "initial", hypothesisId: "H3", location: "apps/player/src/lib/realtime/player-session-channel.ts:82", message: "player browser realtime broadcast failed", data: { playerId, event: PLAYER_SESSION_BROADCAST_EVENT, error: error instanceof Error ? { name: error.name, message: error.message } : { value: String(error) } }, timestamp: Date.now() }) }).catch(() => {});
    fetch("/api/debug/realtime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId: "same-origin", hypothesisId: "H3", location: "apps/player/src/lib/realtime/player-session-channel.ts:82", message: "player browser realtime broadcast failed", data: { playerId, event: PLAYER_SESSION_BROADCAST_EVENT, error: error instanceof Error ? { name: error.name, message: error.message } : { value: String(error) } }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
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
