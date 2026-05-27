import { NextResponse } from "next/server";

import { isPlaybackWorkerAuthorized } from "@/src/config/playback-worker-env";
import { runPlaybackOrchestrator } from "@/src/features/playback/services/playback-orchestrator-runner";

async function handlePlaybackTick(request: Request) {
  const auth = request.headers.get("authorization");
  if (!isPlaybackWorkerAuthorized(auth)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPlaybackOrchestrator();
    return NextResponse.json({
      playersProcessed: result.playersProcessed,
      eventsEmitted: result.eventsEmitted,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "orchestrator_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Vercel Cron uses GET; Trigger.dev worker uses POST. */
export async function GET(request: Request) {
  return handlePlaybackTick(request);
}

export async function POST(request: Request) {
  return handlePlaybackTick(request);
}
