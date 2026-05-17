import { NextResponse } from "next/server";
import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";

/** Fornece access token ao Web Playback SDK (sem expor refresh). */
export async function GET() {
  const accessToken = await getOwnerSpotifyAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  return NextResponse.json({ access_token: accessToken });
}
