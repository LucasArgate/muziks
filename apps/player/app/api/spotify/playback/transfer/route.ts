import { NextResponse } from "next/server";

import { transferSpotifyPlaybackHandler } from "@/src/slices/playback/transfer-spotify-playback/handler";

function logSpotifyTransferRouteDebug(
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "cc732b",
    },
    body: JSON.stringify({
      sessionId: "cc732b",
      runId: "initial",
      hypothesisId: "H5",
      location: "apps/player/app/api/spotify/playback/transfer/route.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export async function PUT(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
    // #region agent log
    console.info(
      "[agent:realtime-debug:player]",
      JSON.stringify({
        sessionId: "cc732b",
        runId: "initial",
        hypothesisId: "H5",
        location: "apps/player/app/api/spotify/playback/transfer/route.ts",
        message: "server spotify transfer route request",
        data: { body },
        timestamp: Date.now(),
      }),
    );
    // #endregion
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
