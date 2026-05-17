import { z } from "zod";

export const catalogTrackSchema = z.object({
  spotifyUri: z.string(),
  title: z.string(),
  artist: z.string(),
  albumImageUrl: z.string().nullable(),
});

export type CatalogTrack = z.infer<typeof catalogTrackSchema>;

export const catalogSearchResultSchema = z.object({
  tracks: z.array(catalogTrackSchema),
});

export type CatalogSearchResult = z.infer<typeof catalogSearchResultSchema>;
