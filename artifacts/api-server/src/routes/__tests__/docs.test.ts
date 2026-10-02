import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("OpenAPI Documentation Router", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("serves OpenAPI 3.1.0 specification at /openapi.json and /docs/openapi.json", async () => {
    const res = await fetch(`${baseUrl}/docs/openapi.json`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/json");

    const data = (await res.json()) as any;
    expect(data.openapi).toBe("3.1.0");
    expect(data.info.title).toBe("Shothik Unified AI Platform API");
    expect(data.paths).toBeDefined();

    const aliasRes = await fetch(`${baseUrl}/openapi.json`);
    expect(aliasRes.status).toBe(200);
    const aliasData = (await aliasRes.json()) as any;
    expect(aliasData.openapi).toBe("3.1.0");
  });

  it("serves interactive Scalar documentation portal at /docs", async () => {
    const res = await fetch(`${baseUrl}/docs`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");

    const text = await res.text();
    expect(text).toContain("<title>Shothik Unified AI Platform — API Documentation</title>");
    expect(text).toContain("@scalar/api-reference");
  });
});
