import { createTokenCrypto, type SpotifyTokenVaultDeps } from "@muziks/db";

import { getSpotifyClientId, getSpotifyClientSecret } from "./env.js";
import { getSpotifyTokenEncryptionKey } from "../supabase/env.js";

let cached: SpotifyTokenVaultDeps | null = null;

export function getSpotifyTokenVaultDeps(): SpotifyTokenVaultDeps {
  if (!cached) {
    const tokenCrypto = createTokenCrypto(getSpotifyTokenEncryptionKey());
    cached = {
      clientId: getSpotifyClientId(),
      clientSecret: getSpotifyClientSecret(),
      encrypt: tokenCrypto.encrypt,
      decrypt: tokenCrypto.decrypt,
    };
  }
  return cached;
}
