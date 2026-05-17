import { NextResponse } from "next/server";

import { getPlaybackSessionHandler } from "@/src/slices/playback/get-playback-session/handler";
import { publishSessionStateHandler } from "@/src/slices/playback/publish-session-state/handler";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const result = await getPlaybackSessionHandler(slug);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const body = await request.json();
  const result = await publishSessionStateHandler(slug, body);
  return NextResponse.json(result.body, { status: result.status });
}
