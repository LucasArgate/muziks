import { NextResponse } from "next/server";

import { getPlayerAppUrlFromRequest } from "@/src/config/spotify-env";
import { clearSpotifySession } from "@/src/lib/spotify-session";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  await clearSpotifySession();

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  const appUrl = getPlayerAppUrlFromRequest(request);
  const redirect = slug ? `${appUrl}/${slug}` : `${appUrl}/login`;

  return NextResponse.redirect(redirect, { status: 303 });
}
