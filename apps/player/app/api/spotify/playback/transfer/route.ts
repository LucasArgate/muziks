import { sendAgentDebugLog } from "@muziks/utils";
import { NextResponse } from "next/server";

import { transferSpotifyPlaybackHandler } from "@/src/slices/playback/transfer-spotify-playback/handler";

function logSpotifyTransferRouteDebug(
  message: string,
  data: Record<string, unknown>,
) {
  sendAgentDebugLog({
    sessionId: "cc732b",
    hypothesisId: "H5",
    location: "apps/player/app/api/spotify/playback/transfer/route.ts",
    message,
    data,
  });
}

export async function PUT(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
    logSpotifyTransferRouteDebug("server spotify transfer route request", {
      body,
    });
    const result = await transferSpotifyPlaybackHandler(body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_transfer_error";
    logSpotifyTransferRouteDebug("server spotify transfer route error", {
      error: message,
      body,
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
