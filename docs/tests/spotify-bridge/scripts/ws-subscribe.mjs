#!/usr/bin/env node
/**
 * Cliente mínimo para testar WebSocket do spotify-bridge (Node 20+ com WebSocket global).
 * Uso: node docs/tests/spotify-bridge/scripts/ws-subscribe.mjs --player-id <uuid> [--url ws://127.0.0.1:8765]
 */
const args = process.argv.slice(2);
function getArg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const url = getArg("--url") ?? "ws://127.0.0.1:8765";
const playerId = getArg("--player-id");

if (!playerId) {
  console.error("Uso: --player-id <uuid> [--url ws://host:port]");
  process.exit(1);
}

if (typeof WebSocket === "undefined") {
  console.error("WebSocket global indisponível — use Node 20+ ou wscat (ver docker-e2e.md §5).");
  process.exit(1);
}

const ws = new WebSocket(url);

ws.addEventListener("open", () => {
  console.log("[open]", url);
  ws.send(JSON.stringify({ type: "subscribe", playerId }));
  setInterval(() => {
    ws.send(JSON.stringify({ type: "ping" }));
  }, 30_000);
});

ws.addEventListener("message", (event) => {
  console.log("[msg]", String(event.data));
});

ws.addEventListener("close", (event) => {
  console.log("[close]", event.code, event.reason);
});

ws.addEventListener("error", () => {
  console.error("[error] falha na conexão");
  process.exit(1);
});
