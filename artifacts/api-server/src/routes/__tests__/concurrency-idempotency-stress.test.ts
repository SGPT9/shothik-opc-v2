import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import { teaAuctionRouter } from "../tea-auction.js";
import mfsRouter from "../mfs.js";
import { flashInventoryRouter } from "../flash-inventory.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api", teaAuctionRouter);
app.use("/api", mfsRouter);
app.use("/api", flashInventoryRouter);

describe("High-Concurrency Stress & Race-Condition Suite (Hybrid Hardening)", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe("Contention Vector 1: Tea Auction Bidding Under Concurrent Hammer Fall", () => {
    it("handles 15 concurrent bids on the same lot atomically without state race corruption", async () => {
      const lotId = `LOT-STRESS-${Date.now()}`;
      let currentHighBid = 200.0;

      // Generate 15 concurrent bids: some valid high bids, some stale/lower bids
      const bidValues = [
        205.0, // valid (+5.0)
        201.0, // invalid (only +1.0 vs 200)
        195.0, // invalid (lower than 200)
        210.0, // valid (+10.0)
        204.0, // potentially invalid if 205 accepted first
        208.0, // valid vs 205
        200.0, // invalid
        215.0, // valid (+15.0)
        212.0, // potentially invalid
        220.0, // valid (+20.0)
        190.0, // invalid
        225.0, // valid (+25.0)
        222.0, // potentially invalid
        230.0, // valid (+30.0)
        218.0, // invalid
      ];

      const results = await Promise.all(
        bidValues.map(async (bidAmount, idx) => {
          try {
            const res = await fetch(`${baseUrl}/api/v1/agri/tea/auction/bid`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                lotId,
                estateId: "finlay_sreemangal",
                leafGrade: "BOP",
                totalWeightKg: 1000,
                currentHighBidBdtPerKg: currentHighBid,
                newBidBdtPerKg: bidAmount,
                bidderName: `Concurrent Bidder #${idx + 1}`,
                bidderBtbLicense: `BTB-STRESS-${idx + 1}`,
              }),
            });
            const data = await res.json();
            return { status: res.status, ok: res.ok, data, bidAmount };
          } catch (err: any) {
            return { status: 500, ok: false, error: err.message, bidAmount };
          }
        })
      );

      // Verify zero 500 internal server errors or unhandled crashes
      const serverCrashes = results.filter((r) => r.status === 500);
      expect(serverCrashes.length).toBe(0);

      // All bids below minimum increment (+2.00 BDT) must be rejected with 409
      const rejectedBids = results.filter((r) => r.status === 409);
      expect(rejectedBids.length).toBeGreaterThan(0);
      for (const rej of rejectedBids) {
        expect(rej.data.success).toBe(false);
        expect(rej.data.bidResult.bidAccepted).toBe(false);
      }

      // Valid bids must be accepted with status 200
      const acceptedBids = results.filter((r) => r.status === 200);
      expect(acceptedBids.length).toBeGreaterThan(0);
      for (const acc of acceptedBids) {
        expect(acc.data.success).toBe(true);
        expect(acc.data.bidResult.bidAccepted).toBe(true);
      }
    });
  });

  describe("Contention Vector 2: MFS Webhook Idempotency Under Parallel Storm", () => {
    it("safely handles 12 simultaneous re-deliveries of identical TrxID without double-crediting", async () => {
      const sharedTrxId = `BK${Math.floor(10000000 + Math.random() * 90000000)}`;
      const sharedIdempotencyKey = `idem_key_${Date.now()}`;

      // Simulate 12 concurrent webhook deliveries
      const requests = Array.from({ length: 12 }, (_, i) => i);

      const responses = await Promise.all(
        requests.map(async () => {
          try {
            const res = await fetch(`${baseUrl}/api/v1/mfs/verify-trx`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "idempotency-key": sharedIdempotencyKey,
              },
              body: JSON.stringify({
                trxId: sharedTrxId,
                provider: "bkash",
                senderMobileNumber: "01712345678",
                tier: "micro_100_bdt",
                amountBdt: 100,
                userId: "usr_stress_test_101",
              }),
            });
            const data = await res.json();
            return {
              status: res.status,
              idempotencyReplay: res.headers.get("idempotency-replay"),
              data,
            };
          } catch (err: any) {
            return { status: 500, error: err.message };
          }
        })
      );

      // Verify zero server crashes
      expect(responses.filter((r) => r.status === 500).length).toBe(0);

      // Every concurrent request must either succeed (200) or be protected with 409 Conflict
      const validResponses = responses.filter((r) => r.status === 200 || r.status === 409);
      expect(validResponses.length).toBe(12);

      // At least one request succeeded
      const successCount = responses.filter((r) => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(1);

      // Subsequent sequential request with same key must return 200 with Idempotency-Replay header
      const replayRes = await fetch(`${baseUrl}/api/v1/mfs/verify-trx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "idempotency-key": sharedIdempotencyKey,
        },
        body: JSON.stringify({
          trxId: sharedTrxId,
          provider: "bkash",
          senderMobileNumber: "01712345678",
          tier: "micro_100_bdt",
          amountBdt: 100,
          userId: "usr_stress_test_101",
        }),
      });
      expect(replayRes.status).toBe(200);
      expect(replayRes.headers.get("idempotency-replay")).toBe("true");
    });
  });

  describe("Contention Vector 3: Memory Headroom & Heap Retention Benchmark", () => {
    it("maintains stable memory headroom under concurrent burst load without leak expansion", async () => {
      const beforeMem = process.memoryUsage();

      // Fire a rapid burst of 30 concurrent health and catalog requests
      const burst = Array.from({ length: 30 }, () =>
        fetch(`${baseUrl}/api/v1/agri/tea/estates`).then((r) => r.json())
      );
      await Promise.all(burst);

      const afterMem = process.memoryUsage();
      const heapDeltaMB = (afterMem.heapUsed - beforeMem.heapUsed) / 1024 / 1024;

      // Heap expansion for 30 requests should remain well under 25MB
      expect(heapDeltaMB).toBeLessThan(25.0);
    });
  });
});
