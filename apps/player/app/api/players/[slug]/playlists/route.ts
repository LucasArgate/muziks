import { NextResponse } from "next/server";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import {
  getSavedPlaylistDetailsHandler,
  listSavedPlaylistsHandler,
} from "@/src/slices/playlists/list-saved-playlists/handler";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const playlistId = url.searchParams.get("playlistId");
    const result = playlistId
      ? await getSavedPlaylistDetailsHandler(access.playerId, playlistId)
      : await listSavedPlaylistsHandler(access.playerId);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "saved_playlists_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
