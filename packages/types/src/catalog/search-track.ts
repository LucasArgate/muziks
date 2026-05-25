import { z } from "zod";

export const catalogTrackSchema = z.object({
  spotifyId: z.string().optional(),
  spotifyUri: z.string(),
  title: z.string(),
  artist: z.string(),
  albumImageUrl: z.string().nullable(),
});

export type CatalogTrack = z.infer<typeof catalogTrackSchema>;

export const catalogArtistSchema = z.object({
  spotifyId: z.string(),
  spotifyUri: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
});

export type CatalogArtist = z.infer<typeof catalogArtistSchema>;

export const catalogArtistTracksSchema = z.object({
  artist: catalogArtistSchema,
  tracks: z.array(catalogTrackSchema),
});

export type CatalogArtistTracks = z.infer<typeof catalogArtistTracksSchema>;

export const catalogSearchResultSchema = z.object({
  tracks: z.array(catalogTrackSchema),
  artists: z.array(catalogArtistSchema).default([]),
  artistTracks: z.array(catalogArtistTracksSchema).default([]),
});

export type CatalogSearchResult = z.infer<typeof catalogSearchResultSchema>;
