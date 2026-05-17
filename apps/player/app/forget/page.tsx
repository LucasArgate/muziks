import Link from "next/link";

import { AuthPageShell } from "@/src/components/molecules/auth-page-shell";
import { SpotifyLoginButton } from "@/src/components/molecules/spotify-login-button";

export default function ForgetPage() {
  return (
    <AuthPageShell
      title="Recuperar acesso"
      subtitle="O Muziks Player usa Spotify como identidade do dono. Conecte novamente a mesma conta Spotify para voltar ao seu espaço."
    >
      <SpotifyLoginButton label="Entrar com Spotify" />
      <p className="text-center text-sm">
        <Link
          href="/login"
          className="text-on-surface-variant underline-offset-2 hover:underline"
        >
          Voltar ao login
        </Link>
      </p>
    </AuthPageShell>
  );
}
