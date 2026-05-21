/** Parses JSON bodies safely; returns null on empty or non-JSON responses. */
export async function parseJsonResponse<T>(
  response: Response,
): Promise<T | null> {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
