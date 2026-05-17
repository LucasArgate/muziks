/** Scopes MVP-B — ver docs/mvp/06-arquitetura-playback-spotify.md §10 */
export const SPOTIFY_PLAYBACK_SCOPES = [
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
] as const;

export const SPOTIFY_ACCOUNTS_BASE = "https://accounts.spotify.com";
export const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
