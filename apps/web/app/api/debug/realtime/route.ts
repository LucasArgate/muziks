import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;

  console.info(
    "[agent:realtime-debug:web]",
    JSON.stringify({
      sessionId: "867515",
      ...body,
    }),
  );

  return NextResponse.json({ ok: true });
}
