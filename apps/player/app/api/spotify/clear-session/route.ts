import { type NextRequest, NextResponse } from "next/server";

import { getPlayerAppUrlFromRequest } from "@/src/config/spotify-env";
import { clearSpotifySessionOnResponse } from "@/src/lib/spotify-session";

/** Clears revoked/stale Spotify cookies (Route Handler — cookie mutation allowed). */
export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("return")?.trim();
  const appUrl = getPlayerAppUrlFromRequest(request);
  const redirectUrl =
    returnTo && returnTo.startsWith("/")
      ? `${appUrl}${returnTo}`
      : `${appUrl}/login`;

  const response = NextResponse.redirect(redirectUrl, { status: 303 });
  clearSpotifySessionOnResponse(response);
  return response;
}
