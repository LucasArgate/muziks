"use server";

import { getDb, players } from "@muziks/db";
import {
  createPlayerInputSchema,
  isValidPlayerSlug,
  normalizePlayerSlug,
} from "@muziks/types";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { requireMuziksSession } from "@/src/lib/auth/require-session";

export type CreatePlayerResult =
  | { ok: true }
  | { ok: false; error: string };

export async function createPlayerAction(
  _prev: CreatePlayerResult,
  formData: FormData,
): Promise<CreatePlayerResult> {
  const session = await requireMuziksSession();
  if (session.status === "authenticated") {
    redirect(`/${session.player.slug}`);
  }

  const parsed = createPlayerInputSchema.safeParse({
    slug: formData.get("slug"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos. Verifique slug e nome." };
  }

  const slug = normalizePlayerSlug(parsed.data.slug);
  const displayName = parsed.data.displayName.trim();

  if (!isValidPlayerSlug(slug)) {
    return {
      ok: false,
      error:
        "Slug inválido ou reservado. Use letras minúsculas, números e hífens (3–50 caracteres).",
    };
  }

  const db = getDb();
  const existing = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.slug, slug))
    .limit(1);

  if (existing[0]) {
    return { ok: false, error: "Este slug já está em uso." };
  }

  await db.insert(players).values({
    slug,
    displayName,
    ownerId: session.userId,
    status: "active",
  });

  redirect(`/${slug}`);
}
