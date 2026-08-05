interface Env {
  CLERK_API_URL: string;
  VERCEL_GATEWAY_URL: string;
  HERMES_WORKER_SHARED_SECRET: string;
}

interface JWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

interface JWKS {
  keys: JWK[];
}

const keyCache = new Map<string, CryptoKey>();
const rateLimits = new Map<string, { tokens: number; lastRefill: number }>();

// Helper to base64url decode
function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const raw = atob(str);
  const result = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    result[i] = raw.charCodeAt(i);
  }
  return result;
}

// Fetch and cache Clerk RSA public keys
async function getClerkPublicKey(kid: string, clerkApiUrl: string): Promise<CryptoKey | null> {
  const cached = keyCache.get(kid);
  if (cached) return cached;

  try {
    const res = await fetch(`${clerkApiUrl}/.well-known/jwks.json`);
    if (!res.ok) throw new Error("Failed to fetch JWKS from Clerk");
    const jwks = (await res.json()) as JWKS;
    const jwk = jwks.keys.find((k) => k.kid === kid);
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );

    keyCache.set(kid, key);
    return key;
  } catch (err) {
    console.error("Clerk JWKS retrieval/import failed:", err);
    return null;
  }
}

// Verify Clerk JWT Token
async function verifyClerkToken(token: string, clerkApiUrl: string): Promise<any | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerStr, payloadStr, signatureStr] = parts;

  try {
    const header = JSON.parse(new TextDecoder().decode(base64urlDecode(headerStr)));
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadStr)));

    const kid = header.kid;
    if (!kid) return null;

    const publicKey = await getClerkPublicKey(kid, clerkApiUrl);
    if (!publicKey) return null;

    const signature = base64urlDecode(signatureStr);
    const data = new TextEncoder().encode(`${headerStr}.${payloadStr}`);

    const isValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      signature as any,
      data
    );

    if (!isValid) return null;

    // Check expiration and issue time claims
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    if (payload.nbf && now < payload.nbf) return null;

    return payload;
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
  }
}

// Token Bucket Rate Limiter (In-Memory on Edge Isolate)
function checkRateLimit(
  key: string,
  maxTokens = 60,
  refillRate = 0.5 // 1 token every 2 seconds
): boolean {
  const now = Date.now() / 1000;
  const state = rateLimits.get(key) || { tokens: maxTokens, lastRefill: now };

  let tokens = state.tokens;
  const lastRefill = state.lastRefill;

  // Calculate accumulated tokens
  const elapsed = now - lastRefill;
  tokens = Math.min(maxTokens, tokens + elapsed * refillRate);

  if (tokens >= 1) {
    tokens -= 1;
    rateLimits.set(key, { tokens, lastRefill: now });
    return true;
  }

  // Still update the timestamp to prevent refill locking
  rateLimits.set(key, { tokens, lastRefill: now });
  return false;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Cors preflight checks
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type, x-chat-device-id",
        },
      });
    }

    // Auth Validation: Extract bearer token from headers
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyClerkToken(token, env.CLERK_API_URL);
    if (!decodedToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Rate Limiting: Grouped by user ID (sub claim in Clerk JWT)
    const userId = decodedToken.sub || "anonymous";
    const isAllowed = checkRateLimit(userId);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: "Too Many Requests: Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Proxy request directly to Vercel Gateway
    const targetUrl = new URL(url.pathname + url.search, env.VERCEL_GATEWAY_URL);
    const headers = new Headers(request.headers);

    // Inject shared secret so Vercel knows this came through the worker gate
    headers.set("X-Hermes-Worker-Secret", env.HERMES_WORKER_SHARED_SECRET);

    const proxyRequest = new Request(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: "manual",
    });

    try {
      const response = await fetch(proxyRequest);
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Access-Control-Allow-Origin", "*");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Gateway Timeout: Backend unreachable" }),
        { status: 504, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
