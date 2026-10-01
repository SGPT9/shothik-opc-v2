import crypto from "node:crypto";

export type PalliBidyutZoneId =
  | "dhaka_pbs_1"
  | "gazipur_pbs_1"
  | "narayanganj_pbs"
  | "chittagong_pbs_1"
  | "rajshahi_pbs";

export interface PalliBidyutTariff {
  zoneId: PalliBidyutZoneId;
  zoneNameBangla: string;
  zoneNameEnglish: string;
  flatRateBdtPerKwh: number;
  peakRateBdtPerKwh: number;
  offPeakRateBdtPerKwh: number;
  netMeteringExportRateBdt: number;
  demandChargeMonthlyBdt: number;
}

export interface SmartMeterTelemetryRequest {
  facilityId: string;
  facilityName: string;
  zoneId: PalliBidyutZoneId;
  solarGenerationKwh: number;
  facilityLoadKwh: number;
  gridImportKwh: number;
  gridExportKwh: number;
  batterySocPercent: number;
  inverterTempCelsius: number;
}

export interface SmartMeterTelemetryResult {
  facilityId: string;
  timestamp: string;
  netPowerFlowKwh: number; // positive = surplus export, negative = grid import needed
  thermalWarning: boolean;
  batteryStatus: "OPTIMAL" | "DISCHARGING" | "LOW_RESERVE_ALARM";
  telemetrySealSha256: string;
}

export interface NetMeteringSettlementRequest {
  facilityId: string;
  zoneId: PalliBidyutZoneId;
  billingMonth: string; // e.g., "October 2026"
  totalImportKwh: number;
  totalExportKwh: number;
  carriedOverUnitsKwh?: number;
}

export interface NetMeteringSettlementResult {
  settlementId: string;
  facilityId: string;
  zoneId: PalliBidyutZoneId;
  billingMonth: string;
  totalImportKwh: number;
  totalExportKwh: number;
  netBilledUnitsKwh: number;
  surplusUnitsBankedKwh: number;
  energyChargeBdt: number;
  demandChargeBdt: number;
  statutoryVatBdt: number;
  totalPayableBillBdt: number;
  billSlipNumber: string;
  issuedAt: string;
  auditSealSha256: string;
}

export interface GensetHybridArbitrageRequest {
  facilityId: string;
  outageDurationHours: number;
  averageLoadKw: number;
  availableBatteryStorageKwh: number;
}

export interface GensetHybridArbitrageResult {
  facilityId: string;
  totalEnergyRequiredKwh: number;
  energySuppliedByBatteryKwh: number;
  energySuppliedByGensetKwh: number;
  pureDieselGensetCostBdt: number;
  hybridOptimizedCostBdt: number;
  netSavingsBdt: number;
  dieselFuelSavedLiters: number;
  savingsPercentage: number;
  evaluationSeal: string;
}

export interface CarbonOffsetCertificateResult {
  certificateId: string;
  facilityId: string;
  totalCleanGenerationKwh: number;
  co2AvoidedKg: number;
  treesEquivalentCount: number;
  sredaGridEmissionFactor: number; // 0.62 kg CO2/kWh
  issuedAt: string;
  certificateSealSha256: string;
}

export class SolarMicrogridEngine {
  private tariffs: Map<PalliBidyutZoneId, PalliBidyutTariff> = new Map();

  constructor() {
    this.seedTariffs();
  }

  private seedTariffs() {
    const list: PalliBidyutTariff[] = [
      {
        zoneId: "dhaka_pbs_1",
        zoneNameBangla: "ঢাকা পল্লী বিদ্যুৎ সমিতি-১ (সাভার/ধামরাই)",
        zoneNameEnglish: "Dhaka Palli Bidyut Samity-1 (Savar/Dhamrai)",
        flatRateBdtPerKwh: 11.5,
        peakRateBdtPerKwh: 15.2,
        offPeakRateBdtPerKwh: 9.8,
        netMeteringExportRateBdt: 10.5,
        demandChargeMonthlyBdt: 450,
      },
      {
        zoneId: "gazipur_pbs_1",
        zoneNameBangla: "গাজীপুর পল্লী বিদ্যুৎ সমিতি-১ (কোনাবাড়ী/কাশিমপুর)",
        zoneNameEnglish: "Gazipur Palli Bidyut Samity-1 (Konabari/Kashimpur)",
        flatRateBdtPerKwh: 12.0,
        peakRateBdtPerKwh: 15.8,
        offPeakRateBdtPerKwh: 10.2,
        netMeteringExportRateBdt: 11.0,
        demandChargeMonthlyBdt: 500,
      },
      {
        zoneId: "narayanganj_pbs",
        zoneNameBangla: "নারায়ণগঞ্জ পল্লী বিদ্যুৎ সমিতি (ফতুল্লা/সিদ্ধিরগঞ্জ)",
        zoneNameEnglish: "Narayanganj Palli Bidyut Samity (Fatullah/Siddhirganj)",
        flatRateBdtPerKwh: 11.8,
        peakRateBdtPerKwh: 15.5,
        offPeakRateBdtPerKwh: 10.0,
        netMeteringExportRateBdt: 10.8,
        demandChargeMonthlyBdt: 480,
      },
      {
        zoneId: "chittagong_pbs_1",
        zoneNameBangla: "চট্টগ্রাম পল্লী বিদ্যুৎ সমিতি-১ (পটিয়া/মিরসরাই)",
        zoneNameEnglish: "Chittagong Palli Bidyut Samity-1 (Patiya/Mirsarai)",
        flatRateBdtPerKwh: 11.6,
        peakRateBdtPerKwh: 15.4,
        offPeakRateBdtPerKwh: 9.9,
        netMeteringExportRateBdt: 10.6,
        demandChargeMonthlyBdt: 460,
      },
      {
        zoneId: "rajshahi_pbs",
        zoneNameBangla: "রাজশাহী পল্লী বিদ্যুৎ সমিতি (পবা/বাঘা)",
        zoneNameEnglish: "Rajshahi Palli Bidyut Samity (Paba/Bagha)",
        flatRateBdtPerKwh: 11.2,
        peakRateBdtPerKwh: 14.8,
        offPeakRateBdtPerKwh: 9.5,
        netMeteringExportRateBdt: 10.2,
        demandChargeMonthlyBdt: 420,
      },
    ];

    for (const tariff of list) {
      this.tariffs.set(tariff.zoneId, tariff);
    }
  }

  public getTariffs(): PalliBidyutTariff[] {
    return Array.from(this.tariffs.values());
  }

  public getTariff(zoneId: PalliBidyutZoneId): PalliBidyutTariff | undefined {
    return this.tariffs.get(zoneId);
  }

  /**
   * AC-1: Ingest Smart Meter & Inverter Telemetry
   */
  public ingestTelemetry(req: SmartMeterTelemetryRequest): SmartMeterTelemetryResult {
    const netPowerFlowKwh = Math.round((req.solarGenerationKwh - req.facilityLoadKwh) * 100) / 100;
    const thermalWarning = req.inverterTempCelsius > 65.0;

    let batteryStatus: SmartMeterTelemetryResult["batteryStatus"] = "OPTIMAL";
    if (req.batterySocPercent < 25.0) {
      batteryStatus = "LOW_RESERVE_ALARM";
    } else if (netPowerFlowKwh < 0) {
      batteryStatus = "DISCHARGING";
    }

    const payload = `${req.facilityId}|${netPowerFlowKwh}|${req.batterySocPercent}|${req.inverterTempCelsius}`;
    const telemetrySealSha256 = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      facilityId: req.facilityId,
      timestamp: new Date().toISOString(),
      netPowerFlowKwh,
      thermalWarning,
      batteryStatus,
      telemetrySealSha256,
    };
  }

  /**
   * AC-2: Net-Metering Settlement & Rollover Unit Tokenization
   */
  public calculateNetMeteringSettlement(req: NetMeteringSettlementRequest): NetMeteringSettlementResult {
    const tariff = this.getTariff(req.zoneId);
    if (!tariff) {
      throw new Error(`Invalid Palli Bidyut Zone ID: ${req.zoneId}`);
    }

    const carriedOver = req.carriedOverUnitsKwh ?? 0;
    const effectiveImport = req.totalImportKwh;
    const effectiveExport = req.totalExportKwh + carriedOver;

    let netBilledUnitsKwh = 0;
    let surplusUnitsBankedKwh = 0;

    if (effectiveImport >= effectiveExport) {
      netBilledUnitsKwh = Math.round((effectiveImport - effectiveExport) * 100) / 100;
      surplusUnitsBankedKwh = 0;
    } else {
      netBilledUnitsKwh = 0;
      surplusUnitsBankedKwh = Math.round((effectiveExport - effectiveImport) * 100) / 100;
    }

    const energyChargeBdt = Math.round(netBilledUnitsKwh * tariff.flatRateBdtPerKwh * 100) / 100;
    const demandChargeBdt = tariff.demandChargeMonthlyBdt;
    const statutoryVatBdt = Math.round((energyChargeBdt + demandChargeBdt) * 0.05 * 100) / 100; // 5% VAT
    const totalPayableBillBdt = Math.round((energyChargeBdt + demandChargeBdt + statutoryVatBdt) * 100) / 100;

    const settlementId = `BREB-NM-${req.zoneId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const billSlipNumber = `PBS-BILL-${req.facilityId.toUpperCase()}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}`;

    const payload = `${settlementId}|${netBilledUnitsKwh}|${totalPayableBillBdt}|${surplusUnitsBankedKwh}`;
    const auditSealSha256 = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      settlementId,
      facilityId: req.facilityId,
      zoneId: req.zoneId,
      billingMonth: req.billingMonth,
      totalImportKwh: req.totalImportKwh,
      totalExportKwh: req.totalExportKwh,
      netBilledUnitsKwh,
      surplusUnitsBankedKwh,
      energyChargeBdt,
      demandChargeBdt,
      statutoryVatBdt,
      totalPayableBillBdt,
      billSlipNumber,
      issuedAt: new Date().toISOString(),
      auditSealSha256,
    };
  }

  /**
   * AC-3: Diesel Genset vs. Solar Hybrid Arbitrage Optimizer
   */
  public optimizeGensetArbitrage(req: GensetHybridArbitrageRequest): GensetHybridArbitrageResult {
    const totalEnergyRequiredKwh = Math.round(req.outageDurationHours * req.averageLoadKw * 100) / 100;
    const energySuppliedByBatteryKwh = Math.min(totalEnergyRequiredKwh, req.availableBatteryStorageKwh);
    const energySuppliedByGensetKwh = Math.max(0, totalEnergyRequiredKwh - energySuppliedByBatteryKwh);

    // Fuel metrics: 3.2 kWh/L diesel @ ৳108/L -> ৳33.75/kWh
    const dieselCostPerKwh = 33.75;
    const solarBatteryCostPerKwh = 7.20;

    const pureDieselGensetCostBdt = Math.round(totalEnergyRequiredKwh * dieselCostPerKwh * 100) / 100;
    const hybridOptimizedCostBdt = Math.round(
      (energySuppliedByBatteryKwh * solarBatteryCostPerKwh + energySuppliedByGensetKwh * dieselCostPerKwh) * 100
    ) / 100;

    const netSavingsBdt = Math.round((pureDieselGensetCostBdt - hybridOptimizedCostBdt) * 100) / 100;
    const dieselFuelSavedLiters = Math.round((energySuppliedByBatteryKwh / 3.2) * 100) / 100;
    const savingsPercentage = pureDieselGensetCostBdt > 0
      ? Math.round((netSavingsBdt / pureDieselGensetCostBdt) * 10000) / 100
      : 0;

    const payload = `${req.facilityId}|${totalEnergyRequiredKwh}|${netSavingsBdt}|${dieselFuelSavedLiters}`;
    const evaluationSeal = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      facilityId: req.facilityId,
      totalEnergyRequiredKwh,
      energySuppliedByBatteryKwh,
      energySuppliedByGensetKwh,
      pureDieselGensetCostBdt,
      hybridOptimizedCostBdt,
      netSavingsBdt,
      dieselFuelSavedLiters,
      savingsPercentage,
      evaluationSeal,
    };
  }

  /**
   * AC-4: SREDA Green Carbon Offset Certificate Generator
   */
  public generateCarbonOffsetCertificate(facilityId: string, totalCleanGenerationKwh: number): CarbonOffsetCertificateResult {
    const sredaGridEmissionFactor = 0.62; // 0.62 kg CO2/kWh
    const co2AvoidedKg = Math.round(totalCleanGenerationKwh * sredaGridEmissionFactor * 100) / 100;
    const treesEquivalentCount = Math.round(co2AvoidedKg / 21); // 1 mature tree absorbs ~21kg CO2/year

    const certificateId = `SREDA-GHG-${facilityId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const payload = `${certificateId}|${totalCleanGenerationKwh}|${co2AvoidedKg}|${treesEquivalentCount}`;
    const certificateSealSha256 = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      certificateId,
      facilityId,
      totalCleanGenerationKwh,
      co2AvoidedKg,
      treesEquivalentCount,
      sredaGridEmissionFactor,
      issuedAt: new Date().toISOString(),
      certificateSealSha256,
    };
  }
}

export const solarMicrogridEngine = new SolarMicrogridEngine();
