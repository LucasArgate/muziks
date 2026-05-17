import {
  castVoteOnQueueItem,
  getPlayerIdBySlug,
} from "@muziks/db";

export type VoteOnQueueItemHandlerResult =
  | { status: 404; body: { error: "player_not_found" | "queue_item_not_found" } }
  | { status: 409; body: { error: "already_voted" } }
  | { status: 200; body: { votes: number } };

export async function voteOnQueueItemHandler(input: {
  slug: string;
  queueItemId: string;
  profileId: string;
}): Promise<VoteOnQueueItemHandlerResult> {
  const playerId = await getPlayerIdBySlug(input.slug);
  if (!playerId) {
    return { status: 404, body: { error: "player_not_found" } };
  }

  const result = await castVoteOnQueueItem({
    playerId,
    queueItemId: input.queueItemId,
    profileId: input.profileId,
  });

  if (!result.ok) {
    if (result.code === "queue_item_not_found") {
      return { status: 404, body: { error: "queue_item_not_found" } };
    }
    return { status: 409, body: { error: "already_voted" } };
  }

  return { status: 200, body: { votes: result.votes } };
}
