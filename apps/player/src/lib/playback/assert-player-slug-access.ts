import { getDb, players } from "@muziks/db";
import { eq } from "drizzle-orm";

import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";

export type PlayerSlugAccess = {
  playerId: string;
  slug: string;
  ownerId: string;
};

export async function assertPlayerSlugAccess(
  slug: string,
): Promise<PlayerSlugAccess | null> {
  const session = await getMuziksSession();
  if (session.status !== "authenticated") {
    return null;
  }

  if (session.player.slug !== slug) {
    return null;
  }

  const db = getDb();
  const rows = await db
    .select({ id: players.id, slug: players.slug, ownerId: players.ownerId })
    .from(players)
    .where(eq(players.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row || row.ownerId !== session.userId) {
    return null;
  }

  return {
    playerId: row.id,
    slug: row.slug,
    ownerId: row.ownerId,
  };
}
