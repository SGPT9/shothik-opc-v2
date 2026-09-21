import { describe, it, expect, beforeEach } from "vitest";
import { CourierArbitrageEngine } from "./courier-arbitrage-engine.js";

describe("CourierArbitrageEngine (Slice 35: Courier Fleet Arbitrage & Micro-Hub Dispatcher)", () => {
  beforeEach(() => {
    CourierArbitrageEngine._reset();
  });

  it("evaluates arbitrage across 4 couriers for inside Dhaka and picks optimal carrier", () => {
    const res = CourierArbitrageEngine.evaluateArbitrage({
      district: "Dhaka",
      codAmountBdt: 3500,
      weightKg: 1,
    });

    expect(res.district).toBe("Dhaka");
    expect(res.zone).toBe("inside_dhaka");
    expect(res.carriers).toHaveLength(4);

    const pathao = res.carriers.find((c) => c.carrier === "pathao");
    const steadfast = res.carriers.find((c) => c.carrier === "steadfast");

    expect(pathao).toBeDefined();
    expect(steadfast).toBeDefined();
    expect(pathao?.expectedDsrPercent).toBeGreaterThanOrEqual(90);
    expect(pathao?.estimatedDeliveryHours).toBeLessThanOrEqual(24);

    const recommended = res.carriers.find((c) => c.isRecommended);
    expect(recommended).toBeDefined();
    expect(res.optimalCarrier).toBe(recommended?.carrier);
  });

  it("evaluates arbitrage for remote upazilas and favors higher DSR and low return charge", () => {
    const res = CourierArbitrageEngine.evaluateArbitrage({
      district: "Rangpur",
      codAmountBdt: 5000,
      weightKg: 2,
    });

    expect(res.district).toBe("Rangpur");
    expect(res.zone).toBe("remote_upazila");
    expect(res.weightKg).toBe(2);

    const top = res.carriers[0];
    expect(top.compositeScore).toBeGreaterThan(0);
    expect(top.totalDeliveryCostBdt).toBeGreaterThan(130);
  });

  it("dispatches a consignment and generates unified tracking URL and barcode", () => {
    const dispatch = CourierArbitrageEngine.dispatchConsignment({
      orderRef: "ORD_EID_9901",
      customerName: "Sakib Al Hasan",
      customerPhone: "01799887766",
      deliveryAddress: "Banani Road 11, Block D, Dhaka",
      district: "Dhaka",
      codAmountBdt: 4200,
      weightKg: 1.2,
    });

    expect(dispatch.success).toBe(true);
    expect(dispatch.consignment.consignmentId).toMatch(/^CNS_/);
    expect(dispatch.consignment.trackingCode).toBeDefined();
    expect(dispatch.consignment.trackingUrl).toContain("http");
    expect(dispatch.consignment.status).toBe("booked");
    expect(dispatch.consignment.barcodeData).toContain("01799887766");

    const list = CourierArbitrageEngine.listConsignments();
    expect(list.length).toBe(1);
  });

  it("updates consignment status and returns district matrix", () => {
    const dispatch = CourierArbitrageEngine.dispatchConsignment({
      orderRef: "ORD_TEST_01",
      customerName: "Test Buyer",
      customerPhone: "01800112233",
      deliveryAddress: "Chittagong GEC",
      district: "Chittagong",
      codAmountBdt: 2000,
    });

    const update = CourierArbitrageEngine.updateConsignmentStatus(
      dispatch.consignment.consignmentId,
      "out_for_delivery"
    );

    expect(update.success).toBe(true);
    expect(update.consignment?.status).toBe("out_for_delivery");

    const matrix = CourierArbitrageEngine.getDistrictMatrix();
    expect(matrix.length).toBeGreaterThanOrEqual(6);
    const ctg = matrix.find((m) => m.district === "Chittagong");
    expect(ctg?.zone).toBe("chittagong_metro");
  });
});
