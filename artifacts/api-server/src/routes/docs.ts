import { Router, type Request, type Response } from "express";
import { buildOpenApiSpec } from "../lib/openapi/openapi-builder";

const router = Router();
const openApiSpec = buildOpenApiSpec();

/**
 * GET /docs/openapi.json & /api/docs/openapi.json
 * Machine-readable OpenAPI 3.1.0 document
 */
router.get(["/openapi.json", "/docs/openapi.json", "/api/docs/openapi.json"], (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(openApiSpec);
});

/**
 * GET /docs & /api/docs
 * Interactive Scalar OpenAPI 3.1 documentation portal
 */
router.get(["/docs", "/api/docs"], (_req: Request, res: Response) => {
  const html = `<!doctype html>
<html>
  <head>
    <title>Shothik Unified AI Platform — API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>" />
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #09090b;
        color: #f4f4f5;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/docs/openapi.json"
      data-proxy-url=""
      data-theme="dark"
      src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"
    ></script>
  </body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
});

export default router;
