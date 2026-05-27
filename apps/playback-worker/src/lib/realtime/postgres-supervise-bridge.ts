import { PLAYBACK_BROWSER_HEALTH_WINDOW_MS } from "@muziks/playback";

import { createSupabaseAdminClient } from "../supabase/admin.js";
import {
  buildRealtimeSuperviseIdempotencyKey,
  type SupervisePlayerSource,
} from "../supervise/supervise-player.js";
import { requestSupervisePlayer } from "../supervise/request-supervise.js";

type PlayerSessionRow = {
  player_id: string;
  sync_mode: string | null;
  state_source: string | null;
  browser_visibility: string | null;
  browser_last_seen_at: string | null;
  current_track_uri: string | null;
  paused: boolean | null;
  status: string | null;
  authority: string | null;
  state_version: number | null;
  progress_ms: number | null;
};

function workerShouldSuperviseRow(row: PlayerSessionRow, nowMs: number): boolean {
  const healthySince = nowMs - PLAYBACK_BROWSER_HEALTH_WINDOW_MS;
  const browserLastSeen = row.browser_last_seen_at
    ? Date.parse(row.browser_last_seen_at)
    : null;

  if (row.sync_mode === "sdk" && row.state_source === "sdk_browser") {
    if (row.browser_visibility === "visible") {
      return false;
    }
    if (browserLastSeen !== null && !Number.isNaN(browserLastSeen)) {
      if (browserLastSeen > healthySince) {
        return false;
      }
    }
  }

  return true;
}

function shouldWakeFromSessionChange(
  oldRow: PlayerSessionRow | null,
  newRow: PlayerSessionRow,
): boolean {
  if (!workerShouldSuperviseRow(newRow, Date.now())) {
    return false;
  }

  if (!oldRow) {
    return true;
  }

  if (oldRow.current_track_uri !== newRow.current_track_uri) {
    return true;
  }
  if (oldRow.paused !== newRow.paused) {
    return true;
  }
  if (oldRow.status !== newRow.status) {
    return true;
  }
  if (oldRow.sync_mode !== newRow.sync_mode) {
    return true;
  }
  if (oldRow.state_source !== newRow.state_source) {
    return true;
  }
  if (oldRow.browser_visibility !== newRow.browser_visibility) {
    return true;
  }
  if (oldRow.authority !== newRow.authority) {
    return true;
  }
  if (oldRow.browser_last_seen_at !== newRow.browser_last_seen_at) {
    return true;
  }

  return false;
}

function rowFromPayload(record: Record<string, unknown>): PlayerSessionRow {
  return {
    player_id: String(record.player_id),
    sync_mode: (record.sync_mode as string | null) ?? null,
    state_source: (record.state_source as string | null) ?? null,
    browser_visibility: (record.browser_visibility as string | null) ?? null,
    browser_last_seen_at: (record.browser_last_seen_at as string | null) ?? null,
    current_track_uri: (record.current_track_uri as string | null) ?? null,
    paused: (record.paused as boolean | null) ?? null,
    status: (record.status as string | null) ?? null,
    authority: (record.authority as string | null) ?? null,
    state_version: (record.state_version as number | null) ?? 0,
    progress_ms: (record.progress_ms as number | null) ?? null,
  };
}

async function wakePlayerFromRealtime(
  playerId: string,
  stateVersion: number,
): Promise<void> {
  await requestSupervisePlayer({
    playerId,
    source: "realtime" satisfies SupervisePlayerSource,
    idempotencyKey: buildRealtimeSuperviseIdempotencyKey(playerId, stateVersion),
    idempotencyKeyTTL: "2m",
  });
}

export async function runPostgresSuperviseBridge(input: {
  durationMs: number;
  signal?: AbortSignal;
}): Promise<{ wakesRequested: number }> {
  const supabase = createSupabaseAdminClient();
  let wakesRequested = 0;

  const channel = supabase
    .channel("playback-worker-postgres-supervise")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "player_sessions" },
      (payload) => {
        const row = rowFromPayload(
          payload.new as Record<string, unknown>,
        );
        if (!shouldWakeFromSessionChange(null, row)) {
          return;
        }
        wakesRequested += 1;
        void wakePlayerFromRealtime(
          row.player_id,
          row.state_version ?? 0,
        ).catch(() => undefined);
      },
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "player_sessions" },
      (payload) => {
        const oldRow = payload.old
          ? rowFromPayload(payload.old as Record<string, unknown>)
          : null;
        const newRow = rowFromPayload(
          payload.new as Record<string, unknown>,
        );
        if (!shouldWakeFromSessionChange(oldRow, newRow)) {
          return;
        }
        wakesRequested += 1;
        void wakePlayerFromRealtime(
          newRow.player_id,
          newRow.state_version ?? 0,
        ).catch(() => undefined);
      },
    );

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

  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, input.durationMs);
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    input.signal?.addEventListener("abort", onAbort, { once: true });
  });

  await channel.unsubscribe();

  return { wakesRequested };
}
