import { NextResponse } from "next/server";

import { listSpotifyDevicesHandler } from "@/src/slices/playback/list-spotify-devices/handler";

export async function GET() {
  try {
    const result = await listSpotifyDevicesHandler();
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_devices_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
