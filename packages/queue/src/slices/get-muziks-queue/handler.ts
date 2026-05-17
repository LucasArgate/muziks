import {
  getPlayerIdBySlug,
  listQueueItemsForPlayer,
  seedQueueItemsIfEmpty,
} from "@muziks/db";
import { muziksQueueSnapshotSchema } from "@muziks/types";

import { buildMuziksQueueSnapshot } from "../../domain/build-snapshot";

export type GetMuziksQueueHandlerResult =
  | { status: 404; body: { error: "player_not_found" } }
  | { status: 200; body: { snapshot: ReturnType<typeof muziksQueueSnapshotSchema.parse> } };

export type GetMuziksQueueOptions = {
  seedIfEmpty?: boolean;
};

export async function getMuziksQueueHandler(
  slug: string,
  options: GetMuziksQueueOptions = {},
): Promise<GetMuziksQueueHandlerResult> {
  const playerId = await getPlayerIdBySlug(slug);
  if (!playerId) {
    return { status: 404, body: { error: "player_not_found" } };
  }

  if (options.seedIfEmpty && process.env.NODE_ENV === "development") {
    await seedQueueItemsIfEmpty(playerId);
  }

  const rows = await listQueueItemsForPlayer(playerId);
  const snapshot = buildMuziksQueueSnapshot(playerId, rows);

  return {
    status: 200,
    body: { snapshot: muziksQueueSnapshotSchema.parse(snapshot) },
  };
}
