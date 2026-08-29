import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(["/health", "/healthz"], (_req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

app.use("/api", router);

// 404 Handler for undefined API routes
app.use("/api/*", (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "API endpoint does not exist",
    },
  });
});

// Centralized Error-Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ error: err.message, stack: err.stack }, "[Express] Centralized error caught");
  if (res.headersSent) return;
  
  const statusCode = typeof err.status === "number" ? err.status : (typeof err.statusCode === "number" ? err.statusCode : 500);
  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      message: err.message || "An unexpected server error occurred",
    },
  });
});

export default app;
