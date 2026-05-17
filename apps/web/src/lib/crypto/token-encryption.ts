import { createTokenCrypto } from "@muziks/db";

import { getSpotifyTokenEncryptionKey } from "@/src/lib/supabase/env";

const tokenCrypto = createTokenCrypto(getSpotifyTokenEncryptionKey());

export const encryptToken = tokenCrypto.encrypt;
export const decryptToken = tokenCrypto.decrypt;
