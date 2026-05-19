import { sdkForAccessToken } from "./client";

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
  const sdk = sdkForAccessToken(accessToken);
  const profile = await sdk.currentUser.profile();
  return {
    id: profile.id,
    display_name: profile.display_name,
    email: profile.email,
    images: profile.images,
  };
}
