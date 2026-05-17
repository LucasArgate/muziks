/**
 * Normaliza e valida DATABASE_URL do Supabase (pooler).
 * Erro comum em prod: host aws-0-* desatualizado ou usuário `postgres` sem project ref.
 */
export function resolveDatabaseUrl(raw?: string): string {
  const url = raw ?? process.env.DATABASE_URL;
  if (!url?.trim()) {
    throw new Error(
      "DATABASE_URL is required. Copy the Transaction pooler URI from Supabase → Settings → Database.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL is not a valid URL");
  }

  if (parsed.hostname.includes("pooler.supabase.com")) {
    const user = decodeURIComponent(parsed.username);
    if (user === "postgres") {
      throw new Error(
        "DATABASE_URL must use username postgres.PROJECT_REF (not postgres) for Supabase pooler. Copy the URI from the dashboard.",
      );
    }
    if (!user.startsWith("postgres.")) {
      throw new Error(
        "DATABASE_URL username must start with postgres. for Supabase pooler (e.g. postgres.qgucuffklddzciejdtrb).",
      );
    }

    if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }
  }

  return parsed.toString();
}

export function isDatabaseConnectivityError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("enotfound") ||
    lower.includes("tenant") ||
    lower.includes("database_url") ||
    lower.includes("econnrefused") ||
    lower.includes("password authentication failed") ||
    lower.includes("self-signed certificate") ||
    lower.includes("ssl")
  );
}

export function isDatabaseSchemaError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('relation "profiles" does not exist') ||
    lower.includes('relation "players" does not exist') ||
    (lower.includes("does not exist") && lower.includes("relation"))
  );
}
