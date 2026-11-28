import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  for (const envFile of [
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../.env.local"),
    path.resolve(__dirname, "./.env"),
  ]) {
    if (fs.existsSync(envFile)) {
      const lines = fs.readFileSync(envFile, "utf8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("DATABASE_URL=")) {
          databaseUrl = trimmed.substring("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
          break;
        }
      }
      if (databaseUrl) break;
    }
  }
}

if (!databaseUrl) {
  databaseUrl = "postgres://postgres:postgres@localhost:5432/shothik_dev";
}

export default defineConfig({
  schema: "./src/schema/*.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
