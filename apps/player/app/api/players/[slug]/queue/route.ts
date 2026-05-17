import { NextResponse } from "next/server";

import { getMuziksQueueHandler } from "@muziks/queue";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const result = await getMuziksQueueHandler(slug, { seedIfEmpty: true });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "muziks_queue_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
