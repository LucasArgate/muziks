import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDatabaseUrl } from "./resolve-database-url";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let cachedUrl: string | null = null;

export function getDb() {
  const url = resolveDatabaseUrl();

  if (!client || cachedUrl !== url) {
    if (client) {
      void client.end({ timeout: 1 });
    }
    client = postgres(url, {
      prepare: false,
      max: 1,
      ssl: url.includes("supabase.com") ? "require" : undefined,
      connect_timeout: 15,
      idle_timeout: 20,
    });
    db = drizzle(client, { schema });
    cachedUrl = url;
  }

  return db!;
}
