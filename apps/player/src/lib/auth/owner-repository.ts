import { getDb, players, profiles, toPlayerSummary, toProfileSummary } from "@muziks/db";
import {
  pickSpotifyAvatarUrl,
  type SpotifyUserProfile,
  type SpotifyTokenResponse,
} from "@muziks/spotify";
import { eq } from "drizzle-orm";

import { persistSpotifyTokens } from "@/src/lib/spotify/spotify-token-vault";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export async function findProfileBySpotifyUserId(spotifyUserId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.spotifyUserId, spotifyUserId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findPlayerByOwnerId(ownerId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(players)
    .where(eq(players.ownerId, ownerId))
    .limit(1);
  return rows[0] ?? null;
}

export async function resolveOwnerEmail(
  spotifyProfile: SpotifyUserProfile,
): Promise<string> {
  if (spotifyProfile.email) {
    return spotifyProfile.email;
  }
  return `spotify_${spotifyProfile.id}@users.muziks.local`;
}

export async function ensureOwnerAccount(input: {
  spotifyProfile: SpotifyUserProfile;
  tokens: SpotifyTokenResponse;
}): Promise<{ userId: string; email: string }> {
  const admin = createSupabaseAdminClient();
  const db = getDb();
  const email = await resolveOwnerEmail(input.spotifyProfile);
  const spotifyUserId = input.spotifyProfile.id;
  const displayName =
    input.spotifyProfile.display_name ?? input.spotifyProfile.id;
  const avatarUrl = pickSpotifyAvatarUrl(input.spotifyProfile.images);
  const profileFields = {
    displayName,
    avatarUrl,
    email,
    updatedAt: new Date(),
  };

  let userId: string;
  const existingProfile = await findProfileBySpotifyUserId(spotifyUserId);

  if (existingProfile) {
    userId = existingProfile.id;
    await db
      .update(profiles)
      .set(profileFields)
      .where(eq(profiles.id, userId));
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        display_name: displayName,
        avatar_url: avatarUrl,
      },
    });
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: {
        provider: "spotify",
        spotify_user_id: spotifyUserId,
      },
      user_metadata: {
        display_name: displayName,
        avatar_url: avatarUrl,
      },
    });

    if (created?.user) {
      userId = created.user.id;
    } else if (error) {
      const { data: listData } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      const existingUser = listData.users.find((u) => u.email === email);
      if (!existingUser) {
        throw error;
      }
      userId = existingUser.id;
      await admin.auth.admin.updateUserById(userId, {
        app_metadata: {
          provider: "spotify",
          spotify_user_id: spotifyUserId,
        },
        user_metadata: {
          display_name: displayName,
          avatar_url: avatarUrl,
        },
      });
    } else {
      throw new Error("Failed to create Supabase user");
    }

    await db
      .insert(profiles)
      .values({
        id: userId,
        spotifyUserId,
        displayName,
        avatarUrl,
        email,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          spotifyUserId,
          displayName,
          avatarUrl,
          email,
          updatedAt: new Date(),
        },
      });
  }

  await persistSpotifyTokens(userId, input.tokens);

  return { userId, email };
}

export async function loadOwnerContext(userId: string) {
  const db = getDb();
  const profileRows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  const profileRow = profileRows[0];
  if (!profileRow) {
    return null;
  }

  const playerRow = await findPlayerByOwnerId(userId);

  return {
    profile: toProfileSummary(profileRow),
    player: playerRow ? toPlayerSummary(playerRow) : null,
  };
}
