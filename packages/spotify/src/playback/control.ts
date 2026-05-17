import { spotifyFetch, type SpotifyFetchOptions } from "../api";

export type PlaybackControlParams = Pick<SpotifyFetchOptions, "accessToken"> & {
  deviceId?: string;
};

function withDeviceQuery(
  path: string,
  deviceId?: string,
): string {
  if (!deviceId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}device_id=${encodeURIComponent(deviceId)}`;
}

export async function startPlayback(
  params: PlaybackControlParams & {
    uris?: string[];
    contextUri?: string;
  },
): Promise<void> {
  const body: Record<string, unknown> = {};
  if (params.uris?.length) body.uris = params.uris;
  if (params.contextUri) body.context_uri = params.contextUri;

  await spotifyFetch<void>(withDeviceQuery("/me/player/play", params.deviceId), {
    accessToken: params.accessToken,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function pausePlayback(
  params: PlaybackControlParams,
): Promise<void> {
  await spotifyFetch<void>(withDeviceQuery("/me/player/pause", params.deviceId), {
    accessToken: params.accessToken,
    method: "PUT",
  });
}

export async function skipToNext(
  params: PlaybackControlParams,
): Promise<void> {
  await spotifyFetch<void>(withDeviceQuery("/me/player/next", params.deviceId), {
    accessToken: params.accessToken,
    method: "POST",
  });
}

export async function addToQueue(
  params: PlaybackControlParams & { uri: string },
): Promise<void> {
  await spotifyFetch<void>(
    `/me/player/queue?uri=${encodeURIComponent(params.uri)}`,
    {
      accessToken: params.accessToken,
      method: "POST",
    },
  );
}
