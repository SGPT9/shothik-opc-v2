# ADR 0002: Canonical Production Domain (`shothikgpt.com`) & Edge Subdomain Topology

## Status
**ACCEPTED** (2026-08-23)

---

## Context
The platform was previously referencing placeholder domains (`shothik.ai`). The official, verified production domain for the Shothik platform is **`shothikgpt.com`**.

---

## Decision

We establish **`shothikgpt.com`** as the global canonical domain with the following multi-tier edge subdomain topology:

```
                                      shothikgpt.com (Cloudflare DNS & WAF)
                                                        │
         ┌──────────────────────┬───────────────────────┼───────────────────────┬──────────────────────┐
         ▼                      ▼                       ▼                       ▼                      ▼
  [1] PRIMARY WEB        [2] API GATEWAY         [3] REALTIME WEBSOCKET  [4] DOCUMENTATION      [5] SOUP REGISTRY
  https://shothikgpt.com https://api.shothikgpt.com wss://ws.shothikgpt.com https://docs.shothikgpt.com https://models.shothikgpt.com
  (React 19 / Next.js)   (53 Express Endpoints)  (WebRTC Voice & Swarm)  (OpenAPI 3.1 & SDKs)   (GGUF Quantized Store)
```

---

## Technical Specifications

1. **Root Domain & Primary Web (`shothikgpt.com`)**:
   - Host: Vercel / Cloudflare Pages Edge
   - Routing: Ask-First minimalist shell, Intent-first router, Work Canvas.
   - SSL/TLS: Full (Strict) with HSTS 300-day preload.

2. **API Gateway (`api.shothikgpt.com`)**:
   - Host: Hostinger VPS / Railway Docker Container
   - Routing: 53 REST API routes, InsForge BaaS integration, bKash MFS IPN webhooks.
   - Protection: Cloudflare Turnstile bot verification & distributed leaky-bucket rate limiter.

3. **Realtime Audio & Swarm WebSockets (`ws.shothikgpt.com`)**:
   - Protocol: Secure WebSockets (`wss://`) with resilient auto-reconnect mesh.
   - Capabilities: 20 FPS VTuber visemes, sub-200ms WebRTC voice stream.

4. **Developer Docs (`docs.shothikgpt.com`)**:
   - Content: OpenAPI 3.1 specifications, `@shothik/sdk` guides, Claude/Cursor MCP integration instructions.

---

## Consequences & Verification
* All `.env.production` templates, API URLs, and documentation will reference `https://shothikgpt.com` and `https://api.shothikgpt.com`.
* CORS headers on `api.shothikgpt.com` strictly allow `https://shothikgpt.com` and `https://app.shothikgpt.com`.
