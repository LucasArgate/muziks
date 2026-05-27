import { eq } from "drizzle-orm";

import { getDb } from "../client";
import { playerSessions } from "../schema/player-sessions";

export type PublicPlaybackSessionRow = {
  currentTrackUri: string | null;
  trackName: string | null;
  artistName: string | null;
  albumImageUrl: string | null;
  progressMs: number;
  durationMs: number;
  paused: boolean;
  status: string;
  stateVersion: number;
  progressUpdatedAt: Date | null;
  updatedAt: Date;
};

export async function getPublicPlaybackSession(
  playerId: string,
): Promise<PublicPlaybackSessionRow | null> {
  const db = getDb();
  const rows = await db
    .select({
      currentTrackUri: playerSessions.currentTrackUri,
      trackName: playerSessions.trackName,
      artistName: playerSessions.artistName,
      albumImageUrl: playerSessions.albumImageUrl,
      progressMs: playerSessions.progressMs,
      durationMs: playerSessions.durationMs,
      paused: playerSessions.paused,
      status: playerSessions.status,
      stateVersion: playerSessions.stateVersion,
      progressUpdatedAt: playerSessions.sourceUpdatedAt,
      updatedAt: playerSessions.updatedAt,
    })
    .from(playerSessions)
    .where(eq(playerSessions.playerId, playerId))
    .limit(1);

  return rows[0] ?? null;
}
