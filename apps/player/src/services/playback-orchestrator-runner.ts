import {
  getDb,
  playbackTrackLifecycle,
  playerSessions,
  players,
  spotifyConnections,
} from "@muziks/db";
import { and, desc, eq, gt, inArray, isNotNull, sql } from "drizzle-orm";

import { logPlaybackLifecycle } from "@/src/lib/playback/playback-lifecycle-log";

import { tickPlayer, type TickPlayerResult } from "./playback-orchestrator";

const ACTIVE_WINDOW_MS = 4 * 60 * 60 * 1000;
const ENDING_SOON_MS = 90_000;

export type RunPlaybackOrchestratorResult = {
  playersProcessed: number;
  eventsEmitted: number;
  results: TickPlayerResult[];
};

async function listPlayerIdsForTick(): Promise<string[]> {
  const db = getDb();
  const since = new Date(Date.now() - ACTIVE_WINDOW_MS);
  const endingSoon = new Date(Date.now() + ENDING_SOON_MS);

  const rows = await db
    .select({
      playerId: playerSessions.playerId,
      expectedEndAt: playbackTrackLifecycle.expectedEndAt,
      lifecyclePhase: playbackTrackLifecycle.phase,
      updatedAt: playerSessions.updatedAt,
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
