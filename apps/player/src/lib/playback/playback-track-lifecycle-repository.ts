import {
  getDb,
  playbackTrackEvents,
  playbackTrackLifecycle,
} from "@muziks/db";
import type {
  PlaybackTrackEvent,
  PlaybackTrackEventType,
  PlaybackTrackLifecyclePhase,
} from "@muziks/types";
import { eq } from "drizzle-orm";

export type PlaybackTrackLifecycleRow = {
  playerId: string;
  activeTrackUri: string | null;
  activeSpotifyTrackId: string | null;
  startedAt: Date | null;
  positionAtStartMs: number;
  durationMs: number;
  expectedEndAt: Date | null;
  phase: PlaybackTrackLifecyclePhase;
  updatedAt: Date;
};

function rowToLifecycle(
  row: typeof playbackTrackLifecycle.$inferSelect,
): PlaybackTrackLifecycleRow {
  return {
    playerId: row.playerId,
    activeTrackUri: row.activeTrackUri,
    activeSpotifyTrackId: row.activeSpotifyTrackId,
    startedAt: row.startedAt,
    positionAtStartMs: row.positionAtStartMs,
    durationMs: row.durationMs,
    expectedEndAt: row.expectedEndAt,
    phase: row.phase as PlaybackTrackLifecyclePhase,
    updatedAt: row.updatedAt,
  };
}

function rowToEvent(
  row: typeof playbackTrackEvents.$inferSelect,
): PlaybackTrackEvent {
  let metadata: Record<string, unknown> | null = null;
  if (row.metadata) {
    try {
      metadata = JSON.parse(row.metadata) as Record<string, unknown>;
    } catch {
      metadata = null;
    }
  }

  return {
    id: row.id,
    playerId: row.playerId,
    type: row.type as PlaybackTrackEventType,
    trackUri: row.trackUri,
    spotifyTrackId: row.spotifyTrackId,
    startedAt: row.startedAt?.toISOString() ?? null,
    occurredAt: row.occurredAt.toISOString(),
    metadata,
  };
}

export async function getPlaybackTrackLifecycle(
  playerId: string,
): Promise<PlaybackTrackLifecycleRow | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(playbackTrackLifecycle)
    .where(eq(playbackTrackLifecycle.playerId, playerId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return rowToLifecycle(row);
}

export async function upsertPlaybackTrackLifecycle(
  input: Omit<PlaybackTrackLifecycleRow, "updatedAt">,
): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db
    .insert(playbackTrackLifecycle)
    .values({
      playerId: input.playerId,
      activeTrackUri: input.activeTrackUri,
      activeSpotifyTrackId: input.activeSpotifyTrackId,
      startedAt: input.startedAt,
      positionAtStartMs: input.positionAtStartMs,
      durationMs: input.durationMs,
      expectedEndAt: input.expectedEndAt,
      phase: input.phase,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: playbackTrackLifecycle.playerId,
      set: {
        activeTrackUri: input.activeTrackUri,
        activeSpotifyTrackId: input.activeSpotifyTrackId,
        startedAt: input.startedAt,
        positionAtStartMs: input.positionAtStartMs,
        durationMs: input.durationMs,
        expectedEndAt: input.expectedEndAt,
        phase: input.phase,
        updatedAt: now,
      },
    });
}

/** Idempotent append; returns event when inserted, null on duplicate. */
export async function insertPlaybackTrackEvent(input: {
  playerId: string;
  type: PlaybackTrackEventType;
  trackUri: string | null;
  spotifyTrackId: string | null;
  startedAt: Date | null;
  metadata?: Record<string, unknown>;
}): Promise<PlaybackTrackEvent | null> {
  const db = getDb();
  const occurredAt = new Date();
  const startedAt = input.startedAt ?? occurredAt;

  const rows = await db
    .insert(playbackTrackEvents)
    .values({
      playerId: input.playerId,
      type: input.type,
      trackUri: input.trackUri,
      spotifyTrackId: input.spotifyTrackId,
      startedAt,
      occurredAt,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    })
    .onConflictDoNothing({
      target: [
        playbackTrackEvents.playerId,
        playbackTrackEvents.type,
        playbackTrackEvents.spotifyTrackId,
        playbackTrackEvents.startedAt,
      ],
    })
    .returning();

  const row = rows[0];
  if (!row) return null;
  return rowToEvent(row);
}
