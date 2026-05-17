const MESSAGES: Record<string, string> = {
  schema_not_ready:
    "Banco sem tabelas do app. Rode pnpm db:migrate com DATABASE_URL de produção.",
  database_config:
    "Falha ao conectar ao banco. Confira DATABASE_URL (host aws-1, usuário postgres.PROJECT_REF).",
  token_encryption_config:
    "Defina SUPABASE_SERVICE_ROLE_KEY no .env ou remova SPOTIFY_TOKEN_ENCRYPTION_KEY vazio.",
  supabase_admin_config:
    "SUPABASE_SERVICE_ROLE_KEY ausente no servidor. Cole a chave sb_secret_… do Supabase (API Keys) no .env, depois reinicie.",
  auth_failed: "Não foi possível concluir o login. Tente novamente.",
  invalid_state: "Sessão OAuth expirada. Tente entrar novamente.",
  invalid_client:
    "SPOTIFY_CLIENT_SECRET inválido. Uma linha só no .env (hex do Spotify, não sb_secret do Supabase).",
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
