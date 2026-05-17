import { redirect } from "next/navigation";

import type { OwnerAuthState } from "@muziks/types";

import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";

export async function requireMuziksSession(): Promise<
  Exclude<OwnerAuthState, { status: "anonymous" }>
> {
  const session = await getMuziksSession();
  if (session.status === "anonymous") {
    redirect("/login");
  }
  return session;
}

export async function assertPlayerOwnership(slug: string): Promise<void> {
  const session = await requireMuziksSession();

  if (session.status === "authenticated_no_player") {
    redirect("/create");
  }

  if (session.player.slug !== slug) {
    redirect(`/${session.player.slug}`);
  }
}
