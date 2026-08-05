---
name: API gateway routing
description: Why /api requests bypass the web artifact's vite proxy in this workspace
---

The shared preview proxy routes `/api` to the api-server artifact (Express), NOT through the shothik web artifact's vite dev proxy. Any `/api` route Express doesn't implement or forward 404s, regardless of vite proxy config.

**Why:** artifact path ownership — api-server owns `/api`, shothik owns `/`. The vite `server.proxy` for `/api` never receives browser traffic here.

**How to apply:** any backend-bound `/api` route (chat SSE, conversations, uploads) must be implemented or passthrough-proxied in the api-server gateway; never rely on the web artifact's dev proxy.

**Upstream reachability:** `shothik.work` does not resolve (DNS NXDOMAIN) from this workspace as of Aug 2026, so live end-to-end checks against the real backend fail with 502 through the gateway. Verify gateway-bound features by running the api-server with `CHAT_API_ORIGIN` pointed at a local mock upstream instead.
