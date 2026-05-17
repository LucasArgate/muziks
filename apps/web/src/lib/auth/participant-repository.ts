import { getDb, profiles } from "@muziks/db";
import {
  pickSpotifyAvatarUrl,
  type SpotifyUserProfile,
} from "@muziks/spotify";
import { eq } from "drizzle-orm";

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

function resolveParticipantEmail(spotifyProfile: SpotifyUserProfile): string {
  if (spotifyProfile.email) {
    return spotifyProfile.email;
  }
  return `spotify_${spotifyProfile.id}@users.muziks.local`;
}

/** Participante: perfil + Supabase Auth, sem tokens de playback em spotify_connections. */
export async function ensureParticipantProfile(
  spotifyProfile: SpotifyUserProfile,
): Promise<{ userId: string; email: string }> {
  const admin = createSupabaseAdminClient();
  const db = getDb();
  const email = resolveParticipantEmail(spotifyProfile);
  const spotifyUserId = spotifyProfile.id;
  const displayName =
    spotifyProfile.display_name ?? spotifyProfile.id;
  const avatarUrl = pickSpotifyAvatarUrl(spotifyProfile.images);
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
        muziks_role: "participant",
      },
    });
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      app_metadata: {
        provider: "spotify",
        spotify_user_id: spotifyUserId,
        muziks_role: "participant",
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

  return { userId, email };
}
