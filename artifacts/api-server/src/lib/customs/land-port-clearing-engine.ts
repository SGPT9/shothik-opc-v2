import crypto from "node:crypto";

export type LandPortStationId = "benapole" | "bhomra" | "tamabil" | "burimari" | "akhaura";

export interface LandPortStation {
  id: LandPortStationId;
  nameBangla: string;
  nameEnglish: string;
  counterpartPort: string;
  division: string;
  primaryCargo: string[];
  basePortFeeBdt: number;
  demurrageRatePerDayBdt: number;
  freeHours: number;
}

export interface WeighbridgeAuditRequest {
  consignmentId: string;
  stationId: LandPortStationId;
  truckRegistration: string;
  grossWeightKg: number;
  tareWeightKg: number;
  declaredWeightKg: number;
}

export interface WeighbridgeAuditResult {
  consignmentId: string;
  stationId: LandPortStationId;
  truckRegistration: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  declaredWeightKg: number;
  discrepancyKg: number;
  discrepancyPercent: number;
  tolerancePercent: number;
  isOverweight: boolean;
  overloadSurchargeBdt: number;
  status: "PASSED" | "OVERWEIGHT_PENALTY" | "UNDERWEIGHT_DISCREPANCY";
  verifiedAt: string;
  auditSlipNumber: string;
}

export interface QuarantineInspectionRequest {
  consignmentId: string;
  commodityName: string;
  isPerishable: boolean;
  pestDetected: boolean;
  moisturePercent: number;
  maxMoistureAllowed: number;
  treatmentCompleted?: boolean;
}

export interface QuarantineInspectionResult {
  consignmentId: string;
  commodityName: string;
  decision: "CLEARED_GREEN" | "TREATMENT_REQUIRED_ORANGE" | "REJECTED_RED";
  phytosanitaryCertificateId: string;
  certificateSealSha256: string;
  inspectionNotes: string;
  issuedAt: string;
}

export interface EctsLockRequest {
  lockId: string;
  consignmentId: string;
  stationId: LandPortStationId;
  truckRegistration: string;
  destinationIcd: string;
  currentLat: number;
  currentLng: number;
  corridorLat: number;
  corridorLng: number;
  tamperDetected: boolean;
  batteryPercent: number;
}

export interface EctsLockResult {
  lockId: string;
  consignmentId: string;
  truckRegistration: string;
  distanceFromCorridorKm: number;
  tamperDetected: boolean;
  batteryPercent: number;
  status: "SECURED_IN_TRANSIT" | "TAMPER_ALARM" | "ROUTE_DEVIATION_ALERT" | "UNLOCKED_AT_DESTINATION";
  alarmTriggered: boolean;
  timestamp: string;
  telemetrySeal: string;
}

export interface BbinPermitRequest {
  truckRegistration: string;
  driverName: string;
  passportOrNid: string;
  countryOfOrigin: "IN" | "BT" | "NP";
  entryPortId: LandPortStationId;
  cargoDescription: string;
  declaredTransitDays: number;
  actualStayDays?: number;
}

export interface BbinPermitResult {
  permitNumber: string;
  truckRegistration: string;
  driverName: string;
  countryOfOrigin: "IN" | "BT" | "NP";
  entryPortId: LandPortStationId;
  basePermitFeeBdt: number;
  demurrageDays: number;
  demurrageRatePerDayBdt: number;
  demurrageTotalBdt: number;
  totalPayableBdt: number;
  status: "PERMIT_ACTIVE" | "EXPIRED_DEMURRAGE_PENDING" | "CLEARED_FOR_EXIT";
  issuedAt: string;
  securityHash: string;
}

export class LandPortClearingEngine {
  private stations: Map<LandPortStationId, LandPortStation> = new Map();

  constructor() {
    this.seedStations();
  }

  private seedStations() {
    const list: LandPortStation[] = [
      {
        id: "benapole",
        nameBangla: "বেনাপোল স্থলবন্দর",
        nameEnglish: "Benapole Land Port",
        counterpartPort: "Petrapole, India",
        division: "Khulna / Jashore",
        primaryCargo: ["Industrial Raw Materials", "Motor Vehicles", "Fabrics & Yarn", "Chemicals"],
        basePortFeeBdt: 2500,
        demurrageRatePerDayBdt: 750,
        freeHours: 72,
      },
      {
        id: "bhomra",
        nameBangla: "ভোমরা স্থলবন্দর",
        nameEnglish: "Bhomra Land Port",
        counterpartPort: "Ghojadanga, India",
        division: "Khulna / Satkhira",
        primaryCargo: ["Perishable Onions & Ginger", "Crushed Stone", "Rice & Wheat"],
        basePortFeeBdt: 1800,
        demurrageRatePerDayBdt: 500,
        freeHours: 48,
      },
      {
        id: "tamabil",
        nameBangla: "তামাবিল স্থলবন্দর",
        nameEnglish: "Tamabil Land Port",
        counterpartPort: "Dawki, India",
        division: "Sylhet",
        primaryCargo: ["Limestone", "Coal", "Fruits & Spices", "Boulder Stones"],
        basePortFeeBdt: 2000,
        demurrageRatePerDayBdt: 600,
        freeHours: 72,
      },
      {
        id: "burimari",
        nameBangla: "বুড়িমারী স্থলবন্দর",
        nameEnglish: "Burimari Land Port",
        counterpartPort: "Changrabandha, India",
        division: "Rangpur / Lalmonirhat",
        primaryCargo: ["Bhutanese Dolomite & Gypsum", "Fresh Apples & Oranges", "Timber"],
        basePortFeeBdt: 1900,
        demurrageRatePerDayBdt: 550,
        freeHours: 72,
      },
      {
        id: "akhaura",
        nameBangla: "আখাউড়া স্থলবন্দর",
        nameEnglish: "Akhaura Land Port",
        counterpartPort: "Agartala, India",
        division: "Chittagong / Brahmanbaria",
        primaryCargo: ["Processed Food & Snacks", "Cement & Steel", "Fish & Frozen Produce"],
        basePortFeeBdt: 1500,
        demurrageRatePerDayBdt: 450,
        freeHours: 48,
      },
    ];

    for (const station of list) {
      this.stations.set(station.id, station);
    }
  }

  public getStations(): LandPortStation[] {
    return Array.from(this.stations.values());
  }

  public getStation(id: LandPortStationId): LandPortStation | undefined {
    return this.stations.get(id);
  }

  /**
   * AC-1: Weighbridge Tare & Gross Audit
   */
  public auditWeighbridge(req: WeighbridgeAuditRequest): WeighbridgeAuditResult {
    const station = this.getStation(req.stationId);
    if (!station) {
      throw new Error(`Invalid land port station ID: ${req.stationId}`);
    }

    const netWeightKg = Math.max(0, req.grossWeightKg - req.tareWeightKg);
    const discrepancyKg = Math.round((netWeightKg - req.declaredWeightKg) * 100) / 100;
    const tolerancePercent = 1.5; // statutory 1.5% allowance
    
    const discrepancyPercent = req.declaredWeightKg > 0 
      ? Math.round((Math.abs(discrepancyKg) / req.declaredWeightKg) * 10000) / 100
      : 0;

    let isOverweight = false;
    let overloadSurchargeBdt = 0;
    let status: WeighbridgeAuditResult["status"] = "PASSED";

    if (discrepancyKg > 0 && discrepancyPercent > tolerancePercent) {
      isOverweight = true;
      status = "OVERWEIGHT_PENALTY";
      // BSLPA Tariff: ৳50 per 100kg excess above declared
      const excessKg = Math.max(0, discrepancyKg - (req.declaredWeightKg * (tolerancePercent / 100)));
      overloadSurchargeBdt = Math.round((excessKg / 100) * 50);
    } else if (discrepancyKg < 0 && discrepancyPercent > tolerancePercent) {
      status = "UNDERWEIGHT_DISCREPANCY";
    }

    const auditSlipNumber = `BSLPA-WB-${req.stationId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

    return {
      consignmentId: req.consignmentId,
      stationId: req.stationId,
      truckRegistration: req.truckRegistration,
      grossWeightKg: req.grossWeightKg,
      tareWeightKg: req.tareWeightKg,
      netWeightKg,
      declaredWeightKg: req.declaredWeightKg,
      discrepancyKg,
      discrepancyPercent,
      tolerancePercent,
      isOverweight,
      overloadSurchargeBdt,
      status,
      verifiedAt: new Date().toISOString(),
      auditSlipNumber,
    };
  }

  /**
   * AC-2: Plant Quarantine & Port Health Clearance
   */
  public inspectQuarantine(req: QuarantineInspectionRequest): QuarantineInspectionResult {
    let decision: QuarantineInspectionResult["decision"] = "CLEARED_GREEN";
    let inspectionNotes = "Cargo meets statutory biosecurity standards.";

    if (req.pestDetected) {
      if (req.treatmentCompleted) {
        decision = "CLEARED_GREEN";
        inspectionNotes = "Fumigation / methyl bromide quarantine treatment certified.";
      } else {
        decision = "TREATMENT_REQUIRED_ORANGE";
        inspectionNotes = "Live quarantine pests detected. Immediate fumigation required.";
      }
    } else if (req.moisturePercent > req.maxMoistureAllowed) {
      decision = "REJECTED_RED";
      inspectionNotes = `Excess moisture detected (${req.moisturePercent}% > max ${req.maxMoistureAllowed}%). Severe mycotoxin / spoilage risk.`;
    }

    const phytosanitaryCertificateId = `PQ-CERT-${req.consignmentId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const payload = `${phytosanitaryCertificateId}|${req.commodityName}|${decision}|${req.moisturePercent}`;
    const certificateSealSha256 = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      consignmentId: req.consignmentId,
      commodityName: req.commodityName,
      decision,
      phytosanitaryCertificateId,
      certificateSealSha256,
      inspectionNotes,
      issuedAt: new Date().toISOString(),
    };
  }

  /**
   * AC-3: ECTS Electronic Transit Lock & Corridor Telemetry
   */
  public evaluateEctsTelemetry(req: EctsLockRequest): EctsLockResult {
    // Calculate Haversine distance in km between current location and expected corridor
    const latDiff = (req.currentLat - req.corridorLat) * 111.0;
    const lngDiff = (req.currentLng - req.corridorLng) * 105.0;
    const distanceFromCorridorKm = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 100) / 100;

    let status: EctsLockResult["status"] = "SECURED_IN_TRANSIT";
    let alarmTriggered = false;

    if (req.tamperDetected) {
      status = "TAMPER_ALARM";
      alarmTriggered = true;
    } else if (distanceFromCorridorKm > 2.0) {
      status = "ROUTE_DEVIATION_ALERT";
      alarmTriggered = true;
    } else if (req.batteryPercent <= 15) {
      // Low battery warning
    }

    const telemetryPayload = `${req.lockId}|${req.consignmentId}|${status}|${distanceFromCorridorKm}|${req.batteryPercent}`;
    const telemetrySeal = crypto.createHash("sha256").update(telemetryPayload).digest("hex");

    return {
      lockId: req.lockId,
      consignmentId: req.consignmentId,
      truckRegistration: req.truckRegistration,
      distanceFromCorridorKm,
      tamperDetected: req.tamperDetected,
      batteryPercent: req.batteryPercent,
      status,
      alarmTriggered,
      timestamp: new Date().toISOString(),
      telemetrySeal,
    };
  }

  /**
   * AC-4: BBIN-MVA Cross-Border Truck Permit & Demurrage Escrow
   */
  public issueBbinPermit(req: BbinPermitRequest): BbinPermitResult {
    const station = this.getStation(req.entryPortId);
    if (!station) {
      throw new Error(`Invalid entry port: ${req.entryPortId}`);
    }

    const basePermitFeeBdt = station.basePortFeeBdt;
    const freeDays = Math.ceil(station.freeHours / 24);
    const actualStayDays = req.actualStayDays ?? req.declaredTransitDays;
    
    let demurrageDays = 0;
    if (actualStayDays > freeDays) {
      demurrageDays = actualStayDays - freeDays;
    }

    const demurrageRatePerDayBdt = station.demurrageRatePerDayBdt;
    const demurrageTotalBdt = demurrageDays * demurrageRatePerDayBdt;
    const totalPayableBdt = basePermitFeeBdt + demurrageTotalBdt;

    let status: BbinPermitResult["status"] = "PERMIT_ACTIVE";
    if (demurrageDays > 0) {
      status = "EXPIRED_DEMURRAGE_PENDING";
    }

    const permitNumber = `BBIN-MVA-${req.entryPortId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const payload = `${permitNumber}|${req.truckRegistration}|${req.driverName}|${totalPayableBdt}`;
    const securityHash = crypto.createHash("sha256").update(payload).digest("hex");

    return {
      permitNumber,
      truckRegistration: req.truckRegistration,
      driverName: req.driverName,
      countryOfOrigin: req.countryOfOrigin,
      entryPortId: req.entryPortId,
      basePermitFeeBdt,
      demurrageDays,
      demurrageRatePerDayBdt,
      demurrageTotalBdt,
      totalPayableBdt,
      status,
      issuedAt: new Date().toISOString(),
      securityHash,
    };
  }
}

export const landPortClearingEngine = new LandPortClearingEngine();
