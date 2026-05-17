import { getPlayerIdBySlug, getPublicPlaybackSession } from "@muziks/db";
import { publicPlaybackSessionSchema } from "@muziks/types";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const playerId = await getPlayerIdBySlug(slug);
    if (!playerId) {
      return NextResponse.json({ error: "player_not_found" }, { status: 404 });
    }

    const row = await getPublicPlaybackSession(playerId);
    if (!row) {
      return NextResponse.json({ session: null });
    }

    const session = publicPlaybackSessionSchema.parse({
      trackName: row.trackName,
      artistName: row.artistName,
      albumImageUrl: row.albumImageUrl,
      progressMs: row.progressMs,
      durationMs: row.durationMs,
      paused: row.paused,
      status: row.status,
      stateVersion: row.stateVersion,
      updatedAt: row.updatedAt.toISOString(),
    });

    return NextResponse.json({ session });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "playback_fetch_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
