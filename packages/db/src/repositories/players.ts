import { players } from "../schema/players";
import { getDb } from "../client";
import { eq } from "drizzle-orm";

export async function getPlayerIdBySlug(
  slug: string,
): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.slug, slug))
    .limit(1);

  return rows[0]?.id ?? null;
}
