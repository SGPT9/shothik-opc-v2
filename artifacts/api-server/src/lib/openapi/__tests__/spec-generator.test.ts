import { describe, it, expect } from "vitest";
import { buildOpenApiSpec } from "../openapi-builder";

describe("OpenAPI 3.1 Specification Builder", () => {
  it("builds a standards-compliant OpenAPI 3.1.0 document", () => {
    const spec = buildOpenApiSpec();

    expect(spec.openapi).toBe("3.1.0");
    expect(spec.info.title).toBe("Shothik Unified AI Platform API");
    expect(spec.info.version).toBe("2.2.0");
    expect(spec.info.contact?.name).toBe("Shothik Platform Engineering");
  });

  it("includes production and local servers", () => {
    const spec = buildOpenApiSpec();
    const urls = spec.servers.map((s) => s.url);

    expect(urls).toContain("http://127.0.0.1:8080");
    expect(urls).toContain("https://shothikgpt.com");
  });

  it("configures standard security schemes", () => {
    const spec = buildOpenApiSpec();
    const schemes = spec.components.securitySchemes;

    expect(schemes.BearerAuth).toBeDefined();
    expect(schemes.BearerAuth.type).toBe("http");
    expect(schemes.BearerAuth.scheme).toBe("bearer");

    expect(schemes.IdempotencyKey).toBeDefined();
    expect(schemes.IdempotencyKey.name).toBe("Idempotency-Key");

    expect(schemes.TraceContext).toBeDefined();
    expect(schemes.TraceContext.name).toBe("X-Trace-Id");
  });

  it("documents health and telemetry probe routes", () => {
    const spec = buildOpenApiSpec();

    expect(spec.paths["/health"]).toBeDefined();
    expect(spec.paths["/health/liveness"]).toBeDefined();
    expect(spec.paths["/health/readiness"]).toBeDefined();
    expect(spec.paths["/health/deep"]).toBeDefined();
  });

  it("documents South Asian core commerce and MFS routes", () => {
    const spec = buildOpenApiSpec();

    expect(spec.paths["/api/v1/agri/tea/estates"]).toBeDefined();
    expect(spec.paths["/api/v1/agri/tea/auction/bid"]).toBeDefined();
    expect(spec.paths["/api/v1/mfs/verify-trx"]).toBeDefined();
    expect(spec.paths["/api/v1/logistics/steadfast/book"]).toBeDefined();
    expect(spec.paths["/api/academic/plagiarism/scan"]).toBeDefined();
  });

  it("defines complete component schemas", () => {
    const spec = buildOpenApiSpec();
    const schemas = spec.components.schemas;

    expect(schemas.HealthCheckResponse).toBeDefined();
    expect(schemas.LivenessResponse).toBeDefined();
    expect(schemas.DeepHealthResponse).toBeDefined();
    expect(schemas.TeaEstateProfile).toBeDefined();
    expect(schemas.TeaAuctionBidRequest).toBeDefined();
    expect(schemas.MfsVerificationRequest).toBeDefined();
    expect(schemas.SteadfastBookingRequest).toBeDefined();
  });
});
