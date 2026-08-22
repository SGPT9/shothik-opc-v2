/**
 * Cloudflare Workers ES Module entrypoint.
 * Serves the Vite-built Shothik frontend from the [site] KV bucket.
 * The Express API server runs separately in Docker.
 */
import { getAssetFromKV, NotFoundError, MethodNotAllowedError } from "@cloudflare/kv-asset-handler";
// @ts-ignore — injected at build time by wrangler
import manifestJSON from "__STATIC_CONTENT_MANIFEST";

const assetManifest = JSON.parse(manifestJSON);

interface Env {
  __STATIC_CONTENT: KVNamespace;
  ENVIRONMENT: string;
  INSFORGE_PROJECT: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      return await getAssetFromKV(
        { request, waitUntil: ctx.waitUntil.bind(ctx) },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );
    } catch (e) {
      if (e instanceof NotFoundError || e instanceof MethodNotAllowedError) {
        // SPA fallback — serve index.html for any unmatched route
        try {
          const indexRequest = new Request(
            new URL("/index.html", request.url).toString(),
            request
          );
          const response = await getAssetFromKV(
            { request: indexRequest, waitUntil: ctx.waitUntil.bind(ctx) },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: assetManifest,
            }
          );
          return new Response(response.body, {
            headers: response.headers,
            status: 200,
          });
        } catch {
          return new Response("Not Found", { status: 404 });
        }
      }
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
