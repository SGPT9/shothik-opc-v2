import crypto from "node:crypto";
export const CONVEX_APPLICATION_ID = "shothik-publishing";
export const CONVEX_JWT_KID = "shothik-convex-1";
export const CONVEX_JWT_PUBLIC_EXPONENT = "AQAB";

// SECURITY: Signing keys must never be committed to source control.
// The private key is read only from JWT_PRIVATE_KEY. The public modulus is read
// from CONVEX_JWT_PUBLIC_KEY_N, or derived from JWT_PRIVATE_KEY when unset.

function normalizePem(raw: string): string {
  let pem = raw.replace(/\\n/g, "\n").trim();
  if (pem && !pem.startsWith("-----BEGIN")) {
    pem = `-----BEGIN PRIVATE KEY-----\n${pem}\n-----END PRIVATE KEY-----`;
  }
  return pem;
}

export function getConfiguredConvexJwtPrivateKeyPem(): string {
  const raw = process.env.JWT_PRIVATE_KEY;
  return raw ? normalizePem(raw) : "";
}

export function getConfiguredConvexJwtPublicKeyN(): string {
  const explicit = (process.env.CONVEX_JWT_PUBLIC_KEY_N || "").replace(/\s+/g, "");
  if (explicit) return explicit;
  const pem = getConfiguredConvexJwtPrivateKeyPem();
  if (!pem) return "";
  try {
    const jwk = crypto.createPublicKey(crypto.createPrivateKey(pem)).export({ format: "jwk" }) as { n?: string };
    return jwk.n || "";
  } catch {
    return "";
  }
}

export function getConfiguredConvexJwks() {
  return {
    keys: [
      {
        kty: "RSA",
        use: "sig",
        kid: CONVEX_JWT_KID,
        alg: "RS256",
        n: getConfiguredConvexJwtPublicKeyN(),
        e: CONVEX_JWT_PUBLIC_EXPONENT,
      },
    ],
  };
}
