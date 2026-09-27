import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";
import { FlashReservationEngine } from "../../lib/inventory/flash-reservation-engine.js";

describe("Slice 78: Multi-Channel Real-Time Inventory & Flash-Sale Reservation Lock Routes", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    FlashReservationEngine._reset();
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

  it("POST /api/v1/inventory/reserve creates a leased lock", async () => {
    const res = await fetch(`${baseUrl}/api/v1/inventory/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: "EID-PANJABI-PREM-M",
        quantity: 2,
        channel: "daraz",
        orderRef: "ORD_RT_01",
        customerPhone: "01711223344",
        ttlSeconds: 600,
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.reservation.reservationId).toBeDefined();
    expect(data.reservation.status).toBe("RESERVED");
  });

  it("POST /api/v1/inventory/commit confirms stock deduction", async () => {
    // 1. Reserve
    const reserveRes = await fetch(`${baseUrl}/api/v1/inventory/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: "DARAZ-ANC-HEADSET-PRO",
        quantity: 1,
        channel: "woocommerce",
        orderRef: "ORD_RT_COMMIT",
      }),
    });
    const reserveData = await reserveRes.json();

    // 2. Commit
    const commitRes = await fetch(`${baseUrl}/api/v1/inventory/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationId: reserveData.reservation.reservationId,
      }),
    });

    expect(commitRes.status).toBe(200);
    const commitData = await commitRes.json();
    expect(commitData.success).toBe(true);
    expect(commitData.reservation.status).toBe("COMMITTED");
  });

  it("POST /api/v1/inventory/release restores stock to pool", async () => {
    // 1. Reserve
    const reserveRes = await fetch(`${baseUrl}/api/v1/inventory/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sku: "EID-PANJABI-PREM-M",
        quantity: 3,
        channel: "facebook_live",
        orderRef: "ORD_RT_RELEASE",
      }),
    });
    const reserveData = await reserveRes.json();

    // 2. Release
    const releaseRes = await fetch(`${baseUrl}/api/v1/inventory/release`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationId: reserveData.reservation.reservationId,
        reason: "Cancelled by buyer",
      }),
    });

    expect(releaseRes.status).toBe(200);
    const releaseData = await releaseRes.json();
    expect(releaseData.success).toBe(true);
    expect(releaseData.reservation.status).toBe("RELEASED");
  });

  it("GET /api/v1/inventory/snapshot/:sku and POST /api/v1/inventory/sync-channels", async () => {
    const sku = "EID-PANJABI-PREM-M";

    // 1. Snapshot
    const snapRes = await fetch(`${baseUrl}/api/v1/inventory/snapshot/${sku}`);
    expect(snapRes.status).toBe(200);
    const snapData = await snapRes.json();
    expect(snapData.success).toBe(true);
    expect(snapData.snapshot.sku).toBe(sku);
    expect(snapData.snapshot.channelBreakdown.daraz).toBeDefined();

    // 2. Sync Channels
    const syncRes = await fetch(`${baseUrl}/api/v1/inventory/sync-channels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku }),
    });
    expect(syncRes.status).toBe(200);
    const syncData = await syncRes.json();
    expect(syncData.success).toBe(true);
    expect(syncData.channels).toHaveLength(5);
  });

  it("POST /api/v1/inventory/panic-freeze triggers freeze lock", async () => {
    const freezeRes = await fetch(`${baseUrl}/api/v1/inventory/panic-freeze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFrozen: true }),
    });

    expect(freezeRes.status).toBe(200);
    const freezeData = await freezeRes.json();
    expect(freezeData.success).toBe(true);
    expect(freezeData.isGlobalFrozen).toBe(true);

    // Unfreeze
    const unfreezeRes = await fetch(`${baseUrl}/api/v1/inventory/panic-freeze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFrozen: false }),
    });
    expect(unfreezeRes.status).toBe(200);
  });
});
