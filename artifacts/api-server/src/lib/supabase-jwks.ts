import crypto, { type KeyObject } from "node:crypto";
import { logger } from "./logger";

/**
 * Supabase Auth JWKS verifier.
 *
 * Supabase projects created after mid-2025 (including `xgnzsikvguswhtozvokx`) sign
 * user access tokens with asymmetric keys (ES256 / RS256) published at
 * `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`. A shared HS256 secret cannot
 * verify those tokens, so we keep a synchronous in-memory key cache:
 *
 *  - seeded from SUPABASE_JWKS (JSON `{ "keys": [...] }`) if provided,
 *  - otherwise seeded with the project's current public signing key,
 *  - refreshed from the JWKS endpoint at startup and whenever an unknown `kid` appears.
 *
 * Only public keys are handled here; nothing in this file is secret.
 */

interface Jwk {
  kid?: string;
  kty: string;
  alg?: string;
  crv?: string;
  x?: string;
  y?: string;
  n?: string;
  e?: string;
  use?: string;
}

// Current public ES256 key for project xgnzsikvguswhtozvokx (from its public JWKS endpoint).
const DEFAULT_PROJECT_JWKS: Jwk[] = [
  {
    alg: "ES256",
    crv: "P-256",
    kid: "3cbb8814-68a6-4917-99f8-5de059a76cc7",
    kty: "EC",
    use: "sig",
    x: "6o2_n-SnDxZnMQAR2WQFuBSqsTvsNvBOzn_2iUAdhgI",
    y: "GNvBuushEIuU_QHkBCInT9U-32Lm-KEgXh7TKL5sWv8",
  },
];

export const SUPABASE_PROJECT_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://xgnzsikvguswhtozvokx.supabase.co"
).replace(/\/+$/, "");

const keys = new Map<string, { key: KeyObject; alg: string }>();
let lastFetch = 0;
let inflight: Promise<void> | null = null;
const REFRESH_COOLDOWN_MS = 60_000;

function addJwk(jwk: Jwk): void {
  try {
    if (jwk.use && jwk.use !== "sig") return;
    const alg = jwk.alg || (jwk.kty === "EC" ? "ES256" : jwk.kty === "RSA" ? "RS256" : "");
    if (alg !== "ES256" && alg !== "RS256") return;
    const key = crypto.createPublicKey({ key: jwk as unknown as import("node:crypto").JsonWebKeyInput["key"], format: "jwk" });
    keys.set(jwk.kid || `${alg}:default`, { key, alg });
  } catch (err) {
    logger.warn({ err, kid: jwk.kid }, "[supabase-jwks] ignoring unusable JWK");
  }
}

function seed(): void {
  const raw = process.env.SUPABASE_JWKS;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      for (const k of (parsed.keys || parsed) as Jwk[]) addJwk(k);
      return;
    } catch (err) {
      logger.warn({ err }, "[supabase-jwks] SUPABASE_JWKS is not valid JSON; using defaults");
    }
  }
  for (const k of DEFAULT_PROJECT_JWKS) addJwk(k);
}
seed();

/** Fetch the live JWKS (rate-limited). Safe to call fire-and-forget. */
export function refreshSupabaseJwks(force = false): Promise<void> {
  if (inflight) return inflight;
  if (!force && Date.now() - lastFetch < REFRESH_COOLDOWN_MS) return Promise.resolve();
  if (typeof fetch !== "function") return Promise.resolve();
  lastFetch = Date.now();
  inflight = (async () => {
    try {
      const res = await fetch(`${SUPABASE_PROJECT_URL}/auth/v1/.well-known/jwks.json`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { keys?: Jwk[] };
      for (const k of body.keys || []) addJwk(k);
    } catch (err) {
      logger.debug({ err }, "[supabase-jwks] JWKS refresh failed; keeping cached keys");
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  void refreshSupabaseJwks(true);
}

/**
 * Synchronously verify an ES256/RS256 JWS signature against cached Supabase keys.
 * Unknown `kid`s trigger a background refresh so a rotated key works on the next request.
 */
export function verifySupabaseAsymmetricSignature(
  header: { alg?: string; kid?: string },
  signingInput: string,
  signatureB64: string,
): boolean {
  const alg = header.alg;
  if (alg !== "ES256" && alg !== "RS256") return false;
  const candidates = header.kid
    ? [keys.get(header.kid)].filter(Boolean)
    : [...keys.values()].filter((k) => k.alg === alg);
  if (candidates.length === 0) {
    void refreshSupabaseJwks();
    return false;
  }
  const data = Buffer.from(signingInput);
  const sig = Buffer.from(signatureB64, "base64url");
  for (const c of candidates) {
    if (!c || c.alg !== alg) continue;
    try {
      const ok =
        alg === "ES256"
          ? crypto.verify("sha256", data, { key: c.key, dsaEncoding: "ieee-p1363" }, sig)
          : crypto.verify("sha256", data, c.key, sig);
      if (ok) return true;
    } catch {
      /* try next key */
    }
  }
  return false;
}

/** Test hook: register a public JWK. */
export function __addSupabaseJwkForTests(jwk: Jwk): void {
  addJwk(jwk);
}
