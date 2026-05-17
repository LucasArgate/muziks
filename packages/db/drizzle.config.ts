import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit loads this config as CommonJS on Node.
 * Do not use `import.meta.dirname` — it is empty/undefined in CJS and breaks path.resolve.
 */
const packageRoot =
  typeof __dirname === "string"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(packageRoot, "../..");

for (const envPath of [
  path.join(monorepoRoot, ".env.local"),
  path.join(monorepoRoot, ".env"),
  path.join(packageRoot, ".env.local"),
  path.join(packageRoot, ".env"),
]) {
  config({ path: envPath, override: false });
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
