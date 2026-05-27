import { sdkForAccessToken } from "../client";
import { playerVoidRequest } from "./raw-player-control";

export type PlaybackControlParams = {
  accessToken: string;
  deviceId?: string;
};

function deviceArg(deviceId?: string): string {
  return deviceId ?? "";
}

export async function startPlayback(
  params: PlaybackControlParams & {
    uris?: string[];
    contextUri?: string;
  },
): Promise<void> {
  const sdk = sdkForAccessToken(params.accessToken);
  await sdk.player.startResumePlayback(
    deviceArg(params.deviceId),
    params.contextUri,
    params.uris,
  );
}

export async function pausePlayback(
  params: PlaybackControlParams,
): Promise<void> {
  await playerVoidRequest(params.accessToken, "PUT", "me/player/pause", {
    deviceId: params.deviceId,
  });
}

export async function skipToNext(
  params: PlaybackControlParams,
): Promise<void> {
  await playerVoidRequest(params.accessToken, "POST", "me/player/next", {
    deviceId: params.deviceId,
  });
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
