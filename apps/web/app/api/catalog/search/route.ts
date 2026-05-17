import { getPlayerIdBySlug } from "@muziks/db";
import { searchTracks } from "@muziks/spotify";
import { catalogSearchResultSchema } from "@muziks/types";
import { NextResponse } from "next/server";

import { getAccessTokenForPlayer } from "@/src/lib/spotify/owner-token-vault";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const slug = searchParams.get("slug")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "query_too_short" }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "slug_required" }, { status: 400 });
  }

  try {
    const playerId = await getPlayerIdBySlug(slug);
    if (!playerId) {
      return NextResponse.json({ error: "player_not_found" }, { status: 404 });
    }

    const accessToken = await getAccessTokenForPlayer(playerId);
    if (!accessToken) {
      return NextResponse.json(
        { error: "catalog_unavailable", message: "Este espaço ainda não conectou o catálogo." },
        { status: 503 },
      );
    }

    const tracks = await searchTracks(accessToken, q);
    const result = catalogSearchResultSchema.parse({ tracks });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "search_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
