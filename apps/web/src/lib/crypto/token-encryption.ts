import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

import { getSpotifyTokenEncryptionKey } from "@/src/lib/supabase/env";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const secret = getSpotifyTokenEncryptionKey();
  if (!secret) {
    throw new Error(
      "SPOTIFY_TOKEN_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY is required",
    );
  }
  return scryptSync(secret, "muziks-spotify-token-v1", 32);
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

export function decryptToken(payload: string): string {
  const key = getKey();
  const buffer = Buffer.from(payload, "base64url");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString("utf8");
}
