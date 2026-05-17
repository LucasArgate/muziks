import { createTokenCrypto, type TokenCrypto } from "@muziks/db";

import { getSpotifyTokenEncryptionKey } from "@/src/lib/supabase/env";

let tokenCrypto: TokenCrypto | null = null;

function getTokenCrypto(): TokenCrypto {
  if (!tokenCrypto) {
    tokenCrypto = createTokenCrypto(getSpotifyTokenEncryptionKey());
  }
  return tokenCrypto;
}

export const encryptToken = (plaintext: string) =>
  getTokenCrypto().encrypt(plaintext);

export const decryptToken = (payload: string) =>
  getTokenCrypto().decrypt(payload);
