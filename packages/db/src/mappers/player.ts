import type {
  PlayerLifecycleStatus,
  PlayerSummary,
  ProfileSummary,
} from "@muziks/types";

import type { players } from "../schema/players";
import type { profiles } from "../schema/profiles";

type ProfileRow = typeof profiles.$inferSelect;
type PlayerRow = typeof players.$inferSelect;

export function toProfileSummary(row: ProfileRow): ProfileSummary {
  return {
    id: row.id,
    displayName: row.displayName,
    spotifyUserId: row.spotifyUserId,
  };
}

export function toPlayerSummary(row: PlayerRow): PlayerSummary {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.displayName,
    status: row.status as PlayerLifecycleStatus,
  };
}
