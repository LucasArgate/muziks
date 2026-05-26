import {
  getDb,
  playbackPollCursors,
  playbackTrackLifecycle,
  playerSessions,
  players,
  spotifyConnections,
} from "@muziks/db";
import {
  and,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";

import { logPlaybackLifecycle } from "@/src/lib/playback/playback-lifecycle-log";

import { tickPlayer, type TickPlayerResult } from "./playback-orchestrator";

const ACTIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
const ENDING_SOON_MS = 90_000;
const BROWSER_HEALTH_WINDOW_MS = 30_000;
const PLAYING_NEXT_TICK_MS = 15_000;
const PAUSED_NEXT_TICK_MS = 60_000;
const IDLE_NEXT_TICK_MS = 5 * 60_000;
const ERROR_BACKOFF_MS = 30_000;

export type RunPlaybackOrchestratorResult = {
  playersProcessed: number;
  eventsEmitted: number;
  results: TickPlayerResult[];
};

async function listPlayerIdsForTick(): Promise<string[]> {
  const db = getDb();
  const now = new Date();
  const since = new Date(now.getTime() - ACTIVE_WINDOW_MS);
  const healthySince = new Date(now.getTime() - BROWSER_HEALTH_WINDOW_MS);
  const endingSoon = new Date(now.getTime() + ENDING_SOON_MS);

  const rows = await db
    .select({
      playerId: playerSessions.playerId,
      expectedEndAt: playbackTrackLifecycle.expectedEndAt,
      lifecyclePhase: playbackTrackLifecycle.phase,
      updatedAt: playerSessions.updatedAt,
      nextTickAt: playbackPollCursors.nextTickAt,
    })
    .from(playerSessions)
    .innerJoin(players, eq(players.id, playerSessions.playerId))
    .innerJoin(
      spotifyConnections,
      eq(spotifyConnections.userId, players.ownerId),
    )
    .leftJoin(
      playbackTrackLifecycle,
      eq(playbackTrackLifecycle.playerId, playerSessions.playerId),
    )
    .leftJoin(
      playbackPollCursors,
      eq(playbackPollCursors.playerId, playerSessions.playerId),
    )
    .where(
      and(
        gt(playerSessions.updatedAt, since),
        inArray(playerSessions.status, [
          "playing",
          "paused",
          "connected",
          "ready",
        ]),
        isNotNull(spotifyConnections.refreshTokenEnc),
        or(
          ne(playerSessions.stateSource, "sdk_browser"),
          ne(playerSessions.browserVisibility, "visible"),
          isNull(playerSessions.browserLastSeenAt),
          lte(playerSessions.browserLastSeenAt, healthySince),
        ),
        or(
          isNull(playbackPollCursors.nextTickAt),
          lte(playbackPollCursors.nextTickAt, now),
        ),
        or(
          isNull(playbackPollCursors.retryAfterUntil),
          lte(playbackPollCursors.retryAfterUntil, now),
        ),
        or(
          isNull(playbackPollCursors.lockedUntil),
          lte(playbackPollCursors.lockedUntil, now),
        ),
      ),
    )
    .orderBy(
      sql`CASE
        WHEN ${playbackTrackLifecycle.phase} = 'paused' THEN 0
        WHEN ${playbackTrackLifecycle.expectedEndAt} IS NOT NULL AND ${playbackTrackLifecycle.expectedEndAt} <= ${endingSoon} THEN 1
        ELSE 2
      END`,
      desc(playerSessions.updatedAt),
    );

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const row of rows) {
    if (seen.has(row.playerId)) continue;
    seen.add(row.playerId);
    ordered.push(row.playerId);
  }
  return ordered;
}

function resolveNextTickAt(result: TickPlayerResult): Date {
  const now = Date.now();
  if (!result.ok) {
    const delay =
      result.skipped === "no_token" ? IDLE_NEXT_TICK_MS : ERROR_BACKOFF_MS;
    return new Date(now + delay);
  }

  if (result.paused) {
    return new Date(now + PAUSED_NEXT_TICK_MS);
  }

  return new Date(now + PLAYING_NEXT_TICK_MS);
}

async function savePollCursor(result: TickPlayerResult): Promise<void> {
  const db = getDb();
  const now = new Date();
  const nextTickAt = resolveNextTickAt(result);
  const retryAfterUntil = result.ok ? null : nextTickAt;

  await db
    .insert(playbackPollCursors)
    .values({
      playerId: result.playerId,
      nextTickAt,
      retryAfterUntil,
      failureCount: result.ok ? 0 : 1,
      lockedUntil: null,
      lastTickAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: playbackPollCursors.playerId,
      set: {
        nextTickAt,
        retryAfterUntil,
        failureCount: result.ok
          ? 0
          : sql`${playbackPollCursors.failureCount} + 1`,
        lockedUntil: null,
        lastTickAt: now,
        updatedAt: now,
      },
    });
}

export async function runPlaybackOrchestrator(): Promise<RunPlaybackOrchestratorResult> {
  const playerIds = await listPlayerIdsForTick();
  const results: TickPlayerResult[] = [];
  let eventsEmitted = 0;

  logPlaybackLifecycle("tick", "orchestrator_run_start", {
    candidatePlayers: playerIds.length,
    playerIds,
  });

  for (const playerId of playerIds) {
    const result = await tickPlayer(playerId);
    await savePollCursor(result);
    results.push(result);
    eventsEmitted += result.eventsEmitted;
  }

  logPlaybackLifecycle("tick", "orchestrator_run_done", {
    playersProcessed: results.length,
    eventsEmitted,
    summary: results.map((r) => ({
      playerId: r.playerId,
      ok: r.ok,
      action: r.lifecycleAction,
      paused: r.paused,
      track: r.trackName,
      events: r.eventsEmitted,
    })),
  });

  return {
    playersProcessed: results.length,
    eventsEmitted,
    results,
  };
}
