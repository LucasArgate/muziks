import { NextResponse } from "next/server";

import { controlSpotifyPlaybackHandler } from "@/src/slices/playback/control-spotify-playback/handler";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await controlSpotifyPlaybackHandler(body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_control_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
