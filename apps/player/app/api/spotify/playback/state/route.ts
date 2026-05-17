import { NextResponse } from "next/server";

import { getSpotifyPlaybackStateHandler } from "@/src/slices/playback/get-spotify-playback-state/handler";

export async function GET() {
  try {
    const result = await getSpotifyPlaybackStateHandler();
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_playback_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
