import {
  getPlaybackQueue,
  normalizeSpotifyPlaybackQueue,
} from "@muziks/spotify";
import { normalizedSpotifyPlaybackQueueSchema } from "@muziks/types";
import { NextResponse } from "next/server";

import { getOwnerSpotifyAccessTokenBySlug } from "@/src/lib/spotify/resolve-owner-token-by-slug";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function unavailable(message = "Este espaço ainda não conectou o Spotify.") {
  return NextResponse.json(
    { error: "spotify_not_connected", message },
    { status: 503 },
  );
}

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;

  try {
    const tokenResult = await getOwnerSpotifyAccessTokenBySlug(slug);

    if (!tokenResult.ok) {
      if (tokenResult.code === "invalid_slug") {
        return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
      }

      if (tokenResult.code === "player_not_found") {
        return NextResponse.json({ error: "player_not_found" }, { status: 404 });
      }

      return unavailable(
        tokenResult.code === "token_unreadable"
          ? "O player está conectado, mas a fila Spotify ainda não sincronizou a sessão. Aguarde alguns segundos."
          : undefined,
      );
    }

    const raw = await getPlaybackQueue({ accessToken: tokenResult.accessToken });
    const queue = normalizedSpotifyPlaybackQueueSchema.parse(
      normalizeSpotifyPlaybackQueue(raw),
    );

    return NextResponse.json(
      { queue },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "spotify_queue_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
