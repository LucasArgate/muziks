import {
  discoverPlayersByGeo,
  discoverPlayersByQuery,
} from "@muziks/db";
import { discoverPlayerCardSchema } from "@muziks/types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");

  try {
    if (latRaw != null && lngRaw != null) {
      const lat = Number(latRaw);
      const lng = Number(lngRaw);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return NextResponse.json(
          { error: "invalid_coordinates" },
          { status: 400 },
        );
      }

      const players = await discoverPlayersByGeo(lat, lng);
      return NextResponse.json({
        players: players.map((p) => discoverPlayerCardSchema.parse(p)),
      });
    }

    if (!query) {
      return NextResponse.json({ players: [] });
    }

    const players = await discoverPlayersByQuery(query);
    return NextResponse.json({
      players: players.map((p) => discoverPlayerCardSchema.parse(p)),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "discover_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
