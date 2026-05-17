export { getDb } from "./client";
export {
  isDatabaseConnectivityError,
  isDatabaseSchemaError,
  resolveDatabaseUrl,
} from "./resolve-database-url";
export * from "./schema";
export { toPlayerSummary, toProfileSummary } from "./mappers/player";
export {
  getPlayerIdBySlug,
  getPlayerSummaryBySlug,
} from "./repositories/players";
export {
  discoverPlayersByGeo,
  discoverPlayersByQuery,
  type DiscoverPlayerResult,
} from "./repositories/discover-players";
export {
  getPublicPlaybackSession,
  type PublicPlaybackSessionRow,
} from "./repositories/player-sessions";
export { castVoteOnQueueItem, type CastVoteResult } from "./repositories/vote-events";
export {
  computeQueueVersion,
  dequeueNextQueuedItem,
  findDequeueLedgerResult,
  listQueueItemsForPlayer,
  saveDequeueLedgerResult,
  seedQueueItemsIfEmpty,
  toQueueItemDto,
  type DequeueNextResult,
  type QueueItemRow,
} from "./repositories/queue-items";
