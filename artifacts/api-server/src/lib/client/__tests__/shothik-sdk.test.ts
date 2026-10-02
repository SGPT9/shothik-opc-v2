import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShothikClient, ShothikApiError, createShothikClient } from "../shothik-sdk";

describe("Shothik Typed Client SDK", () => {
  let mockFetch: any;

  beforeEach(() => {
    mockFetch = vi.fn();
  });

  it("initializes with default settings or factory function", () => {
    const client = createShothikClient({ baseUrl: "https://api.shothikgpt.com" });
    expect(client).toBeInstanceOf(ShothikClient);
  });

  describe("Health & Telemetry", () => {
    it("fetches /health ping", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ status: "ok", uptime: 124.5 }),
      });

      const client = new ShothikClient({ baseUrl: "http://127.0.0.1:8080", fetch: mockFetch });
      const result = await client.health.get();

      expect(mockFetch).toHaveBeenCalledWith("http://127.0.0.1:8080/health", expect.objectContaining({ method: "GET" }));
      expect(result.status).toBe("ok");
      expect(result.uptime).toBe(124.5);
    });

    it("fetches /health/liveness", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({ status: "UP", uptimeSeconds: 3600, pid: 4321, timestamp: "2026-10-01T21:00:00Z" }),
      });

      const client = new ShothikClient({ baseUrl: "http://127.0.0.1:8080", fetch: mockFetch });
      const result = await client.health.liveness();

      expect(result.status).toBe("UP");
      expect(result.pid).toBe(4321);
    });

    it("evaluates /health/readiness cleanly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers(),
      });

      const client = new ShothikClient({ baseUrl: "http://127.0.0.1:8080", fetch: mockFetch });
      const result = await client.health.readiness();

      expect(result.ready).toBe(true);
      expect(result.status).toBe(200);
    });
  });

  describe("Agri & Tea Auction", () => {
    it("lists tea estates", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          count: 1,
          estates: [
            {
              id: "sylhet_finlay",
              name: "James Finlay Tea Estate",
              region: "Sylhet",
              elevationMeters: 450,
              annualProductionMetricTons: 2800,
              primaryGrades: ["BOP", "OF"],
            },
          ],
        }),
      });

      const client = new ShothikClient({ baseUrl: "http://127.0.0.1:8080", fetch: mockFetch });
      const res = await client.agri.listEstates();

      expect(res.success).toBe(true);
      expect(res.count).toBe(1);
      expect(res.estates[0].id).toBe("sylhet_finlay");
    });
  });

  describe("MFS Verification with Idempotency", () => {
    it("submits MFS verification with Idempotency-Key header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: true,
          trxId: "BK88912301",
          provider: "bkash",
          status: "verified",
        }),
      });

      const client = new ShothikClient({ baseUrl: "http://127.0.0.1:8080", fetch: mockFetch });
      const result = await client.mfs.verifyTrx(
        {
          trxId: "BK88912301",
          provider: "bkash",
          tier: "merchant_1500_bdt",
          amountBdt: 1500,
          userId: "usr_founder_01",
          senderMobileNumber: "01711223344",
        },
        { idempotencyKey: "idem-uuid-999" }
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "http://127.0.0.1:8080/api/v1/mfs/verify-trx",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Idempotency-Key": "idem-uuid-999",
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result.status).toBe("verified");
    });
  });

  describe("Error Handling", () => {
    it("throws ShothikApiError on non-2xx status codes", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          success: false,
          error: { code: "IDEMPOTENCY_CONFLICT", message: "Concurrent request in-flight" },
        }),
      });

      const client = new ShothikClient({ baseUrl: "http://127.0.0.1:8080", fetch: mockFetch });

      await expect(
        client.mfs.verifyTrx({
          trxId: "BK88912301",
          provider: "bkash",
          tier: "merchant_1500_bdt",
          amountBdt: 1500,
          userId: "usr_founder_01",
          senderMobileNumber: "01711223344",
        })
      ).rejects.toThrow(ShothikApiError);
    });
  });
});
