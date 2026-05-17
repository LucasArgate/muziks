import { NextResponse } from "next/server";

import { getSpotifyPlaybackQueueHandler } from "@/src/slices/playback/get-spotify-playback-queue/handler";

export async function GET() {
  try {
    const result = await getSpotifyPlaybackQueueHandler();
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_queue_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
