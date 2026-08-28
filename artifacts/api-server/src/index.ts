import app from "./app";
import { logger } from "./lib/logger";
import { dbAutoSync } from "./lib/db-bootstrap";

const rawPort = process.env["PORT"] ?? "8080";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");

  // Run automated database health and schema auto-sync
  try {
    const dbStatus = await dbAutoSync.autoSync();
    logger.info({ dbStatus }, "[Startup] Database auto-sync complete");
  } catch (dbErr: any) {
    logger.warn({ error: dbErr.message }, "[Startup] Database auto-sync warning");
  }
});
