import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

import fs from "fs";
import path from "path";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        connectionString = trimmed.substring("DATABASE_URL=".length).trim();
        break;
      }
    }
  }
}
if (!connectionString) {
  connectionString = "postgres://postgres:postgres@localhost:5432/shothik_dev";
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./sqlite";
export * from "./schema";
export * from "./sync-engine";
