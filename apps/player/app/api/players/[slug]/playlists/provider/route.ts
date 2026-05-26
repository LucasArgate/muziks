import { NextResponse } from "next/server";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import {
  getProviderPlaylistSnapshotHandler,
  listProviderPlaylistsHandler,
} from "@/src/slices/playlists/list-provider-playlists/handler";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function queryToObject(request: Request): Record<string, string> {
  const url = new URL(request.url);
  return Object.fromEntries(url.searchParams.entries());
}

export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const query = queryToObject(request);
    const result = query.providerPlaylistId
      ? await getProviderPlaylistSnapshotHandler(query.providerPlaylistId)
      : await listProviderPlaylistsHandler(query);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "provider_playlists_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
