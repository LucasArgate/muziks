import {
  isDatabaseConnectivityError,
  isDatabaseSchemaError,
} from "@muziks/db";

function extractMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

export function toSpotifyCallbackError(err: unknown): string {
  const message = extractMessage(err);
  const lower = message.toLowerCase();

  if (isDatabaseSchemaError(message)) {
    return "schema_not_ready";
  }

  if (isDatabaseConnectivityError(message)) {
    return process.env.NODE_ENV === "production"
      ? "database_config"
      : message;
  }

  if (message.includes("SPOTIFY_TOKEN_ENCRYPTION_KEY")) {
    return "token_encryption_config";
  }

  if (
    message.includes("SUPABASE_SERVICE_ROLE_KEY") ||
    lower.includes("invalid api key") ||
    lower.includes("invalid jwt") ||
    lower.includes("no api key found")
  ) {
    return "supabase_admin_config";
  }

  if (message.includes("invalid_client") || lower.includes("invalid client secret")) {
    return "invalid_client";
  }

  if (process.env.NODE_ENV === "production") {
    return "auth_failed";
  }

  return message;
}
