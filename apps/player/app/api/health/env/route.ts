import { NextResponse } from "next/server";

import { hasSupabaseServiceRoleKey } from "@/src/lib/supabase/env";

/** Dev: confere se o Next carregou as variáveis (sem expor valores). */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnon: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRole: hasSupabaseServiceRoleKey(),
    databaseUrl: Boolean(process.env.DATABASE_URL),
    spotifyClientId: Boolean(process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID),
    spotifyClientSecret: Boolean(process.env.SPOTIFY_CLIENT_SECRET?.trim()),
    playerAppUrl: process.env.NEXT_PUBLIC_PLAYER_APP_URL ?? null,
    webAppUrl: process.env.NEXT_PUBLIC_WEB_APP_URL ?? null,
  });
}
