import { PlayerMasterShell } from "@/src/components/organisms/player-master-shell";
import { hasSpotifySession } from "@/src/lib/spotify-session";

type PlayerSlugPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveSpotifyNotice(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  if (searchParams.spotify_connected === "1") {
    return "Spotify conectado. Ative a reprodução neste navegador.";
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
  const isAuthenticated = await hasSpotifySession();
  const spotifyNotice = resolveSpotifyNotice(query);

  return (
    <PlayerMasterShell
      slug={slug}
      isAuthenticated={isAuthenticated}
      spotifyNotice={spotifyNotice}
    />
  );
}
