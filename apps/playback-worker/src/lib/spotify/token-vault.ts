import { getAccessTokenForPlayer as getAccessTokenForPlayerCore } from "@muziks/db";

import { getSpotifyTokenVaultDeps } from "./vault-deps.js";

export async function getAccessTokenForPlayer(
  playerId: string,
): Promise<string | null> {
  return getAccessTokenForPlayerCore(playerId, getSpotifyTokenVaultDeps());
}
