import { NextResponse } from "next/server";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import { getDefaultPlaylistHandler } from "@/src/slices/playlists/get-default-playlist/handler";
import { setDefaultPlaylistHandler } from "@/src/slices/playlists/set-default-playlist/handler";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const result = await getDefaultPlaylistHandler(access.playerId);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "default_playlist_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await setDefaultPlaylistHandler(access.playerId, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "set_default_playlist_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
