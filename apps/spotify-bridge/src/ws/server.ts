import { createServer, type IncomingMessage } from "node:http";

import { WebSocketServer, type WebSocket } from "ws";
import { z } from "zod";

import type { BridgeConfig } from "../config.js";
import type { LibrespotProcess } from "../librespot.js";
import type { MuziksApiClient } from "../muziks-api-client.js";

const subscribeSchema = z.object({
  type: z.literal("subscribe"),
  playerId: z.string().uuid(),
});

const pingSchema = z.object({
  type: z.literal("ping"),
});

const clientMessageSchema = z.discriminatedUnion("type", [
  subscribeSchema,
  pingSchema,
]);

type ClientContext = {
  playerId?: string;
};

export type BridgeWsServer = {
  httpServer: ReturnType<typeof createServer>;
  wss: WebSocketServer;
  close: () => Promise<void>;
};

export function createBridgeWsServer(options: {
  config: BridgeConfig;
  muziks: MuziksApiClient;
  librespot: LibrespotProcess;
}): BridgeWsServer {
  const { config, librespot } = options;

  const httpServer = createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          ok: true,
          librespot: librespot.running,
        }),
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ server: httpServer });
  const contexts = new WeakMap<WebSocket, ClientContext>();

  wss.on("connection", (socket, request) => {
    contexts.set(socket, {});
    send(socket, { type: "bridge.ready", version: "0.0.0" });

    socket.on("message", (data) => {
      void handleMessage(socket, data, request);
    });
  });

  async function handleMessage(
    socket: WebSocket,
    data: WebSocket.RawData,
    request: IncomingMessage,
  ): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(data));
    } catch {
      send(socket, { type: "error", code: "invalid_json" });
      return;
    }

    const message = clientMessageSchema.safeParse(parsed);
    if (!message.success) {
      send(socket, { type: "error", code: "invalid_message" });
      return;
    }

    const ctx = contexts.get(socket) ?? {};

    if (message.data.type === "ping") {
      send(socket, { type: "pong" });
      return;
    }

    if (message.data.type === "subscribe") {
      ctx.playerId = message.data.playerId;
      contexts.set(socket, ctx);
      send(socket, {
        type: "subscribed",
        playerId: message.data.playerId,
      });

      if (config.LIBRESPOT_AUTOSTART) {
        try {
          await librespot.start(message.data.playerId);
          send(socket, { type: "librespot.started" });
        } catch (err) {
          send(socket, {
            type: "error",
            code: "librespot_start_failed",
            message: err instanceof Error ? err.message : "unknown",
          });
        }
      }

      console.info(
        "[ws] subscribe",
        message.data.playerId,
        request.socket.remoteAddress,
      );
    }
  }

  librespot.onEvent((event) => {
    const payload = { type: "playback.event" as const, event };
    for (const client of wss.clients) {
      if (client.readyState !== client.OPEN) continue;
      const ctx = contexts.get(client);
      if (ctx?.playerId && event.playerId && ctx.playerId !== event.playerId) {
        continue;
      }
      send(client, payload);
    }
  });

  return {
    httpServer,
    wss,
    close: () =>
      new Promise((resolve, reject) => {
        wss.close((err) => {
          if (err) reject(err);
          else httpServer.close(() => resolve());
        });
      }),
  };
}

function send(socket: WebSocket, payload: Record<string, unknown>): void {
  socket.send(JSON.stringify(payload));
}
