import { sendAgentDebugLog } from "@muziks/utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const payload = {
    sessionId: "f48c1c",
    runId: "post-fix-web",
    ...body,
  };

  sendAgentDebugLog({
    hypothesisId: String(payload.hypothesisId ?? "H6"),
    location: String(payload.location ?? "apps/web/app/api/debug/realtime/route.ts"),
    message: String(payload.message ?? "web same-origin debug relay"),
    data: (payload.data as Record<string, unknown> | undefined) ?? {},
    runId: String(payload.runId ?? "post-fix-web"),
  });

  console.info(
    "[agent:realtime-debug:web]",
    JSON.stringify(payload),
  );

  return NextResponse.json({ ok: true });
}
