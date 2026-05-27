import { NextResponse } from "next/server";
import { z } from "zod";

import { isPlaybackWorkerAuthorized } from "@/src/config/playback-worker-env";
import { handleConfirmedTrackTransition } from "@/src/features/playback/services/playback-queue-transition";
import { getPlaybackSessionByPlayerId } from "@/src/lib/playback/playback-session-repository";

const trackEndedBodySchema = z.object({
  playerId: z.string().uuid(),
  trackUri: z.string(),
  spotifyTrackId: z.string().optional(),
  endedAt: z.string().datetime().optional(),
  idempotencyKey: z.string().min(8).max(128),
  reason: z.enum(["track_ended", "near_end", "track_advanced"]),
});

export async function POST(request: Request) {
  const auth = request.headers.get("authorization");
  if (!isPlaybackWorkerAuthorized(auth)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const raw = await request.json();
    const parsed = trackEndedBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const session = await getPlaybackSessionByPlayerId(parsed.data.playerId);
    const previousTrackUri = session?.currentTrackUri ?? null;

    const result = await handleConfirmedTrackTransition({
      playerId: parsed.data.playerId,
      previousTrackUri,
      nextState: {
        trackUri: parsed.data.trackUri,
        trackName: session?.trackName ?? null,
        artistName: session?.artistName ?? null,
        albumImageUrl: session?.albumImageUrl ?? null,
        positionMs: 0,
        positionUpdatedAt: Date.now(),
        durationMs: session?.durationMs ?? 0,
        paused: false,
        deviceId: session?.activeDeviceId ?? null,
        status: "playing",
      },
    });

    return NextResponse.json({
      ok: true,
      reason: parsed.data.reason,
      idempotencyKey: parsed.data.idempotencyKey,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "track_ended_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
