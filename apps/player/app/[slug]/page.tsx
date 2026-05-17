import { PlayerMasterShell } from "@/src/components/organisms/player-master-shell";
import { assertPlayerOwnership } from "@/src/lib/auth/require-session";
import { buildPlayerMasterViewState } from "@/src/lib/auth/build-master-view";

type PlayerSlugPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveSpotifyNotice(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  if (searchParams.spotify_connected === "1") {
    return "Spotify conectado. Escolha o dispositivo onde a música vai tocar.";
  }

  const error = searchParams.spotify_error;
  if (typeof error === "string" && error.length > 0) {
    return `Não foi possível conectar: ${decodeURIComponent(error)}`;
  }

  return null;
}

export default async function PlayerSlugPage({
  params,
  searchParams,
}: PlayerSlugPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  await assertPlayerOwnership(slug);
  const viewState = await buildPlayerMasterViewState();
  const spotifyNotice = resolveSpotifyNotice(query);

  return (
    <PlayerMasterShell
      slug={slug}
      viewState={viewState}
      spotifyNotice={spotifyNotice}
    />
  );
}
