import {
  getDb,
  playbackPollCursors,
  playbackTrackLifecycle,
  playerSessions,
  players,
  spotifyConnections,
} from "@muziks/db";
import {
  getCurrentPlayback,
  getPlaybackQueue,
  normalizeApiPlaybackState,
  normalizeSpotifyPlaybackQueue,
} from "@muziks/spotify";
import { normalizedSpotifyPlaybackQueueSchema } from "@muziks/types";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import {
  and,
  asc,
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

import type {
  BackgroundPlaybackSession,
  BackgroundPlaybackOrchestratorPorts,
  BackgroundTickSampleHook,
  PlaybackAccessTokenProvider,
  PlaybackSessionSnapshotPublisher,
  SpotifyQueueSnapshotPublisher,
  TickPlayerResult,
} from "../application/background-playback-orchestrator";
import {
  resolvePersistedProgressMs,
  resolvePlaybackSessionStatus,
} from "../domain/playback-state";
import {
  PLAYBACK_ACTIVE_WINDOW_MS,
  PLAYBACK_BROWSER_HEALTH_WINDOW_MS,
  PLAYBACK_ENDING_SOON_MS,
  PLAYBACK_TICK_BATCH_SIZE,
  PLAYBACK_TICK_LOCK_MS,
  resolveNextPlaybackTickAt,
} from "../domain/polling";

export type PlaybackSessionRow = typeof playerSessions.$inferSelect;

function rowToBackgroundSession(row: PlaybackSessionRow): BackgroundPlaybackSession {
  return {
    playerId: row.playerId,
    currentTrackUri: row.currentTrackUri,
    trackName: row.trackName,
    artistName: row.artistName,
    albumImageUrl: row.albumImageUrl,
    progressMs: row.progressMs,
    durationMs: row.durationMs,
    paused: row.paused,
    activeDeviceId: row.activeDeviceId,
    status: row.status,
    lastError: row.lastError,
    updatedAt: row.updatedAt,
    spotifyUserId: row.spotifyUserId,
    syncMode: row.syncMode ?? "api_device",
    preferredDeviceId: row.preferredDeviceId,
    activeDeviceName: row.activeDeviceName,
    sdkDeviceId: row.sdkDeviceId,
    browserInstanceId: row.browserInstanceId,
    browserVisibility: row.browserVisibility ?? "unknown",
    browserLastSeenAt: row.browserLastSeenAt,
    stateVersion: row.stateVersion ?? 0,
    stateSource: row.stateSource ?? "worker_api",
    authority: row.authority ?? "worker",
    sourceUpdatedAt: row.sourceUpdatedAt,
  };
}

export type DrizzleSpotifyBackgroundPlaybackOptions = {
  getAccessToken: PlaybackAccessTokenProvider;
  publishSessionSnapshot?: PlaybackSessionSnapshotPublisher;
  publishSpotifyQueueSnapshot?: SpotifyQueueSnapshotPublisher;
  afterSample?: BackgroundTickSampleHook;
};

/** Claim per-player tick lock; returns playerIds that were locked for this worker. */
export async function claimPlayersForBackgroundTick(
  playerIds: string[],
  now = new Date(),
): Promise<string[]> {
  return lockPlayerIdsForBackgroundTick(playerIds, now);
}

export async function isPlayerEligibleForBackgroundTick(
  playerId: string,
  now = new Date(),
): Promise<boolean> {
  const db = getDb();
  const since = new Date(now.getTime() - PLAYBACK_ACTIVE_WINDOW_MS);
  const healthySince = new Date(
    now.getTime() - PLAYBACK_BROWSER_HEALTH_WINDOW_MS,
  );

  const rows = await db
    .select({ playerId: playerSessions.playerId })
    .from(playerSessions)
    .innerJoin(players, eq(players.id, playerSessions.playerId))
    .innerJoin(
      spotifyConnections,
      eq(spotifyConnections.userId, players.ownerId),
    )
    .leftJoin(
      playbackPollCursors,
      eq(playbackPollCursors.playerId, playerSessions.playerId),
    )
    .where(
      and(
        eq(playerSessions.playerId, playerId),
        gt(playerSessions.updatedAt, since),
        inArray(playerSessions.status, [
          "playing",
          "paused",
          "connected",
          "ready",
        ]),
        isNotNull(spotifyConnections.refreshTokenEnc),
        workerShouldSuperviseSessionCondition(healthySince),
        or(
          isNull(playbackPollCursors.retryAfterUntil),
          lte(playbackPollCursors.retryAfterUntil, now),
        ),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

function workerShouldSuperviseSessionCondition(healthySince: Date) {
  return or(
    ne(playerSessions.syncMode, "sdk"),
    ne(playerSessions.stateSource, "sdk_browser"),
    ne(playerSessions.browserVisibility, "visible"),
    isNull(playerSessions.browserLastSeenAt),
    lte(playerSessions.browserLastSeenAt, healthySince),
  );
}

async function lockPlayerIdsForBackgroundTick(
  playerIds: string[],
  now: Date,
): Promise<string[]> {
  if (playerIds.length === 0) {
    return [];
  }

  const db = getDb();
  const lockedUntil = new Date(now.getTime() + PLAYBACK_TICK_LOCK_MS);

  await db
    .insert(playbackPollCursors)
    .values(
      playerIds.map((playerId) => ({
        playerId,
        nextTickAt: now,
        lockedUntil,
        lastTickAt: null,
        updatedAt: now,
      })),
    )
    .onConflictDoUpdate({
      target: playbackPollCursors.playerId,
      set: {
        lockedUntil,
        updatedAt: now,
      },
      where: or(
        isNull(playbackPollCursors.lockedUntil),
        lte(playbackPollCursors.lockedUntil, now),
      ),
    });

  const claimed = await db
    .select({ playerId: playbackPollCursors.playerId })
    .from(playbackPollCursors)
    .where(
      and(
        inArray(playbackPollCursors.playerId, playerIds),
        gt(playbackPollCursors.lockedUntil, now),
      ),
    );

  return claimed.map((row) => row.playerId);
}

async function listPlayerIdsForBackgroundTick(): Promise<string[]> {
  const db = getDb();
  const now = new Date();
  const since = new Date(now.getTime() - PLAYBACK_ACTIVE_WINDOW_MS);
  const healthySince = new Date(
    now.getTime() - PLAYBACK_BROWSER_HEALTH_WINDOW_MS,
  );
  const endingSoonIso = new Date(
    now.getTime() + PLAYBACK_ENDING_SOON_MS,
  ).toISOString();

  const rows = await db
    .select({ playerId: playerSessions.playerId })
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
        workerShouldSuperviseSessionCondition(healthySince),
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
        WHEN ${playbackTrackLifecycle.expectedEndAt} IS NOT NULL AND ${playbackTrackLifecycle.expectedEndAt} <= ${endingSoonIso}::timestamptz THEN 0
        WHEN ${playbackTrackLifecycle.phase} = 'paused' THEN 2
        ELSE 1
      END`,
      asc(playbackPollCursors.nextTickAt),
      asc(playbackPollCursors.lastTickAt),
      desc(playerSessions.updatedAt),
    )
    .limit(PLAYBACK_TICK_BATCH_SIZE);

  return lockPlayerIdsForBackgroundTick(
    [...new Set(rows.map((row) => row.playerId))],
    now,
  );
}

async function getPlaybackSessionRow(
  playerId: string,
): Promise<PlaybackSessionRow | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(playerSessions)
    .where(eq(playerSessions.playerId, playerId))
    .limit(1);
  return rows[0] ?? null;
}

async function upsertWorkerPlaybackSession(input: {
  playerId: string;
  state: NormalizedSpotifyPlayerState;
  activeDeviceName?: string | null;
  existing: BackgroundPlaybackSession | null;
}): Promise<PlaybackSessionRow> {
  const db = getDb();
  const now = new Date();
  const { playerId, state, existing } = input;
  const nextVersion = (existing?.stateVersion ?? 0) + 1;

  const values = {
    playerId,
    spotifyUserId: existing?.spotifyUserId ?? null,
    activeDeviceId: state.deviceId,
    currentTrackUri: state.trackUri,
    trackName: state.trackName,
    artistName: state.artistName,
    albumImageUrl: state.albumImageUrl ?? null,
    progressMs: resolvePersistedProgressMs(state),
    sourceUpdatedAt: state.positionUpdatedAt
      ? new Date(state.positionUpdatedAt)
      : now,
    durationMs: state.durationMs,
    paused: state.paused,
    status: resolvePlaybackSessionStatus(state),
    lastError: state.lastError ?? null,
    syncMode: existing?.syncMode ?? "api_device",
    preferredDeviceId: existing?.preferredDeviceId ?? null,
    activeDeviceName: input.activeDeviceName ?? existing?.activeDeviceName ?? null,
    stateSource: "worker_api",
    authority: "worker",
    sdkDeviceId: existing?.sdkDeviceId ?? null,
    browserInstanceId: existing?.browserInstanceId ?? null,
    browserVisibility: existing?.browserVisibility ?? "unknown",
    browserLastSeenAt: existing?.browserLastSeenAt ?? null,
    stateVersion: nextVersion,
    updatedAt: now,
  };

  await db
    .insert(playerSessions)
    .values(values)
    .onConflictDoUpdate({
      target: playerSessions.playerId,
      set: {
        spotifyUserId: values.spotifyUserId,
        activeDeviceId: values.activeDeviceId,
        currentTrackUri: values.currentTrackUri,
        trackName: values.trackName,
        artistName: values.artistName,
        albumImageUrl: values.albumImageUrl,
        progressMs: values.progressMs,
        durationMs: values.durationMs,
        paused: values.paused,
        status: values.status,
        lastError: values.lastError,
        syncMode: values.syncMode,
        preferredDeviceId: values.preferredDeviceId,
        activeDeviceName: values.activeDeviceName,
        stateSource: values.stateSource,
        authority: values.authority,
        sdkDeviceId: values.sdkDeviceId,
        browserInstanceId: values.browserInstanceId,
        browserVisibility: values.browserVisibility,
        browserLastSeenAt: values.browserLastSeenAt,
        sourceUpdatedAt: values.sourceUpdatedAt,
        stateVersion: values.stateVersion,
        updatedAt: values.updatedAt,
      },
    });

  const row = await getPlaybackSessionRow(playerId);
  if (!row) {
    throw new Error("playback_session_persist_failed");
  }
  return rowToBackgroundSession(row);
}

async function savePlaybackPollCursor(result: TickPlayerResult): Promise<void> {
  const db = getDb();
  const now = new Date();
  const nextTickAt = resolveNextPlaybackTickAt(result);
  const retryAfterUntil =
    result.ok || result.skipped === "no_token" ? null : nextTickAt;

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

export function createDrizzleSpotifyBackgroundPlaybackPorts(
  options: DrizzleSpotifyBackgroundPlaybackOptions,
): BackgroundPlaybackOrchestratorPorts {
  return {
    getAccessToken: options.getAccessToken,
    publishSessionSnapshot: options.publishSessionSnapshot,
    listPlayerIdsForTick: listPlayerIdsForBackgroundTick,
    getPlaybackSession: async (playerId) => {
      const row = await getPlaybackSessionRow(playerId);
      return row ? rowToBackgroundSession(row) : null;
    },
    upsertWorkerPlaybackSession,
    savePollCursor: savePlaybackPollCursor,
    fetchCurrentPlayback: async (accessToken) => {
      const raw = await getCurrentPlayback({ accessToken });
      return {
        state: normalizeApiPlaybackState(raw),
        activeDeviceName: raw?.device?.name ?? null,
      };
    },
    fetchSpotifyQueue: async (accessToken) => {
      const raw = await getPlaybackQueue({ accessToken });
      return normalizedSpotifyPlaybackQueueSchema.parse(
        normalizeSpotifyPlaybackQueue(raw),
      );
    },
    publishSpotifyQueueSnapshot: options.publishSpotifyQueueSnapshot,
    afterSample: options.afterSample,
  };
}
