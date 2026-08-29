import { describe, it, expect, beforeEach } from "vitest";
import {
  IdempotencyService,
  computeRequestHash,
  idempotencyMiddleware,
} from "../idempotency-service";

describe("IdempotencyService & Middleware", () => {
  let service: IdempotencyService;

  beforeEach(() => {
    service = IdempotencyService.getInstance();
    service.resetCircuitBreaker();
  });

  it("computes deterministic SHA-256 hashes for equivalent request bodies", () => {
    const hash1 = computeRequestHash({ orderId: "123", amount: 500 });
    const hash2 = computeRequestHash({ orderId: "123", amount: 500 });
    const hash3 = computeRequestHash({ orderId: "123", amount: 600 });

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it("acquires new idempotency key with PROCEED status", async () => {
    const testKey = `test_key_${Date.now()}_${Math.random()}`;
    const result = await service.acquire({
      key: testKey,
      userId: "usr_test",
      endpoint: "/api/v1/logistics/steadfast/book",
      requestHash: computeRequestHash({ customer: "Rahim" }),
    });

    expect(result.status).toBe("PROCEED");
  });

  it("returns CONFLICT when another process attempts to mutate with an active key", async () => {
    const testKey = `test_conflict_${Date.now()}_${Math.random()}`;

    // First worker acquires lock
    const first = await service.acquire({
      key: testKey,
      userId: "usr_test",
      endpoint: "/api/v1/mfs/verify-trx",
      requestHash: computeRequestHash({ trxId: "BK99281729" }),
    });
    expect(first.status).toBe("PROCEED");

    // Immediate second worker attempts same mutation with active lock
    const second = await service.acquire({
      key: testKey,
      userId: "usr_test",
      endpoint: "/api/v1/mfs/verify-trx",
      requestHash: computeRequestHash({ trxId: "BK99281729" }),
    });

    expect(second.status).toBe("CONFLICT");
    expect(second.error).toContain("in progress");
  });

  it("returns HIT with cached response status and payload when key is completed", async () => {
    const testKey = `test_completed_${Date.now()}_${Math.random()}`;

    await service.acquire({
      key: testKey,
      userId: "usr_test",
      endpoint: "/api/v1/logistics/steadfast/book",
      requestHash: "hash_123",
    });

    // Complete the key
    const mockResponseBody = {
      success: true,
      trackingCode: "BD_ST_998811",
      consignmentId: "CN_102",
    };

    await service.complete({
      key: testKey,
      responseStatus: 201,
      responseBody: mockResponseBody,
    });

    // Subsequent call should HIT
    const replay = await service.acquire({
      key: testKey,
      userId: "usr_test",
      endpoint: "/api/v1/logistics/steadfast/book",
      requestHash: "hash_123",
    });

    expect(replay.status).toBe("HIT");
    expect(replay.responseStatus).toBe(201);
    expect(replay.responseBody).toEqual(mockResponseBody);
  });

  it("transparently replays responses in Express idempotencyMiddleware", async () => {
    const testKey = `test_mw_${Date.now()}_${Math.random()}`;

    let headers: Record<string, string> = {};
    let responseData: any = null;

    const mockReq: any = {
      headers: {
        "idempotency-key": testKey,
        "x-user-id": "usr_test",
      },
      baseUrl: "/api",
      path: "/v1/mfs/verify-trx",
      body: { trxId: "BK99281729" },
    };

    const mockRes: any = {
      statusCode: 200,
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      setHeader: (k: string, v: string) => {
        headers[k.toLowerCase()] = v;
      },
      json: (data: any) => {
        responseData = data;
        return mockRes;
      },
    };

    // First invocation: passes to next() and records completion
    let nextCalled = false;
    await new Promise<void>((resolve) => {
      idempotencyMiddleware(mockReq, mockRes, () => {
        nextCalled = true;
        mockRes.status(200).json({ success: true, creditedAmount: 100 });
        resolve();
      });
    });

    expect(nextCalled).toBe(true);
    expect(responseData.success).toBe(true);

    // Second invocation with identical Idempotency-Key: should short-circuit and set X-Cache-Lookup: HIT
    let replayHeaders: Record<string, string> = {};
    let replayData: any = null;
    let replayNextCalled = false;

    const replayRes: any = {
      statusCode: 200,
      status: function (code: number) {
        this.statusCode = code;
        return this;
      },
      setHeader: (k: string, v: string) => {
        replayHeaders[k.toLowerCase()] = v;
      },
      json: (data: any) => {
        replayData = data;
        return replayRes;
      },
    };

    await new Promise<void>((resolve) => {
      // Monkey patch json to resolve promise
      const originalJson = replayRes.json;
      replayRes.json = (data: any) => {
        originalJson(data);
        resolve();
      };

      idempotencyMiddleware(mockReq, replayRes, () => {
        replayNextCalled = true;
        resolve();
      });
    });

    expect(replayNextCalled).toBe(false); // Intercepted without calling next()
    expect(replayHeaders["x-cache-lookup"]).toBe("HIT");
    expect(replayHeaders["idempotency-replay"]).toBe("true");
    expect(replayData.creditedAmount).toBe(100);
  });
});
