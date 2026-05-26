import { PlayerPlaylistsShell } from "@/src/components/organisms/player-playlists-shell";
import { assertPlayerOwnership } from "@/src/lib/auth/require-session";
import { buildPlayerMasterViewState } from "@/src/lib/auth/build-master-view";

type PlayerPlaylistsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerPlaylistsPage({
  params,
}: PlayerPlaylistsPageProps) {
  const { slug } = await params;

  await assertPlayerOwnership(slug);
  const viewState = await buildPlayerMasterViewState();

  return <PlayerPlaylistsShell slug={slug} viewState={viewState} />;
}
