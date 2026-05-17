import { NextResponse } from "next/server";

import { getPlayerAppUrl } from "@/src/config/spotify-env";
import { clearSpotifySession } from "@/src/lib/spotify-session";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearSpotifySession();

  return NextResponse.redirect(`${getPlayerAppUrl()}/login`, { status: 303 });
}
