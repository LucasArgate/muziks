import { and, eq, ilike, or, sql } from "drizzle-orm";

import { getDb } from "../client";
import { players } from "../schema/players";

export type DiscoverPlayerResult = {
  id: string;
  slug: string;
  displayName: string;
  distanceM?: number;
};

const DISCOVER_LIMIT = 20;

export async function discoverPlayersByQuery(
  query: string,
): Promise<DiscoverPlayerResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const pattern = `%${trimmed.replace(/[%_]/g, "\\$&")}%`;
  const db = getDb();

  const rows = await db
    .select({
      id: players.id,
      slug: players.slug,
      displayName: players.displayName,
    })
    .from(players)
    .where(
      and(
        eq(players.status, "active"),
        or(
          ilike(players.slug, pattern),
          ilike(players.displayName, pattern),
        ),
      ),
    )
    .limit(DISCOVER_LIMIT);

  return rows;
}

export async function discoverPlayersByGeo(
  lat: number,
  lng: number,
): Promise<DiscoverPlayerResult[]> {
  const db = getDb();

  const distanceExpr = sql<number>`(
    6371000 * acos(
      least(1.0, greatest(-1.0,
        cos(radians(${lat})) * cos(radians(${players.latitude}))
        * cos(radians(${players.longitude}) - radians(${lng}))
        + sin(radians(${lat})) * sin(radians(${players.latitude}))
      ))
    )
  )`;

  const rows = await db
    .select({
      id: players.id,
      slug: players.slug,
      displayName: players.displayName,
      distanceM: distanceExpr,
    })
    .from(players)
    .where(
      and(
        eq(players.status, "active"),
        eq(players.geoDiscoveryEnabled, true),
        sql`${players.latitude} IS NOT NULL`,
        sql`${players.longitude} IS NOT NULL`,
        sql`${distanceExpr} <= ${players.discoveryRadiusM}`,
      ),
    )
    .orderBy(distanceExpr)
    .limit(DISCOVER_LIMIT);

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    displayName: row.displayName,
    distanceM: Math.round(Number(row.distanceM)),
  }));
}
