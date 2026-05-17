import { createTokenCrypto, type SpotifyTokenVaultDeps } from "@muziks/db";

import {
  getSpotifyClientId,
  getSpotifyClientSecret,
} from "@/src/config/env";
import { getSpotifyTokenEncryptionKey } from "@/src/lib/supabase/env";

const tokenCrypto = createTokenCrypto(getSpotifyTokenEncryptionKey());

export const spotifyTokenVaultDeps: SpotifyTokenVaultDeps = {
  clientId: getSpotifyClientId(),
  clientSecret: getSpotifyClientSecret(),
  encrypt: tokenCrypto.encrypt,
  decrypt: tokenCrypto.decrypt,
};
