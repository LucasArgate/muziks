import {
  isDatabaseConnectivityError,
  isDatabaseSchemaError,
} from "@muziks/db";

export function toSpotifyCallbackError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (isDatabaseSchemaError(message)) {
    return "schema_not_ready";
  }

  if (isDatabaseConnectivityError(message)) {
    return process.env.NODE_ENV === "production"
      ? "database_config"
      : message;
  }

  if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
    return "supabase_admin_config";
  }

  if (process.env.NODE_ENV === "production") {
    return "auth_failed";
  }

  return message;
}
