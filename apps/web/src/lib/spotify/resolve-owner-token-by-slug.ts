import {
  getAccessTokenForPlayerSlug,
  type PlayerSpotifyAccessTokenError,
} from "@muziks/db";

import { getSpotifyTokenVaultDeps } from "@/src/lib/spotify/vault-deps";

export type OwnerSpotifyTokenBySlugError = PlayerSpotifyAccessTokenError;

export type OwnerSpotifyTokenBySlugResult =
  | { ok: true; accessToken: string; playerId: string }
  | { ok: false; code: OwnerSpotifyTokenBySlugError };

export async function getOwnerSpotifyAccessTokenBySlug(
  slug: string,
): Promise<OwnerSpotifyTokenBySlugResult> {
  return getAccessTokenForPlayerSlug(slug, getSpotifyTokenVaultDeps());
}
