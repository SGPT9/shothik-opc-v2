import { createHash, randomUUID } from "node:crypto";

export type CommodityType = "mango" | "potato" | "tomato" | "strawberry" | "fish_hilsa";
export type ShipmentStatus = "loaded" | "in_transit" | "arrived" | "settled" | "rejected";
export type QualityGrade = "Grade A (Prime)" | "Grade B (Standard)" | "Grade C (Discounted)" | "Spoiled / Rejected";

export interface CommoditySpec {
  nameBangla: string;
  nominalShelfLifeHours: number;
  minTempCelsius: number;
  maxTempCelsius: number;
  optimalHumidityPercent: number;
}

export const COMMODITY_SPECS: Record<CommodityType, CommoditySpec> = {
  mango: {
    nameBangla: "রাজশাহী হিমসাগর / ফজলি আম",
    nominalShelfLifeHours: 120,
    minTempCelsius: 8,
    maxTempCelsius: 12,
    optimalHumidityPercent: 85,
  },
  potato: {
    nameBangla: "বগুড়ার ডায়মন্ড / কার্ডিনাল আলু",
    nominalShelfLifeHours: 720,
    minTempCelsius: 3,
    maxTempCelsius: 7,
    optimalHumidityPercent: 90,
  },
  tomato: {
    nameBangla: "যশোরের তাজা টমেটো",
    nominalShelfLifeHours: 96,
    minTempCelsius: 10,
    maxTempCelsius: 14,
    optimalHumidityPercent: 90,
  },
  strawberry: {
    nameBangla: "দিনাজপুরের দেশি স্ট্রবেরি",
    nominalShelfLifeHours: 48,
    minTempCelsius: 0,
    maxTempCelsius: 4,
    optimalHumidityPercent: 95,
  },
  fish_hilsa: {
    nameBangla: "চাঁদপুরের পদ্মার রূপালি ইলিশ",
    nominalShelfLifeHours: 72,
    minTempCelsius: -2,
    maxTempCelsius: 2,
    optimalHumidityPercent: 98,
  },
};

export interface TelemetryReading {
  timestamp: string;
  temperatureCelsius: number;
  humidityPercent: number;
  locationName?: string;
}

export interface RegisterShipmentInput {
  commodity: CommodityType;
  originFarm: string;
  destinationMandi: string;
  quantityKg: number;
  totalValueBdt: number;
  farmerPhone: string;
  carrierName: string;
  vehiclePlate: string;
}

export interface ColdChainShipment {
  id: string;
  lotNumber: string;
  commodity: CommodityType;
  commodityNameBangla: string;
  originFarm: string;
  destinationMandi: string;
  quantityKg: number;
  totalValueBdt: number;
  advancePayoutBdt: number; // 30%
  balancePayoutBdt: number; // 70%
  farmerPhone: string;
  carrierName: string;
  vehiclePlate: string;
  status: ShipmentStatus;
  readings: TelemetryReading[];
  spoilageRiskIndex: number; // 0.00 to 2.00+
  excursionCount: number;
  gradeVerdict: QualityGrade;
  settlementPenaltyBdt: number;
  finalDisbursedBdt: number;
  createdAt: string;
  arrivedAt?: string;
  settledAt?: string;
  sha256AuditSeal: string;
}

export class ColdChainAgroEngine {
  private shipments = new Map<string, ColdChainShipment>();

  constructor() {
    this.seedDefaultShipments();
  }

  private computeHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
  }

  private seedDefaultShipments(): void {
    const s1 = this.registerShipment({
      commodity: "mango",
      originFarm: "Charghat Orchards, Rajshahi",
      destinationMandi: "Badamtoli Fruit Wholesale Market, Dhaka",
      quantityKg: 3500,
      totalValueBdt: 385000,
      farmerPhone: "01712345678",
      carrierName: "Bismillah Reefer Cold Transport",
      vehiclePlate: "Dhaka Metro-U-11-2045",
    });

    // Add initial compliant readings
    this.ingestTelemetry(s1.id, {
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      temperatureCelsius: 9.5,
      humidityPercent: 86,
      locationName: "Natore Highway Bypass",
    });
    this.ingestTelemetry(s1.id, {
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      temperatureCelsius: 10.2,
      humidityPercent: 85,
      locationName: "Bangabandhu Bridge Toll Plaza",
    });
  }

  registerShipment(input: RegisterShipmentInput): ColdChainShipment {
    const id = `CC-${randomUUID().slice(0, 8).toUpperCase()}`;
    const lotNumber = `LOT-${input.commodity.toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    const spec = COMMODITY_SPECS[input.commodity];
    const now = new Date().toISOString();

    const advancePayoutBdt = Math.round(input.totalValueBdt * 0.3); // 30% loading advance
    const balancePayoutBdt = input.totalValueBdt - advancePayoutBdt;

    const auditContent = `${id}:${lotNumber}:${input.originFarm}:${input.destinationMandi}:${input.totalValueBdt}:${now}`;
    const sha256AuditSeal = this.computeHash(auditContent);

    const shipment: ColdChainShipment = {
      id,
      lotNumber,
      commodity: input.commodity,
      commodityNameBangla: spec ? spec.nameBangla : input.commodity,
      originFarm: input.originFarm,
      destinationMandi: input.destinationMandi,
      quantityKg: input.quantityKg,
      totalValueBdt: input.totalValueBdt,
      advancePayoutBdt,
      balancePayoutBdt,
      farmerPhone: input.farmerPhone,
      carrierName: input.carrierName,
      vehiclePlate: input.vehiclePlate,
      status: "loaded",
      readings: [],
      spoilageRiskIndex: 0.05,
      excursionCount: 0,
      gradeVerdict: "Grade A (Prime)",
      settlementPenaltyBdt: 0,
      finalDisbursedBdt: advancePayoutBdt,
      createdAt: now,
      sha256AuditSeal,
    };

    this.shipments.set(id, shipment);
    return shipment;
  }

  getShipment(id: string): ColdChainShipment | null {
    return this.shipments.get(id) || null;
  }

  listShipments(status?: ShipmentStatus): ColdChainShipment[] {
    const list = Array.from(this.shipments.values());
    if (!status) return list;
    return list.filter((s) => s.status === status);
  }

  ingestTelemetry(shipmentId: string, reading: TelemetryReading): ColdChainShipment {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) throw new Error(`Cold chain shipment ${shipmentId} not found`);

    const spec = COMMODITY_SPECS[shipment.commodity];
    const isExcursion =
      reading.temperatureCelsius < spec.minTempCelsius ||
      reading.temperatureCelsius > spec.maxTempCelsius;

    if (isExcursion) {
      shipment.excursionCount += 1;
    }

    shipment.readings.push(reading);
    if (shipment.status === "loaded") {
      shipment.status = "in_transit";
    }

    // Arrhenius Kinetic Spoilage Calculation
    // Q10 = 2.2, Tref = spec.maxTempCelsius
    let accumulatedRateHours = 0;
    const Q10 = 2.2;
    const Tref = spec.maxTempCelsius;

    for (const r of shipment.readings) {
      const deltaT = r.temperatureCelsius - Tref;
      const rateFactor = Math.pow(Q10, deltaT / 10);
      accumulatedRateHours += rateFactor * 4.0;
    }

    const nominalTransitHours = Math.min(48, Math.max(12, spec.nominalShelfLifeHours * 0.1));
    const sri = Number((accumulatedRateHours / nominalTransitHours).toFixed(3));
    shipment.spoilageRiskIndex = Math.max(0.01, sri);

    // Grade classification
    if (sri < 0.25) {
      shipment.gradeVerdict = "Grade A (Prime)";
    } else if (sri < 0.55) {
      shipment.gradeVerdict = "Grade B (Standard)";
    } else if (sri < 0.90) {
      shipment.gradeVerdict = "Grade C (Discounted)";
    } else {
      shipment.gradeVerdict = "Spoiled / Rejected";
    }

    shipment.sha256AuditSeal = this.computeHash(
      `${shipment.id}:${shipment.spoilageRiskIndex}:${shipment.excursionCount}:${shipment.readings.length}`,
    );

    this.shipments.set(shipmentId, shipment);
    return shipment;
  }

  settleMandiArrival(shipmentId: string): {
    shipment: ColdChainShipment;
    disbursedBdt: number;
    penaltyDeductedBdt: number;
    payoutSummary: string;
  } {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) throw new Error(`Cold chain shipment ${shipmentId} not found`);

    const now = new Date().toISOString();
    shipment.arrivedAt = now;
    shipment.settledAt = now;

    // Calculate penalty based on quality grade at arrival
    let penaltyPercent = 0;
    if (shipment.gradeVerdict === "Grade B (Standard)") {
      penaltyPercent = 0.05; // 5% SLA deduction
    } else if (shipment.gradeVerdict === "Grade C (Discounted)") {
      penaltyPercent = 0.20; // 20% distress discount
    } else if (shipment.gradeVerdict === "Spoiled / Rejected") {
      penaltyPercent = 0.60; // 60% total loss penalty (farmer retains 30% advance + 10% salvage)
    }

    const penaltyBdt = Math.round(shipment.totalValueBdt * penaltyPercent);
    const balanceRemaining = Math.max(0, shipment.balancePayoutBdt - penaltyBdt);

    shipment.settlementPenaltyBdt = penaltyBdt;
    shipment.finalDisbursedBdt = shipment.advancePayoutBdt + balanceRemaining;
    shipment.status = shipment.gradeVerdict === "Spoiled / Rejected" ? "rejected" : "settled";

    shipment.sha256AuditSeal = this.computeHash(
      `${shipment.id}:SETTLED:${shipment.finalDisbursedBdt}:${now}`,
    );

    this.shipments.set(shipmentId, shipment);

    return {
      shipment,
      disbursedBdt: balanceRemaining,
      penaltyDeductedBdt: penaltyBdt,
      payoutSummary: `Mandi settlement complete: ৳${shipment.advancePayoutBdt} (Advance) + ৳${balanceRemaining} (Final) disbursed to ${shipment.farmerPhone} via bKash/Nagad. Penalty applied: ৳${penaltyBdt}.`,
    };
  }

  generateVatExemptionCertificate(shipmentId: string): {
    certificateId: string;
    shipmentId: string;
    lotNumber: string;
    statutoryRule: string;
    vatRatePercent: number;
    totalExemptAmountBdt: number;
    qrPayload: string;
    issuedAt: string;
    digitalSeal: string;
  } {
    const shipment = this.shipments.get(shipmentId);
    if (!shipment) throw new Error(`Cold chain shipment ${shipmentId} not found`);

    const certificateId = `VAT-EXEMPT-SEC26-${randomUUID().slice(0, 8).toUpperCase()}`;
    const issuedAt = new Date().toISOString();
    const statutoryRule = "NBR VAT & SD Act 2012, Section 26, First Schedule (Unprocessed Agricultural Produce)";

    const digitalSeal = this.computeHash(
      `${certificateId}:${shipment.id}:${shipment.totalValueBdt}:${statutoryRule}:${issuedAt}`,
    );

    const qrPayload = JSON.stringify({
      cert: certificateId,
      lot: shipment.lotNumber,
      comm: shipment.commodity,
      bdt: shipment.totalValueBdt,
      vat: "0%",
      sec: "26_First_Schedule",
      seal: digitalSeal.slice(0, 16),
    });

    return {
      certificateId,
      shipmentId: shipment.id,
      lotNumber: shipment.lotNumber,
      statutoryRule,
      vatRatePercent: 0,
      totalExemptAmountBdt: shipment.totalValueBdt,
      qrPayload,
      issuedAt,
      digitalSeal,
    };
  }
}

export const globalColdChainEngine = new ColdChainAgroEngine();
