import { spawn, type ChildProcess } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

import type { BridgeConfig } from "./config.js";

export type LibrespotPlaybackEvent = {
  raw: string;
  playerId?: string;
};

export type LibrespotEventHandler = (event: LibrespotPlaybackEvent) => void;

/**
 * Gerencia o processo librespot (--onevent) fora do Next.js.
 * @see docs/tech/ADR-spotify-state-sync.md
 */
export class LibrespotProcess {
  private child: ChildProcess | null = null;
  private handlers: LibrespotEventHandler[] = [];

  constructor(private readonly config: BridgeConfig) {}

  onEvent(handler: LibrespotEventHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  get running(): boolean {
    return this.child !== null && this.child.exitCode === null;
  }

  async start(playerId: string): Promise<void> {
    if (this.running) {
      return;
    }

    await mkdir(this.config.LIBRESPOT_CACHE_DIR, { recursive: true });

    const args = [
      "--name",
      this.config.LIBRESPOT_PLAYER_NAME,
      "--cache",
      join(this.config.LIBRESPOT_CACHE_DIR, playerId),
      "--onevent",
      "echo",
    ];

    this.child = spawn(this.config.LIBRESPOT_BIN, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    this.child.stdout?.on("data", (chunk: Buffer) => {
      const line = chunk.toString("utf8").trim();
      if (!line) return;
      const event: LibrespotPlaybackEvent = { raw: line, playerId };
      for (const handler of this.handlers) {
        handler(event);
      }
    });

    this.child.stderr?.on("data", (chunk: Buffer) => {
      console.error("[librespot]", chunk.toString("utf8").trim());
    });

    this.child.on("exit", (code, signal) => {
      console.warn(`[librespot] exited code=${code} signal=${signal}`);
      this.child = null;
    });
  }

  async stop(): Promise<void> {
    if (!this.child) return;
    this.child.kill("SIGTERM");
    this.child = null;
  }
}
