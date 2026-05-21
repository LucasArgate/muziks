import { sdkForAccessToken } from "../client";

export type PlaybackControlParams = {
  accessToken: string;
  deviceId?: string;
};

export async function startPlayback(
  params: PlaybackControlParams & {
    uris?: string[];
    contextUri?: string;
  },
): Promise<void> {
  const sdk = sdkForAccessToken(params.accessToken);
  const deviceId = params.deviceId ?? "";
  await sdk.player.startResumePlayback(
    deviceId,
    params.contextUri,
    params.uris,
  );
}

export async function pausePlayback(
  params: PlaybackControlParams,
): Promise<void> {
  const sdk = sdkForAccessToken(params.accessToken);
  await sdk.player.pausePlayback(params.deviceId ?? "");
}

export async function skipToNext(
  params: PlaybackControlParams,
): Promise<void> {
  const sdk = sdkForAccessToken(params.accessToken);
  await sdk.player.skipToNext(params.deviceId ?? "");
}

export async function addToQueue(
  params: PlaybackControlParams & { uri: string },
): Promise<void> {
  const sdk = sdkForAccessToken(params.accessToken);
  const deviceId = params.deviceId;
  await sdk.player.addItemToPlaybackQueue(
    params.uri,
    deviceId ? deviceId : undefined,
  );
}
