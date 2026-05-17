import { PlayerSettingsShell } from "@/src/components/organisms/player-settings-shell";
import { assertPlayerOwnership } from "@/src/lib/auth/require-session";
import { buildPlayerMasterViewState } from "@/src/lib/auth/build-master-view";

type PlayerSettingsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlayerSettingsPage({
  params,
}: PlayerSettingsPageProps) {
  const { slug } = await params;

  await assertPlayerOwnership(slug);
  const viewState = await buildPlayerMasterViewState();

  return <PlayerSettingsShell slug={slug} viewState={viewState} />;
}
