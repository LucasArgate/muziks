import { NextResponse } from "next/server";

import { getPlayerAppUrlFromRequest } from "@/src/config/spotify-env";
import { clearSpotifySession } from "@/src/lib/spotify-session";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearSpotifySession();

  return NextResponse.redirect(
    `${getPlayerAppUrlFromRequest(request)}/login`,
    { status: 303 },
  );
}
