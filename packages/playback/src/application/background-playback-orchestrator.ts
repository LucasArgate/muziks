import {
  getDb,
  playbackPollCursors,
  playbackTrackLifecycle,
  playerSessions,
  players,
  spotifyConnections,
} from "@muziks/db";
import { getCurrentPlayback, normalizeApiPlaybackState } from "@muziks/spotify";
import type {
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
} from "@muziks/types";
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

import {
  hasSemanticPlaybackChange,
  playbackSessionToNormalized,
  resolvePersistedProgressMs,
} from "../domain/playback-state";
import {
  PLAYBACK_ACTIVE_WINDOW_MS,
  PLAYBACK_BROWSER_HEALTH_WINDOW_MS,
  PLAYBACK_ENDING_SOON_MS,
  resolveNextPlaybackTickAt,
} from "../domain/polling";

export type PlaybackSessionRow = typeof playerSessions.$inferSelect;

export type TickPlayerResult = {
  playerId: string;
  ok: boolean;
  skipped?: "no_token" | "spotify_error";
  eventsEmitted: number;
  sessionUpdated: boolean;
  paused?: boolean;
  trackName?: string | null;
};

export type RunPlaybackOrchestratorResult = {
  playersProcessed: number;
  eventsEmitted: number;
  results: TickPlayerResult[];
};

export type PlaybackAccessTokenProvider = (
  playerId: string,
) => Promise<string | null>;

export type PlaybackSessionSnapshotPublisher = (input: {
  playerId: string;
  session: PlaybackSessionRow;
}) => Promise<void>;

export type BackgroundPlaybackOrchestratorDeps = {
  getAccessToken: PlaybackAccessTokenProvider;
  publishSessionSnapshot?: PlaybackSessionSnapshotPublisher;
};

export async function listPlayerIdsForBackgroundTick(): Promise<string[]> {
  const db = getDb();
  const now = new Date();
  const since = new Date(now.getTime() - PLAYBACK_ACTIVE_WINDOW_MS);
  const healthySince = new Date(
    now.getTime() - PLAYBACK_BROWSER_HEALTH_WINDOW_MS,
  );
  const endingSoon = new Date(now.getTime() + PLAYBACK_ENDING_SOON_MS);

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

  return [...new Set(rows.map((row) => row.playerId))];
}

export async function getPlaybackSessionRow(
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

function resolvePlaybackStatus(
  state: NormalizedSpotifyPlayerState,
): PlaybackSessionStatus {
  return (
    state.status ?? (state.paused ? "paused" : state.trackUri ? "playing" : "idle")
  );
}

export async function upsertWorkerPlaybackSession(input: {
  playerId: string;
  state: NormalizedSpotifyPlayerState;
  activeDeviceName?: string | null;
  existing: PlaybackSessionRow | null;
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
    progressMs: resolvePersistedProgressMs(state, now),
    durationMs: state.durationMs,
    paused: state.paused,
    status: resolvePlaybackStatus(state),
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
    sourceUpdatedAt: now,
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
  return row;
}

export async function savePlaybackPollCursor(
  result: TickPlayerResult,
): Promise<void> {
  const db = getDb();
  const now = new Date();
  const nextTickAt = resolveNextPlaybackTickAt(result);
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

export async function tickBackgroundPlayer(
  playerId: string,
  deps: BackgroundPlaybackOrchestratorDeps,
): Promise<TickPlayerResult> {
  const accessToken = await deps.getAccessToken(playerId);

  if (!accessToken) {
    return {
      playerId,
      ok: false,
      skipped: "no_token",
      eventsEmitted: 0,
      sessionUpdated: false,
    };
  }

  let raw;
  try {
    raw = await getCurrentPlayback({ accessToken });
  } catch {
    return {
      playerId,
      ok: false,
      skipped: "spotify_error",
      eventsEmitted: 0,
      sessionUpdated: false,
    };
  }

  const state = normalizeApiPlaybackState(raw);
  const existing = await getPlaybackSessionRow(playerId);
  const prevState = existing ? playbackSessionToNormalized(existing) : null;
  const nextSession = await upsertWorkerPlaybackSession({
    playerId,
    state,
    activeDeviceName: raw?.device?.name ?? null,
    existing,
  });

  if (hasSemanticPlaybackChange(prevState, state) && deps.publishSessionSnapshot) {
    await deps.publishSessionSnapshot({
      playerId,
      session: nextSession,
    }).catch(() => {
      // Realtime fan-out is best-effort; persisted state remains authoritative.
    });
  }

  return {
    playerId,
    ok: true,
    eventsEmitted: 0,
    sessionUpdated: true,
    paused: state.paused,
    trackName: state.trackName,
  };
}

export async function runBackgroundPlaybackOrchestrator(
  deps: BackgroundPlaybackOrchestratorDeps,
): Promise<RunPlaybackOrchestratorResult> {
  const playerIds = await listPlayerIdsForBackgroundTick();
  const results: TickPlayerResult[] = [];
  let eventsEmitted = 0;

  for (const playerId of playerIds) {
    const result = await tickBackgroundPlayer(playerId, deps);
    await savePlaybackPollCursor(result);
    results.push(result);
    eventsEmitted += result.eventsEmitted;
  }

  return {
    playersProcessed: results.length,
    eventsEmitted,
    results,
  };
}
