export async function dequeueAfterTrackChange(slug: string): Promise<boolean> {
  const response = await fetch(`/api/players/${encodeURIComponent(slug)}/queue/dequeue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "track_uri_changed" }),
  });

  if (!response.ok) {
    return false;
  }

  const body = (await response.json().catch(() => null)) as {
    dequeued?: unknown;
  } | null;

  return Boolean(body?.dequeued);
}
