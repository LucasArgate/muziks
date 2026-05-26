import { getPlayerSummaryBySlug, getPublicPlaybackSession } from "@muziks/db";
import { publicPlaybackSessionSchema } from "@muziks/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ParticipantPlayerPage } from "@/src/components/pages/participant-player-page";

type PlayerPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerSlugPage({ params }: PlayerPageProps) {
  const { slug } = await params;
  const player = await getPlayerSummaryBySlug(slug);
  const queueTransport =
    process.env.DISABLE_PUBLIC_REALTIME === "1" ||
    process.env.DISABLE_PUBLIC_REALTIME === "true"
      ? "poll"
      : "realtime";

  if (!player || player.status === "archived") {
    notFound();
  }

  const playbackRow = await getPublicPlaybackSession(player.id);
  const initialPlayback = playbackRow
    ? publicPlaybackSessionSchema.parse({
        trackName: playbackRow.trackName,
        artistName: playbackRow.artistName,
        albumImageUrl: playbackRow.albumImageUrl,
        progressMs: playbackRow.progressMs,
        durationMs: playbackRow.durationMs,
        paused: playbackRow.paused,
        status: playbackRow.status,
        stateVersion: playbackRow.stateVersion,
        updatedAt: playbackRow.updatedAt.toISOString(),
      })
    : null;

  return (
    <Suspense fallback={<p className="p-6 text-center text-sm">Carregando...</p>}>
      <ParticipantPlayerPage
        slug={player.slug}
        playerId={player.id}
        displayName={player.displayName}
        queueTransport={queueTransport}
        initialPlayback={initialPlayback}
      />
    </Suspense>
  );
}
