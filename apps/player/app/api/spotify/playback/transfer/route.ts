import { NextResponse } from "next/server";

import { transferSpotifyPlaybackHandler } from "@/src/slices/playback/transfer-spotify-playback/handler";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = await transferSpotifyPlaybackHandler(body);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_transfer_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
