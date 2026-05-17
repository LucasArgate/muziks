import { getDb, profiles } from "@muziks/db";
import { eq } from "drizzle-orm";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type ParticipantSession =
  | { status: "anonymous" }
  | {
      status: "authenticated";
      userId: string;
      displayName: string | null;
      avatarUrl: string | null;
    };

export async function getParticipantSession(): Promise<ParticipantSession> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "anonymous" };
  }

  const db = getDb();
  const rows = await db
    .select({
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  const profile = rows[0];

  return {
    status: "authenticated",
    userId: user.id,
    displayName: profile?.displayName ?? user.user_metadata?.display_name ?? null,
    avatarUrl: profile?.avatarUrl ?? user.user_metadata?.avatar_url ?? null,
  };
}
