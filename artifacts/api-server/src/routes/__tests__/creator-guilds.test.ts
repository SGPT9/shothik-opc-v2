import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Creator Guilds & Verified Supplier Escrow Suite", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("GET /api/community/guilds returns active creator guilds and member pools", async () => {
    const res = await fetch(`${baseUrl}/api/community/guilds`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.guilds.length).toBeGreaterThanOrEqual(3);
    expect(json.guilds[0].totalVolumePooledBDT).toBeGreaterThan(0);
  });

  it("GET /api/community/suppliers/verified returns verified suppliers with trust scores", async () => {
    const res = await fetch(`${baseUrl}/api/community/suppliers/verified`);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.suppliers.length).toBeGreaterThanOrEqual(2);
    expect(json.suppliers[0].trustScore).toBeGreaterThanOrEqual(90);
    expect(json.suppliers[0].tier).toBe("PLATINUM_VERIFIED");
  });
});
