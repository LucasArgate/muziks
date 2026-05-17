import type { MuziksSessionView, OwnerAuthState } from "@muziks/types";
import type { SpotifyConnectionState } from "@muziks/types";

export function toMuziksSessionView(
  muziks: OwnerAuthState,
  spotify: SpotifyConnectionState,
): MuziksSessionView {
  if (muziks.status === "anonymous") {
    return {
      status: "anonymous",
      userId: null,
      profile: null,
      playerSlug: null,
      spotify,
    };
  }

  if (muziks.status === "authenticated_no_player") {
    return {
      status: "authenticated_no_player",
      userId: muziks.userId,
      profile: muziks.profile,
      playerSlug: null,
      spotify,
    };
  }

  return {
    status: "authenticated",
    userId: muziks.userId,
    profile: muziks.profile,
    playerSlug: muziks.player.slug,
    spotify,
  };
}
