import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { resolveDatabaseUrl } from "./resolve-database-url";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = resolveDatabaseUrl();

  if (!client) {
    client = postgres(url, {
      prepare: false,
      max: 1,
      ssl: url.includes("supabase.com") ? "require" : undefined,
      connect_timeout: 15,
    });
    db = drizzle(client, { schema });
  }

  return db!;
}
