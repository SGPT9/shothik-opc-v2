import { describe, expect, it } from "vitest";
import { defineRoute, z } from "@/lib/api-validation";
import { NextRequest } from "next/server";

describe("API Validation & Enterprise Route Wrapper (defineRoute)", () => {
  const TestBodySchema = z.object({
    title: z.string().min(3),
    count: z.number().int().positive().default(1),
  });

  const TestQuerySchema = z.object({
    filter: z.string().optional(),
  });

  it("handles valid request body and query parameters", async () => {
    const handler = defineRoute({
      method: "post",
      path: "/api/test/valid",
      summary: "Test Valid Route",
      schemas: {
        body: TestBodySchema,
        query: TestQuerySchema,
      },
      handler: async ({ body, query }) => {
        return Response.json({
          title: body.title,
          count: body.count,
          filter: query.filter || "none",
        });
      },
    });

    const req = new NextRequest("http://localhost:3000/api/test/valid?filter=active", {
      method: "POST",
      body: JSON.stringify({
        title: "Valid Title",
        count: 5,
      }),
    });

    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.title).toBe("Valid Title");
    expect(data.count).toBe(5);
    expect(data.filter).toBe("active");
  });

  it("returns 400 VALIDATION_ERROR on invalid request body", async () => {
    const handler = defineRoute({
      method: "post",
      path: "/api/test/invalid",
      schemas: {
        body: TestBodySchema,
      },
      handler: async () => {
        return Response.json({ ok: true });
      },
    });

    const req = new NextRequest("http://localhost:3000/api/test/invalid", {
      method: "POST",
      body: JSON.stringify({
        title: "ab", // Too short (< 3 chars)
        count: -1,  // Invalid non-positive
      }),
    });

    const res = await handler(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.code).toBe("VALIDATION_ERROR");
    expect(data.error).toBe("Validation Error");
    expect(Array.isArray(data.details)).toBe(true);
  });

  it("enforces idempotency key requirement when configured", async () => {
    const handler = defineRoute({
      method: "post",
      path: "/api/test/idempotent",
      config: {
        requireIdempotencyKey: true,
      },
      handler: async () => {
        return Response.json({ ok: true });
      },
    });

    const reqMissing = new NextRequest("http://localhost:3000/api/test/idempotent", {
      method: "POST",
    });

    const resMissing = await handler(reqMissing, { params: Promise.resolve({}) });
    expect(resMissing.status).toBe(400);
    const dataMissing = await resMissing.json();
    expect(dataMissing.code).toBe("MISSING_IDEMPOTENCY_KEY");

    const reqWithKey = new NextRequest("http://localhost:3000/api/test/idempotent", {
      method: "POST",
      headers: {
        "Idempotency-Key": "idemp-key-12345",
      },
    });

    const resWithKey = await handler(reqWithKey, { params: Promise.resolve({}) });
    expect(resWithKey.status).toBe(200);
  });
});
