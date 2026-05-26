import {
  getSavedPlaylistWithItems,
  listSavedPlaylistsForPlayer,
} from "@muziks/db";

export async function listSavedPlaylistsHandler(playerId: string) {
  const playlists = await listSavedPlaylistsForPlayer(playerId);
  return { status: 200 as const, body: { playlists } };
}

export async function getSavedPlaylistDetailsHandler(
  playerId: string,
  playlistId: string,
) {
  const playlist = await getSavedPlaylistWithItems(playerId, playlistId);
  if (!playlist) {
    return { status: 404 as const, body: { error: "playlist_not_found" } };
  }

  return { status: 200 as const, body: { playlist } };
}
