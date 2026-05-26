import { setDefaultSavedPlaylistForPlayer } from "@muziks/db";
import { z } from "zod";

const bodySchema = z.object({
  playlistId: z.string().uuid(),
});

export async function setDefaultPlaylistHandler(
  playerId: string,
  rawBody: unknown,
) {
  const parsed = bodySchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_body", details: parsed.error.flatten() },
    };
  }

  const playlist = await setDefaultSavedPlaylistForPlayer(
    playerId,
    parsed.data.playlistId,
  );

  if (!playlist) {
    return { status: 404 as const, body: { error: "playlist_not_found" } };
  }

  return { status: 200 as const, body: { playlist } };
}
