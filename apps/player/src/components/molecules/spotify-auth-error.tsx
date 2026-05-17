const MESSAGES: Record<string, string> = {
  database_config:
    "Falha ao conectar ao banco (DATABASE_URL na Vercel). Use a URI Transaction pooler do Supabase Dashboard.",
  supabase_admin_config:
    "SUPABASE_SERVICE_ROLE_KEY ausente ou inválida na Vercel.",
  auth_failed: "Não foi possível concluir o login. Tente novamente.",
  invalid_state: "Sessão OAuth expirada. Tente entrar novamente.",
};

type SpotifyAuthErrorProps = {
  code: string | null;
};

export function SpotifyAuthError({ code }: SpotifyAuthErrorProps) {
  if (!code) {
    return null;
  }

  const text = MESSAGES[code] ?? `Erro: ${decodeURIComponent(code)}`;

  return (
    <p
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-center text-sm text-red-200"
    >
      {text}
    </p>
  );
}
