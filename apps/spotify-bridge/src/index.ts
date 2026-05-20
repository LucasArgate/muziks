import { loadConfig } from "./config.js";
import { LibrespotProcess } from "./librespot.js";
import { MuziksApiClient } from "./muziks-api-client.js";
import { SpotifyApiBridge } from "./spotify-api.js";
import { createBridgeWsServer } from "./ws/server.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const muziks = new MuziksApiClient(config);
  const spotify = new SpotifyApiBridge(config);
  const librespot = new LibrespotProcess(config);

  const { httpServer, close } = createBridgeWsServer({
    config,
    muziks,
    librespot,
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(config.PORT, config.HOST, () => {
      console.info(
        `[spotify-bridge] listening ws+http://${config.HOST}:${config.PORT}`,
      );
      if (!config.SPOTIFY_CLIENT_ID) {
        console.warn("[spotify-bridge] SPOTIFY_CLIENT_ID not set");
      }
      if (!spotify.clientId) {
        // logged above
      }
      resolve();
    });
    httpServer.on("error", reject);
  });

  const shutdown = async (signal: string) => {
    console.info(`[spotify-bridge] ${signal}, shutting down`);
    await librespot.stop();
    await close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[spotify-bridge] fatal", err);
  process.exit(1);
});
