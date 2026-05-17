import { getAccessTokenForPlayer, getPlayerIdBySlug } from "@muziks/db";
import { isValidPlayerSlug, normalizePlayerSlug } from "@muziks/types";

import { spotifyTokenVaultDeps } from "@/src/lib/spotify/vault-deps";

export type OwnerSpotifyTokenBySlugError =
  | "invalid_slug"
  | "player_not_found"
  | "spotify_not_connected";

export type OwnerSpotifyTokenBySlugResult =
  | { ok: true; accessToken: string; playerId: string }
  | { ok: false; code: OwnerSpotifyTokenBySlugError };

export async function getOwnerSpotifyAccessTokenBySlug(
  slug: string,
): Promise<OwnerSpotifyTokenBySlugResult> {
  const normalized = normalizePlayerSlug(slug);
  if (!isValidPlayerSlug(normalized)) {
    return { ok: false, code: "invalid_slug" };
  }

  const playerId = await getPlayerIdBySlug(normalized);
  if (!playerId) {
    return { ok: false, code: "player_not_found" };
  }

  const accessToken = await getAccessTokenForPlayer(
    playerId,
    spotifyTokenVaultDeps,
  );
  if (!accessToken) {
    return { ok: false, code: "spotify_not_connected" };
  }

  return { ok: true, accessToken, playerId };
}
