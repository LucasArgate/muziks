import type { OwnerAuthState } from "@muziks/types";

import { loadOwnerContext } from "@/src/lib/auth/owner-repository";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function getMuziksSession(): Promise<OwnerAuthState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "anonymous" };
  }

  const context = await loadOwnerContext(user.id);
  if (!context) {
    return { status: "anonymous" };
  }

  if (context.player) {
    return {
      status: "authenticated",
      userId: user.id,
      profile: context.profile,
      player: context.player,
    };
  }

  return {
    status: "authenticated_no_player",
    userId: user.id,
    profile: context.profile,
  };
}
