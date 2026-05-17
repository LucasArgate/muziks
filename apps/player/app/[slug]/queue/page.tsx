import { PlayerQueueShell } from "@/src/components/organisms/player-queue-shell";
import { assertPlayerOwnership } from "@/src/lib/auth/require-session";
import { buildPlayerMasterViewState } from "@/src/lib/auth/build-master-view";

type PlayerQueuePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerQueuePage({ params }: PlayerQueuePageProps) {
  const { slug } = await params;

  await assertPlayerOwnership(slug);
  const viewState = await buildPlayerMasterViewState();

  return <PlayerQueueShell slug={slug} viewState={viewState} />;
}
