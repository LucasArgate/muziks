import { z } from "zod";

export const playlistProviderSchema = z.enum(["spotify"]);

export type PlaylistProvider = z.infer<typeof playlistProviderSchema>;

export const providerPlaylistSummarySchema = z.object({
  provider: playlistProviderSchema,
  providerPlaylistId: z.string(),
  providerUri: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  ownerName: z.string().nullable(),
  tracksTotal: z.number().int().nonnegative(),
  providerSnapshotId: z.string().nullable(),
  public: z.boolean().nullable(),
  collaborative: z.boolean(),
});

export type ProviderPlaylistSummary = z.infer<
  typeof providerPlaylistSummarySchema
>;

export const savedProviderPlaylistItemSchema = z.object({
  id: z.string().uuid(),
  playlistId: z.string().uuid(),
  providerTrackId: z.string().nullable(),
  providerTrackUri: z.string(),
  isrc: z.string().nullable(),
  title: z.string(),
  artist: z.string(),
  albumImageUrl: z.string().nullable(),
  durationMs: z.number().int().nonnegative(),
  position: z.number().int().nonnegative(),
});

export type SavedProviderPlaylistItem = z.infer<
  typeof savedProviderPlaylistItemSchema
>;

export const savedProviderPlaylistSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  provider: playlistProviderSchema,
  providerPlaylistId: z.string(),
  providerUri: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  ownerName: z.string().nullable(),
  tracksTotal: z.number().int().nonnegative(),
  providerSnapshotId: z.string().nullable(),
  isDefault: z.boolean(),
  lastSyncedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SavedProviderPlaylist = z.infer<
  typeof savedProviderPlaylistSchema
>;

export const savedProviderPlaylistWithItemsSchema =
  savedProviderPlaylistSchema.extend({
    items: z.array(savedProviderPlaylistItemSchema),
  });

export type SavedProviderPlaylistWithItems = z.infer<
  typeof savedProviderPlaylistWithItemsSchema
>;

export const syncProviderPlaylistsInputSchema = z.object({
  provider: playlistProviderSchema.default("spotify"),
  providerPlaylistIds: z.array(z.string().min(1)).min(1).max(20),
});

export type SyncProviderPlaylistsInput = z.infer<
  typeof syncProviderPlaylistsInputSchema
>;

export const syncProviderPlaylistResultSchema = z.object({
  provider: playlistProviderSchema,
  providerPlaylistId: z.string(),
  playlist: savedProviderPlaylistSchema.nullable(),
  itemsSynced: z.number().int().nonnegative(),
  skipped: z.boolean(),
  error: z.string().nullable(),
});

export type SyncProviderPlaylistResult = z.infer<
  typeof syncProviderPlaylistResultSchema
>;

export const syncProviderPlaylistsResponseSchema = z.object({
  results: z.array(syncProviderPlaylistResultSchema),
});

export type SyncProviderPlaylistsResponse = z.infer<
  typeof syncProviderPlaylistsResponseSchema
>;
