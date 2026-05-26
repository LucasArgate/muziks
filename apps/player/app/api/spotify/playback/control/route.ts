import { sendAgentDebugLog } from "@muziks/utils";
import { NextResponse } from "next/server";

import { controlSpotifyPlaybackHandler } from "@/src/slices/playback/control-spotify-playback/handler";

function logSpotifyControlRouteDebug(
  message: string,
  data: Record<string, unknown>,
) {
  sendAgentDebugLog({
    sessionId: "cc732b",
    hypothesisId: "H6",
    location: "apps/player/app/api/spotify/playback/control/route.ts",
    message,
    data,
  });
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
    logSpotifyControlRouteDebug("server spotify control route request", {
      body,
    });
    const result = await controlSpotifyPlaybackHandler(body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_control_error";
    logSpotifyControlRouteDebug("server spotify control route error", {
      error: message,
      body,
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
