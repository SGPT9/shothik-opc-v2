import { describe, it, expect, beforeEach } from "vitest";
import { FlashReservationEngine } from "../flash-reservation-engine.js";

describe("FlashReservationEngine (Slice 78: Multi-Channel Real-Time Inventory & Leased Lock)", () => {
  beforeEach(() => {
    FlashReservationEngine._reset();
  });

  it("atomically reserves stock with a 15-minute lease lock", () => {
    const sku = "EID-PANJABI-PREM-M";
    const initial = FlashReservationEngine.getStockSnapshot(sku);
    expect(initial.availableStock).toBeGreaterThan(0);

    const res = FlashReservationEngine.reserveStock({
      sku,
      quantity: 5,
      channel: "daraz",
      orderRef: "ORD_DARAZ_101",
      customerPhone: "01711223344",
      ttlSeconds: 900,
    });

    expect(res.success).toBe(true);
    expect(res.reservation.status).toBe("RESERVED");
    expect(res.reservation.quantity).toBe(5);
    expect(res.reservation.channel).toBe("daraz");
    expect(res.reservation.auditHash).toBeDefined();

    const after = FlashReservationEngine.getStockSnapshot(sku);
    expect(after.availableStock).toBe(initial.availableStock - 5);
    expect(after.reservedUnits).toBe(5);
  });

  it("commits reservation permanently on order payment confirmation", () => {
    const sku = "DARAZ-ANC-HEADSET-PRO";
    const res = FlashReservationEngine.reserveStock({
      sku,
      quantity: 3,
      channel: "woocommerce",
      orderRef: "ORD_WOO_202",
      ttlSeconds: 600,
    });

    const commitRes = FlashReservationEngine.commitReservation(res.reservation.reservationId);
    expect(commitRes.success).toBe(true);
    expect(commitRes.reservation.status).toBe("COMMITTED");
    expect(commitRes.reservation.committedAt).toBeDefined();

    const after = FlashReservationEngine.getStockSnapshot(sku);
    expect(after.committedStock).toBeGreaterThan(0);
    expect(after.reservedUnits).toBe(0);
  });

  it("releases reservation back to the pool on customer cart cancellation", () => {
    const sku = "EID-PANJABI-PREM-M";
    const initial = FlashReservationEngine.getStockSnapshot(sku);

    const res = FlashReservationEngine.reserveStock({
      sku,
      quantity: 4,
      channel: "facebook_live",
      orderRef: "ORD_FB_303",
    });

    const snapshotDuring = FlashReservationEngine.getStockSnapshot(sku);
    expect(snapshotDuring.availableStock).toBe(initial.availableStock - 4);

    const releaseRes = FlashReservationEngine.releaseReservation(
      res.reservation.reservationId,
      "Customer abandoned live cart"
    );

    expect(releaseRes.success).toBe(true);
    expect(releaseRes.reservation.status).toBe("RELEASED");

    const snapshotAfter = FlashReservationEngine.getStockSnapshot(sku);
    expect(snapshotAfter.availableStock).toBe(initial.availableStock);
  });

  it("prevents overselling by throwing OUT_OF_STOCK error when capacity is exceeded", () => {
    const sku = "DARAZ-ANC-HEADSET-PRO";
    const snapshot = FlashReservationEngine.getStockSnapshot(sku);

    expect(() => {
      FlashReservationEngine.reserveStock({
        sku,
        quantity: snapshot.availableStock + 10,
        channel: "whatsapp",
        orderRef: "ORD_EXCEED_999",
      });
    }).toThrowError(/OUT_OF_STOCK/);
  });

  it("blocks reservations when emergency Panic Freeze is activated", () => {
    const sku = "EID-PANJABI-PREM-M";
    FlashReservationEngine.setPanicFreeze({ isFrozen: true });

    expect(() => {
      FlashReservationEngine.reserveStock({
        sku,
        quantity: 1,
        channel: "daraz",
        orderRef: "ORD_PANIC_FAIL",
      });
    }).toThrowError(/Emergency Global Panic Freeze is active/);

    // Deactivate freeze
    FlashReservationEngine.setPanicFreeze({ isFrozen: false });
    const successRes = FlashReservationEngine.reserveStock({
      sku,
      quantity: 1,
      channel: "daraz",
      orderRef: "ORD_PANIC_RESTORED",
    });
    expect(successRes.success).toBe(true);
  });

  it("broadcasts real-time stock balances across all 5 channels", () => {
    const sku = "EID-PANJABI-PREM-M";
    const sync = FlashReservationEngine.syncChannels(sku);

    expect(sync.sku).toBe(sku);
    expect(sync.channels).toHaveLength(5);
    expect(sync.channels.every((c) => c.status === "SYNCED")).toBe(true);
    expect(sync.channels.find((c) => c.channel === "daraz")?.availableQuota).toBeGreaterThan(0);
  });
});
