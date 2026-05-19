import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8765),
  HOST: z.string().default("0.0.0.0"),
  MUZIKS_PLAYER_API_URL: z.string().url(),
  PLAYBACK_WORKER_SECRET: z.string().min(8),
  SPOTIFY_CLIENT_ID: z.string().min(1).optional(),
  LIBRESPOT_BIN: z.string().default("librespot"),
  LIBRESPOT_PLAYER_NAME: z.string().default("Muziks Bridge"),
  LIBRESPOT_CACHE_DIR: z.string().default("./cache"),
  LIBRESPOT_AUTOSTART: z
    .enum(["true", "false", "1", "0"])
    .optional()
    .default("false")
    .transform((v) => v === "true" || v === "1"),
});

export type BridgeConfig = z.infer<typeof envSchema>;

export function loadConfig(): BridgeConfig {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.flatten().fieldErrors;
    throw new Error(
      `spotify-bridge: invalid env ${JSON.stringify(message, null, 2)}`,
    );
  }
  return parsed.data;
}
