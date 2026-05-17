# @muziks/spotify

Cliente Spotify tipado (sem secrets no package): PKCE, OAuth, fetch com backoff em 429.

Usado por `apps/player`. Secrets ficam apenas no app (`SPOTIFY_CLIENT_SECRET`, cookies httpOnly).
