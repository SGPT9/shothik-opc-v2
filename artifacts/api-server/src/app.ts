import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Secure HTTP response headers
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

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
import { gracefulShutdownSupervisor } from "./lib/lifecycle/graceful-shutdown";

// Strict CORS Origin Filtering
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "https://shothikgpt.com",
      "https://www.shothikgpt.com",
      "https://shothik.ai",
      "https://www.shothik.ai",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:8080",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:8080",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests or test/dev environments
      if (!origin || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".shothikgpt.com") ||
        origin.endsWith(".shothik.ai")
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    credentials: true,
  }),
);

// Standard API Rate Limiter (100 req/min; relaxed in test runs)
const isTestEnv = process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isTestEnv ? 20000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP, please try again after 60 seconds.",
    },
  },
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(gracefulShutdownSupervisor.trackRequestMiddleware());

import healthRouter from "./routes/health";
import docsRouter from "./routes/docs";

app.use(healthRouter);
app.use(docsRouter);

app.use("/api", apiRateLimiter, router);

// 404 Handler for undefined API routes
app.use((_req, res) => {
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
