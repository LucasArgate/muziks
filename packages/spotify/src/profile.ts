import { spotifyFetch } from "./api";

export type SpotifyUserProfile = {
  id: string;
  display_name: string | null;
  email?: string;
  images?: { url: string }[];
};

export function pickSpotifyAvatarUrl(
  images?: { url: string }[],
): string | null {
  return images?.[0]?.url ?? null;
}

export async function fetchSpotifyProfile(
  accessToken: string,
): Promise<SpotifyUserProfile> {
  return spotifyFetch<SpotifyUserProfile>("/me", { accessToken });
}
