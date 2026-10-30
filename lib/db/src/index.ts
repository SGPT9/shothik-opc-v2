import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

import fs from "fs";
import path from "path";

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  for (const envFile of [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "../../.env.local"),
  ]) {
    if (fs.existsSync(envFile)) {
      const lines = fs.readFileSync(envFile, "utf8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("DATABASE_URL=")) {
          connectionString = trimmed.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
          break;
        }
      }
      if (connectionString) break;
    }
  }
}
if (!connectionString) {
  connectionString = "postgres://postgres:postgres@localhost:5432/shothik_dev";
}

const isCloud = connectionString.includes(".pooler.supabase.com") || connectionString.includes(".supabase.co") || connectionString.includes("sslmode=require");

export const pool = new Pool({
  connectionString,
  ssl: isCloud ? { rejectUnauthorized: false } : undefined,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
});
export const db = drizzle(pool, { schema });

export * from "./sqlite";
export * from "./schema";
export * from "./sync-engine";
