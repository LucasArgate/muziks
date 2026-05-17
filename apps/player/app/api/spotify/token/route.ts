import { NextResponse } from "next/server";
import { getValidAccessToken } from "@/src/lib/spotify-session";

/** Fornece access token ao Web Playback SDK (sem expor refresh). */
export async function GET() {
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  return NextResponse.json({ access_token: accessToken });
}
