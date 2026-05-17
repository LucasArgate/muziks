import { NextResponse } from "next/server";
import { getPlayerAppUrl } from "@/src/config/spotify-env";
import { clearSpotifySession } from "@/src/lib/spotify-session";

export async function POST(request: Request) {
  await clearSpotifySession();

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  const redirect = slug
    ? `${getPlayerAppUrl()}/${slug}`
    : getPlayerAppUrl();

  return NextResponse.redirect(redirect, { status: 303 });
}
