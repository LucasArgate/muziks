import { redirect } from "next/navigation";

import { getMuziksSession } from "@/src/lib/auth/get-muziks-session";

export default async function HomePage() {
  const session = await getMuziksSession();

  if (session.status === "anonymous") {
    redirect("/login");
  }

  if (session.status === "authenticated_no_player") {
    redirect("/create");
  }

  redirect(`/${session.player.slug}`);
}
