import { AuthPageShell } from "@/src/components/molecules/auth-page-shell";
import { OAuthOriginHint } from "@/src/components/molecules/oauth-origin-hint";
import { SpotifyAuthError } from "@/src/components/molecules/spotify-auth-error";
import { SpotifyLoginButton } from "@/src/components/molecules/spotify-login-button";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const spotifyError =
    typeof query.spotify_error === "string" ? query.spotify_error : null;

  return (
    <AuthPageShell
      title="Entrar no Muziks Player"
      subtitle="Use a conta Spotify Premium do estabelecimento para gerenciar a reprodução no telão."
    >
      <SpotifyAuthError code={spotifyError} />
      <OAuthOriginHint />
      <SpotifyLoginButton />
      <p className="text-center text-xs text-on-surface-variant">
        Não tem um player? O cadastro é feito após conectar o Spotify.
      </p>
    </AuthPageShell>
  );
}
