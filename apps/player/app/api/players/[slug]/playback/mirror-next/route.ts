import { NextResponse } from "next/server";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import { mirrorNextToSpotifyQueueHandler } from "@/src/slices/playback/mirror-next-to-spotify-queue/handler";

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
    const result = await mirrorNextToSpotifyQueueHandler(access.playerId, body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "mirror_next_failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
