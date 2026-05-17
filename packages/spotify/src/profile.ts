import { spotifyFetch } from "./api";

export type SpotifyUserProfile = {
  id: string;
  display_name: string | null;
  email?: string;
  images?: { url: string }[];
};

export async function fetchSpotifyProfile(
  accessToken: string,
): Promise<SpotifyUserProfile> {
  return spotifyFetch<SpotifyUserProfile>("/me", { accessToken });
}
