const SDK_SCRIPT = "https://sdk.scdn.co/spotify-player.js";

let sdkLoadPromise: Promise<void> | null = null;

function loadSpotifySdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Spotify SDK requires a browser"));
  }

  if (window.Spotify?.Player) {
    return Promise.resolve();
  }

  if (!sdkLoadPromise) {
    sdkLoadPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${SDK_SCRIPT}"]`,
      );
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Spotify SDK")),
        );
        return;
      }

      const script = document.createElement("script");
      script.src = SDK_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Spotify SDK"));
      document.body.appendChild(script);
    });
  }

  return sdkLoadPromise;
}

async function fetchAccessToken(): Promise<string> {
  const response = await fetch("/api/spotify/token");
  if (!response.ok) {
    throw new Error("Spotify session expired");
  }
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export type SpotifyServiceInstance = {
  player: Spotify.Player;
  getDeviceId: () => string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export async function initializeSpotifyPlayer(
  playerName: string,
): Promise<SpotifyServiceInstance> {
  await loadSpotifySdk();

  if (!window.Spotify?.Player) {
    throw new Error("Spotify Web Playback SDK unavailable");
  }

  let deviceId: string | null = null;

  const player = new window.Spotify.Player({
    name: playerName,
    getOAuthToken: (cb) => {
      void fetchAccessToken().then(cb);
    },
    volume: 0.8,
  });

  player.addListener("ready", ({ device_id }) => {
    deviceId = device_id;
  });

  player.addListener("not_ready", () => {
    deviceId = null;
  });

  return {
    player,
    getDeviceId: () => deviceId,
    connect: async () => {
      const connected = await player.connect();
      if (!connected) {
        throw new Error("Could not connect Spotify player");
      }
    },
    disconnect: () => player.disconnect(),
  };
}
