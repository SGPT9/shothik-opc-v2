import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { __addSupabaseJwkForTests } from "../supabase-jwks";
import { verifyToken } from "../../routes/auth";

function b64(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

describe("Supabase ES256 JWKS verification", () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" });
  const kid = `test-${crypto.randomUUID()}`;
  __addSupabaseJwkForTests({ ...(publicKey.export({ format: "jwk" }) as any), kid, alg: "ES256", use: "sig" });

  const claims = () => ({
    iss: "https://xgnzsikvguswhtozvokx.supabase.co/auth/v1",
    sub: crypto.randomUUID(),
    aud: "authenticated",
    role: "authenticated",
    email: `es256_${Date.now()}@shothik.ai`,
    exp: Math.floor(Date.now() / 1000) + 3600,
  });

  function sign(header: object, payload: object, key = privateKey) {
    const input = `${b64(header)}.${b64(payload)}`;
    const sig = crypto.sign("sha256", Buffer.from(input), { key, dsaEncoding: "ieee-p1363" }).toString("base64url");
    return `${input}.${sig}`;
  }

  it("accepts a correctly signed ES256 Supabase access token", () => {
    const c = claims();
    expect(verifyToken(sign({ alg: "ES256", kid, typ: "JWT" }, c))).toEqual({ userId: c.sub, email: c.email });
  });

  it("rejects an ES256 token signed by a different key", () => {
    const other = crypto.generateKeyPairSync("ec", { namedCurve: "P-256" }).privateKey;
    expect(verifyToken(sign({ alg: "ES256", kid, typ: "JWT" }, claims(), other))).toBeNull();
  });

  it("rejects a token with a trusted issuer but a forged signature", () => {
    const forged = `${b64({ alg: "ES256", kid, typ: "JWT" })}.${b64(claims())}.${"A".repeat(86)}`;
    expect(verifyToken(forged)).toBeNull();
  });

  it("rejects a validly signed token from an untrusted issuer", () => {
    expect(verifyToken(sign({ alg: "ES256", kid }, { ...claims(), iss: "https://evil.example/auth/v1" }))).toBeNull();
  });

  it("rejects expired tokens", () => {
    expect(verifyToken(sign({ alg: "ES256", kid }, { ...claims(), exp: Math.floor(Date.now() / 1000) - 10 }))).toBeNull();
  });
});
