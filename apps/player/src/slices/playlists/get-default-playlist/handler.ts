import { getDefaultSavedPlaylistForPlayer } from "@muziks/db";

export async function getDefaultPlaylistHandler(playerId: string) {
  const playlist = await getDefaultSavedPlaylistForPlayer(playerId);
  return { status: 200 as const, body: { playlist } };
}
