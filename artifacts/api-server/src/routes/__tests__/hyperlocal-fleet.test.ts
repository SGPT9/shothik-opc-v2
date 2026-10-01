import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { hyperlocalFleetRouter } from "../hyperlocal-fleet.js";

const app = express();
app.use(express.json());
app.use("/api", hyperlocalFleetRouter);

describe("Hyperlocal Delivery Fleet & Drone/Bike Dispatch Engine (Slice 82)", () => {
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

  describe("GET /api/v1/logistics/hyperlocal-fleet/vehicles", () => {
    it("returns list of registered electric cargo bikes and autonomous micro-drones", async () => {
      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/vehicles`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBeGreaterThanOrEqual(4);

      const drone = json.vehicles.find((v: any) => v.type === "drone");
      expect(drone).toBeDefined();
      expect(drone.maxPayloadGrams).toBeLessThanOrEqual(2000);
      expect(drone.batteryPercent).toBeGreaterThanOrEqual(50);

      const bike = json.vehicles.find((v: any) => v.type === "cargo_bike");
      expect(bike).toBeDefined();
      expect(bike.maxPayloadGrams).toBe(25000);
    });

    it("filters fleet vehicles by type and status", async () => {
      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/vehicles?type=drone`);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.vehicles.every((v: any) => v.type === "drone")).toBe(true);
    });
  });

  describe("GET /api/v1/logistics/hyperlocal-fleet/corridors", () => {
    it("returns geofenced urban corridors with live traffic multipliers", async () => {
      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/corridors`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBeGreaterThanOrEqual(5);

      const gulshan = json.corridors.find((c: any) => c.id === "corridor_gulshan_banani");
      expect(gulshan).toBeDefined();
      expect(gulshan.currentTrafficMultiplier).toBeGreaterThanOrEqual(1.0);
      expect(gulshan.droneFlightAllowed).toBe(true);

      const oldDhaka = json.corridors.find((c: any) => c.id === "corridor_old_dhaka");
      expect(oldDhaka).toBeDefined();
      expect(oldDhaka.droneFlightAllowed).toBe(false); // Dense airspace restriction
    });
  });

  describe("POST /api/v1/logistics/hyperlocal-fleet/dispatch", () => {
    it("dispatches express sub-2kg parcel via autonomous micro-drone to Gulshan corridor", async () => {
      const payload = {
        originHubId: "hub_gulshan_01",
        destinationCorridor: "corridor_gulshan_banani",
        destinationAddress: "Road 11, Block D, Banani, Dhaka",
        recipientName: "Tanvir Ahmed",
        recipientPhone: "01711223344",
        weightGrams: 850, // Sub-2kg
        isUrgent: true,
        codAmountBdt: 2450,
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.dispatchType).toBe("internal_fleet");
      expect(json.vehicle.type).toBe("drone");
      expect(json.estimatedMinutes).toBeLessThan(30);
      expect(json.consignmentTrackingCode).toMatch(/^HYP-DRONE-[A-Z0-9]{6}$/);
    });

    it("dispatches heavy 14kg parcel via electric cargo bike with traffic multiplier applied", async () => {
      const payload = {
        originHubId: "hub_dhanmondi_01",
        destinationCorridor: "corridor_dhanmondi",
        destinationAddress: "House 34, Road 27, Dhanmondi, Dhaka",
        recipientName: "Farhana Islam",
        recipientPhone: "01819988776",
        weightGrams: 14000, // 14kg -> disqualifies drone, assigns cargo bike
        isUrgent: false,
        codAmountBdt: 8500,
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.dispatchType).toBe("internal_fleet");
      expect(json.vehicle.type).toBe("cargo_bike");
      expect(json.consignmentTrackingCode).toMatch(/^HYP-CARGO_BIKE-[A-Z0-9]{6}$/);
    });

    it("automatically triggers 3rd-party courier overflow fallback (Steadfast/Pathao) when parcel exceeds fleet limits", async () => {
      const payload = {
        originHubId: "hub_gulshan_01",
        destinationCorridor: "corridor_old_dhaka",
        destinationAddress: "Ahsan Manzil Road, Sadarghat, Dhaka",
        recipientName: "Shamsul Huq",
        recipientPhone: "01912345678",
        weightGrams: 45000, // 45kg exceeds 25kg cargo bike limit -> triggers fallback
        isUrgent: false,
        codAmountBdt: 12000,
      };

      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.dispatchType).toBe("overflow_fallback");
      expect(json.fallbackCarrier).toBe("steadfast");
      expect(json.consignmentTrackingCode).toContain("STEADFAST-FALLBACK-");
    });

    it("validates request body and rejects invalid phone number with 400", async () => {
      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originHubId: "hub_gulshan_01",
          destinationCorridor: "corridor_gulshan_banani",
          destinationAddress: "Gulshan",
          recipientName: "Test",
          recipientPhone: "000000", // invalid
          weightGrams: 500,
        }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe("POST /api/v1/logistics/hyperlocal-fleet/vehicles/:id/telemetry & RTB", () => {
    it("updates vehicle telemetry and triggers automated RTB when battery drops below 20%", async () => {
      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/vehicles/BIKE-DHK-02/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batteryPercent: 14, // below 20% while in_transit
          status: "in_transit",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.vehicle.batteryPercent).toBe(14);
      expect(json.vehicle.status).toBe("rtb"); // Automated return to base
    });

    it("POST /api/v1/logistics/hyperlocal-fleet/vehicles/:id/rtb triggers emergency RTB command", async () => {
      const res = await fetch(`${baseUrl}/api/v1/logistics/hyperlocal-fleet/vehicles/DRONE-DHK-02/rtb`, {
        method: "POST",
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.vehicle.status).toBe("rtb");
      expect(json.message).toContain("Emergency RTB triggered");
    });
  });
});
