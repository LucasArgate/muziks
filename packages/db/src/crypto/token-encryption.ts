import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_SALT = "muziks-spotify-token-v1";

export type TokenCrypto = {
  encrypt: (plaintext: string) => string;
  decrypt: (payload: string) => string;
};

export function createTokenCrypto(secret: string): TokenCrypto {
  if (!secret) {
    throw new Error(
      "SPOTIFY_TOKEN_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY is required",
    );
  }

  const key = scryptSync(secret, KEY_SALT, 32);

  return {
    encrypt(plaintext: string): string {
      const iv = randomBytes(12);
      const cipher = createCipheriv(ALGORITHM, key, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();
      return Buffer.concat([iv, tag, encrypted]).toString("base64url");
    },

    decrypt(payload: string): string {
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
    },
  };
}
