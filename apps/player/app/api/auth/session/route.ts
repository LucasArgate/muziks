import { muziksSessionViewSchema } from "@muziks/types";
import { NextResponse } from "next/server";

import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";
import { resolveSpotifyConnectionState } from "@/src/lib/auth/spotify-connection-state";
import { toMuziksSessionView } from "@/src/lib/auth/to-session-view";

export async function GET() {
  const muziks = await getMuziksSession();
  const spotify = await resolveSpotifyConnectionState();
  const view = toMuziksSessionView(muziks, spotify);
  const parsed = muziksSessionViewSchema.parse(view);
  return NextResponse.json(parsed);
}
