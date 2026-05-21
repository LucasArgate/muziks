import { NextResponse } from "next/server";

import { controlSpotifyPlaybackHandler } from "@/src/slices/playback/control-spotify-playback/handler";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await controlSpotifyPlaybackHandler(body);
    return NextResponse.json(result.body, { status: result.status });
  } catch {
    return NextResponse.json(
      {
        error: "spotify_control_failed",
        message: "Não foi possível controlar a reprodução.",
      },
      { status: 502 },
    );
  }
}
