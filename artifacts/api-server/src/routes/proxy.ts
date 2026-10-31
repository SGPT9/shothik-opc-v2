import { Router, type IRouter, type Request, type Response } from "express";
import { Readable } from "node:stream";
import type { ReadableStream as WebReadableStream } from "node:stream/web";
import { logger } from "../lib/logger";

// Upstream origin for all /api routes the local server doesn't implement
// (chat, conversations, auth, etc.). Overridable for development/testing
// (e.g. pointing at a local mock while the real backend is unreachable).
const UPSTREAM_ORIGIN = process.env.CHAT_API_ORIGIN || "https://www.shothikgpt.com";
const STANDALONE_LOCAL_MODE = process.env.STANDALONE_LOCAL_MODE === "true";

const HOP_BY_HOP = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const router: IRouter = Router();

// Catch-all passthrough proxy. Streams request and response bodies (including
// multipart uploads and SSE) without buffering or fixed timeouts. Mounted
// last so local routes take precedence.
router.use(async (req: Request, res: Response) => {
  if (STANDALONE_LOCAL_MODE) {
    res.status(404).json({
      success: false,
      error: "Not Found",
      code: "ROUTE_NOT_FOUND",
      message: `Endpoint ${req.method} ${req.url} is not registered in standalone local mode.`,
    });
  }

  const targetUrl = `${UPSTREAM_ORIGIN}/api${req.url}`;
  const controller = new AbortController();
  // Abort upstream work when the client goes away.
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });
  try {
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value !== "string") continue;
      const lower = key.toLowerCase();
      if (HOP_BY_HOP.has(lower) || lower === "content-length") continue;
      headers[key] = value;
    }

    const hasBody = !["GET", "HEAD"].includes(req.method);
    let body: string | WebReadableStream | undefined;
    if (hasBody) {
      const contentType = String(req.headers["content-type"] ?? "");
      const parsedByExpress =
        (contentType.includes("application/json") ||
          contentType.includes("application/x-www-form-urlencoded")) &&
        req.body !== undefined;
      if (parsedByExpress) {
        // Express already consumed the stream; re-serialize as JSON.
        body = JSON.stringify(req.body);
        headers["content-type"] = "application/json";
      } else {
        // Untouched stream (multipart uploads, binary, etc.) — pipe through.
        body = Readable.toWeb(req);
      }
    }

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      signal: controller.signal,
      redirect: "follow",
      // Required by Node's fetch when the request body is a stream.
      ...(body && typeof body !== "string" ? { duplex: "half" as const } : {}),
    } as Parameters<typeof fetch>[1]);

    const vercelError = upstream.headers.get("x-vercel-error");
    if (upstream.status === 402 || vercelError === "DEPLOYMENT_DISABLED") {
      logger.warn({ targetUrl, status: upstream.status, vercelError }, "[proxy] Upstream cloud deployment disabled, falling back to local 404");
      res.status(404).json({
        success: false,
        error: "Not Found",
        code: "UPSTREAM_INACTIVE",
        message: `Endpoint ${req.method} ${req.url} not implemented locally, and upstream cloud gateway is currently inactive.`,
      });
    }

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      if (
        HOP_BY_HOP.has(key) ||
        key === "content-encoding" ||
        key === "content-length"
      )
        return;
      res.setHeader(key, value);
    });

    if (upstream.body) {
      Readable.fromWeb(upstream.body as never).pipe(res);
    } else {
      res.end();
    }
  } catch (error: any) {
    const aborted = controller.signal.aborted;
    if (!aborted) {
      const errMsg = error?.message || String(error);
      logger.warn({ message: errMsg, targetUrl }, "Upstream proxy request unreachable");
    }
    if (!res.headersSent) {
      res.status(502).json({
        error: "The AI service is unreachable right now. Please try again.",
      });
    } else {
      res.end();
    }
  }
});

export default router;
