import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const PLAYER_APP_URL = Deno.env.get("PLAYER_APP_URL");
const PLAYBACK_WORKER_SECRET = Deno.env.get("PLAYBACK_WORKER_SECRET");

Deno.serve(async () => {
  if (!PLAYER_APP_URL || !PLAYBACK_WORKER_SECRET) {
    return new Response(
      JSON.stringify({ error: "misconfigured", missing: ["PLAYER_APP_URL", "PLAYBACK_WORKER_SECRET"] }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const base = PLAYER_APP_URL.replace(/\/$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(`${base}/api/internal/playback-tick`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PLAYBACK_WORKER_SECRET}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    const text = await response.text();
    console.log(
      JSON.stringify({
        status: response.status,
        body: text.slice(0, 500),
      }),
    );

    return new Response(text, {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "playback_sync_failed";
    console.error(JSON.stringify({ error: message }));
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timeout);
  }
});
