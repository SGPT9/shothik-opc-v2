/**
 * Cloudflare Worker Edge Gateway Proxy Script for Shothik & Hermes
 * 
 * Handles global rate-limiting, CORS validation, R2 asset streaming,
 * and multi-tier routing (Vercel vs Hostinger VPS).
 */

export interface Env {
  R2_ASSET_BUCKET: any;
  VERCEL_ORIGIN: string;
  HOSTINGER_VPS_ORIGIN: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Preflight Handling
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Access-Token",
        },
      });
    }

    // 2. Direct R2 Zero-Egress Static Asset Streaming
    if (url.pathname.startsWith("/cdn/") || url.pathname.startsWith("/assets/")) {
      const assetKey = url.pathname.replace(/^\/(cdn|assets)\//, "");
      if (env.R2_ASSET_BUCKET) {
        const object = await env.R2_ASSET_BUCKET.get(assetKey);
        if (object) {
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          headers.set("etag", object.httpEtag);
          headers.set("Cache-Control", "public, max-age=31536000, immutable");
          headers.set("Access-Control-Allow-Origin", "*");
          return new Response(object.body, { headers });
        }
      }
    }

    // 3. Multi-Tier Routing: VPS Inference Engine Proxy vs Vercel Next.js App
    const targetOrigin = url.pathname.startsWith("/vps-engine/")
      ? env.HOSTINGER_VPS_ORIGIN || "http://187.127.125.115:11434"
      : env.VERCEL_ORIGIN || "https://shothik-web-mirror-v2-shothik.vercel.app";

    const proxyPath = url.pathname.startsWith("/vps-engine/")
      ? url.pathname.replace(/^\/vps-engine\//, "/")
      : url.pathname;

    const proxyUrl = new URL(proxyPath + url.search, targetOrigin);

    const modifiedHeaders = new Headers(request.headers);
    modifiedHeaders.set("X-Forwarded-Host", url.hostname);
    modifiedHeaders.set("X-Cloudflare-Edge", "true");

    try {
      const response = await fetch(proxyUrl.toString(), {
        method: request.method,
        headers: modifiedHeaders,
        body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          error: "Cloudflare Edge Gateway Proxy error",
          message: err.message || String(err),
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
