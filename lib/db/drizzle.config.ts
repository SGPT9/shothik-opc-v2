import { defineConfig } from "drizzle-kit";
import path from "path";
import fs from "fs";

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const envPath = path.resolve(__dirname, "../../.env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        databaseUrl = trimmed.substring("DATABASE_URL=".length).trim();
        break;
      }
    }
  }
}

if (!databaseUrl) {
  databaseUrl = "postgres://postgres:postgres@localhost:5432/shothik_dev";
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
