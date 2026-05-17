import { getPlayerSummaryBySlug } from "@muziks/db";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ParticipantPlayerPage } from "@/src/components/pages/participant-player-page";

type PlayerPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerSlugPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = await getPlayerSummaryBySlug(slug);

  if (!player || player.status === "archived") {
    notFound();
  }

  return (
    <Suspense fallback={<p className="p-6 text-center text-sm">Carregando...</p>}>
      <ParticipantPlayerPage slug={player.slug} displayName={player.displayName} />
    </Suspense>
  );
}
