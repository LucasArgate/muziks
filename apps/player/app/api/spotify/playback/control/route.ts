import { NextResponse } from "next/server";

import { controlSpotifyPlaybackHandler } from "@/src/slices/playback/control-spotify-playback/handler";

function logSpotifyControlRouteDebug(
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
      hypothesisId: "H6",
      location: "apps/player/app/api/spotify/playback/control/route.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
    // #region agent log
    console.info(
      "[agent:realtime-debug:player]",
      JSON.stringify({
        sessionId: "cc732b",
        runId: "initial",
        hypothesisId: "H6",
        location: "apps/player/app/api/spotify/playback/control/route.ts",
        message: "server spotify control route request",
        data: { body },
        timestamp: Date.now(),
      }),
    );
    // #endregion
    const result = await controlSpotifyPlaybackHandler(body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_control_error";
    // #region agent log
    console.error(
      "[agent:realtime-debug:player]",
      JSON.stringify({
        sessionId: "867515",
        runId: "same-origin",
        hypothesisId: "H5",
        location: "apps/player/app/api/spotify/playback/control/route.ts:15",
        message: "spotify playback control route failed before realtime update",
        data: {
          error:
            error instanceof Error
              ? { name: error.name, message: error.message }
              : { value: String(error) },
        },
        timestamp: Date.now(),
      }),
    );
    logSpotifyControlRouteDebug("server spotify control route error", {
      error: message,
      body,
    });
    // #endregion
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
