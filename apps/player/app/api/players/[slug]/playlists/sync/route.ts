import { NextResponse } from "next/server";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import { syncProviderPlaylistsHandler } from "@/src/slices/playlists/sync-provider-playlists/handler";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await syncProviderPlaylistsHandler(access.playerId, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "sync_playlists_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
