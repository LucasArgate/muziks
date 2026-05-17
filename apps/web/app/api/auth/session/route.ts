import { NextResponse } from "next/server";

import { getParticipantSession } from "@/src/lib/auth/get-participant-session";

export async function GET() {
  const session = await getParticipantSession();
  return NextResponse.json(session);
}
