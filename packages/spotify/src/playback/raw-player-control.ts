import { SPOTIFY_API_BASE } from "../constants";
import { createSpotifyFetchWithRetry } from "../fetch-with-retry";

function deviceQuery(deviceId?: string): string {
  if (!deviceId) return "";
  return `?${new URLSearchParams({ device_id: deviceId }).toString()}`;
}

function resolveSpotifyErrorMessage(status: number, text: string): string {
  try {
    const json = JSON.parse(text) as { error?: { message?: string } };
    if (json?.error?.message) return json.error.message;
  } catch {
    /* body is not JSON */
  }
  if (text.length > 0 && text.length <= 200) return text;
  return `spotify_http_${status}`;
}

/**
 * Player control calls that return 204 or a non-JSON body (common on Connect devices).
 * Avoids @spotify/web-api-ts-sdk DefaultResponseDeserializer JSON.parse on opaque text.
 */
export async function playerVoidRequest(
  accessToken: string,
  method: "POST" | "PUT",
  path: string,
  options?: { deviceId?: string; body?: unknown },
): Promise<void> {
  const fetchImpl = createSpotifyFetchWithRetry();
  const url = `${SPOTIFY_API_BASE}/${path}${deviceQuery(options?.deviceId)}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
  };
  let requestBody: string | undefined;
  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(options.body);
  }

  const response = await fetchImpl(url, {
    method,
    headers,
    body: requestBody,
  });

  const text = await response.text().catch(() => "");

  if (!response.ok) {
    throw new Error(resolveSpotifyErrorMessage(response.status, text));
  }
}
