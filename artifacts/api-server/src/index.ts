import fs from "fs";
import path from "path";

// Auto-load .env into process.env if present
for (const envFile of [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), "../../.env.local"),
]) {
  if (fs.existsSync(envFile)) {
    try {
      const lines = fs.readFileSync(envFile, "utf8").split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const eqIdx = trimmed.indexOf("=");
          const k = trimmed.substring(0, eqIdx).trim();
          const v = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    } catch {
      // ignore
    }
  }
}

import app from "./app";
import { logger } from "./lib/logger";
import { dbAutoSync } from "./lib/db-bootstrap";
import { gracefulShutdownSupervisor } from "./lib/lifecycle/graceful-shutdown";

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Attach process lifecycle supervisor for graceful zero-downtime drain on SIGTERM / SIGINT
  gracefulShutdownSupervisor.attachProcessSignals(server);

  // Run automated database health and schema auto-sync
  try {
    const dbStatus = await dbAutoSync.autoSync();
    logger.info({ dbStatus }, "[Startup] Database auto-sync complete");
  } catch (dbErr: any) {
    logger.warn({ error: dbErr.message }, "[Startup] Database auto-sync warning");
  }
});
