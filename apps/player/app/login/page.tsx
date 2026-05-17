import { AuthPageShell } from "@/src/components/molecules/auth-page-shell";
import { SpotifyLoginButton } from "@/src/components/molecules/spotify-login-button";

export default function LoginPage() {
  return (
    <AuthPageShell
      title="Entrar no Muziks Player"
      subtitle="Use a conta Spotify Premium do estabelecimento para gerenciar a reprodução no telão."
    >
      <SpotifyLoginButton />
      <p className="text-center text-xs text-on-surface-variant">
        Não tem um player? O cadastro é feito após conectar o Spotify.
      </p>
    </AuthPageShell>
  );
}
