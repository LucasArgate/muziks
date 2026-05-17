import { voteOnQueueItemHandler } from "@muziks/queue";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getParticipantSession } from "@/src/lib/auth/get-participant-session";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

const voteBodySchema = z.object({
  queueItemId: z.string().uuid(),
});

export async function POST(request: Request, context: RouteContext) {
  const session = await getParticipantSession();
  if (session.status !== "authenticated") {
    return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  }

  const { slug } = await context.params;

  let body: z.infer<typeof voteBodySchema>;
  try {
    body = voteBodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const result = await voteOnQueueItemHandler({
      slug,
      queueItemId: body.queueItemId,
      profileId: session.userId,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "vote_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
