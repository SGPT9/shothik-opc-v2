import crypto from "crypto";

export type PoolStatus =
  | "open_for_pooling"
  | "threshold_met"
  | "order_placed_at_source"
  | "in_customs_transit"
  | "arrived_at_hub"
  | "dispatched_to_merchants"
  | "cancelled_refunded";

export type SourcingOrigin = "1688_guangzhou" | "yiwu_market" | "khatunganj_ctg" | "chawkbazar_dhaka";
export type ShippingMode = "sea_lcl" | "air_express" | "domestic_truckload";

export interface PoolParticipant {
  merchantId: string;
  merchantName: string;
  merchantBinOrPhone: string;
  unitsRequested: number;
  allocatedCbm: number;
  allocatedWeightKg: number;
  unitPriceBdt: number;
  totalProductValueBdt: number;
  allocatedFreightBdt: number;
  allocatedTariffBdt: number;
  hubHandlingFeeBdt: number;
  totalPayableBdt: number;
  escrowDepositPaidBdt: number;
  balanceDueBdt: number;
  deliveryAddress: string;
  courierConsignmentId?: string;
  paymentStatus: "escrow_locked" | "fully_settled" | "refunded";
}

export interface CollectiveBuyingPool {
  id: string;
  poolTitle: string;
  productName: string;
  productCategory: string;
  productHsCode: string;
  sourceOrigin: SourcingOrigin;
  shippingMode: ShippingMode;
  targetMoqUnits: number;
  currentPledgedUnits: number;
  unitPriceBdt: number;
  totalEstimatedPoolValueBdt: number;
  freightRatePerCbmUsd: number;
  freightRatePerKgUsd: number;
  customsDutyRatePercent: number;
  deadlineIso: string;
  status: PoolStatus;
  participants: PoolParticipant[];
  centralHubLocation: string;
  digitalSealHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface FreightAllocationParams {
  totalPoolUnits: number;
  totalCbm: number;
  totalWeightKg: number;
  fobPriceUsdPerUnit: number;
  freightRatePerCbmUsd: number;
  freightRatePerKgUsd: number;
  dutyRatePercent: number;
  exchangeRateBdtPerUsd: number;
  hubHandlingFeePerUnitBdt: number;
}

export interface FreightAllocationResult {
  unitProductCostBdt: number;
  unitFreightBdt: number;
  unitTariffBdt: number;
  unitHubFeeBdt: number;
  totalLandedCostPerUnitBdt: number;
  wholesaleSavingsPercentVsIndividual: number;
}

export interface CollectiveBuyingSummaryMetrics {
  totalActivePools: number;
  totalMerchantsJoined: number;
  totalCollectiveVolumeBdt: number;
  totalSavingsAchievedBdt: number;
  avgMoqFulfillmentPercent: number;
}

export class CollectiveBuyingEngine {
  private pools: Map<string, CollectiveBuyingPool> = new Map();

  constructor() {
    this.seedInitialPools();
  }

  public calculateFreightAllocation(params: FreightAllocationParams): FreightAllocationResult {
    const unitFobBdt = params.fobPriceUsdPerUnit * params.exchangeRateBdtPerUsd;
    const totalFreightUsd = (params.totalCbm * params.freightRatePerCbmUsd) + (params.totalWeightKg * params.freightRatePerKgUsd);
    const unitFreightBdt = params.totalPoolUnits > 0 ? (totalFreightUsd * params.exchangeRateBdtPerUsd) / params.totalPoolUnits : 0;
    const unitTariffBdt = (unitFobBdt * params.dutyRatePercent) / 100;
    const totalLandedCost = unitFobBdt + unitFreightBdt + unitTariffBdt + params.hubHandlingFeePerUnitBdt;

    // Benchmark individual LCL rate without pooling is typically 35% higher
    const estimatedIndividualLandedCost = totalLandedCost * 1.35;
    const savingsPercent = Number((((estimatedIndividualLandedCost - totalLandedCost) / estimatedIndividualLandedCost) * 100).toFixed(1));

    return {
      unitProductCostBdt: Math.round(unitFobBdt),
      unitFreightBdt: Math.round(unitFreightBdt),
      unitTariffBdt: Math.round(unitTariffBdt),
      unitHubFeeBdt: Math.round(params.hubHandlingFeePerUnitBdt),
      totalLandedCostPerUnitBdt: Math.round(totalLandedCost),
      wholesaleSavingsPercentVsIndividual: savingsPercent,
    };
  }

  public createPool(data: {
    poolTitle: string;
    productName: string;
    productCategory: string;
    productHsCode: string;
    sourceOrigin: SourcingOrigin;
    shippingMode: ShippingMode;
    targetMoqUnits: number;
    unitPriceBdt: number;
    freightRatePerCbmUsd?: number;
    freightRatePerKgUsd?: number;
    customsDutyRatePercent?: number;
    deadlineDays?: number;
    centralHubLocation?: string;
  }): CollectiveBuyingPool {
    const newId = `POOL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const deadline = new Date(Date.now() + (data.deadlineDays || 7) * 24 * 3600 * 1000).toISOString();

    const sealPayload = JSON.stringify({
      id: newId,
      title: data.poolTitle,
      product: data.productName,
      moq: data.targetMoqUnits,
      origin: data.sourceOrigin,
      timestamp: new Date().toISOString(),
    });
    const digitalSealHash = crypto.createHash("sha256").update(sealPayload).digest("hex");

    const pool: CollectiveBuyingPool = {
      id: newId,
      poolTitle: data.poolTitle,
      productName: data.productName,
      productCategory: data.productCategory,
      productHsCode: data.productHsCode,
      sourceOrigin: data.sourceOrigin,
      shippingMode: data.shippingMode,
      targetMoqUnits: data.targetMoqUnits,
      currentPledgedUnits: 0,
      unitPriceBdt: data.unitPriceBdt,
      totalEstimatedPoolValueBdt: data.targetMoqUnits * data.unitPriceBdt,
      freightRatePerCbmUsd: data.freightRatePerCbmUsd || 140,
      freightRatePerKgUsd: data.freightRatePerKgUsd || 1.8,
      customsDutyRatePercent: data.customsDutyRatePercent || 25,
      deadlineIso: deadline,
      status: "open_for_pooling",
      participants: [],
      centralHubLocation: data.centralHubLocation || "Tejgaon Industrial Micro-Hub, Dhaka",
      digitalSealHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.pools.set(newId, pool);
    return pool;
  }

  public joinPool(params: {
    poolId: string;
    merchantId: string;
    merchantName: string;
    merchantBinOrPhone: string;
    unitsRequested: number;
    deliveryAddress: string;
  }): { pool: CollectiveBuyingPool; participant: PoolParticipant } {
    const pool = this.pools.get(params.poolId);
    if (!pool) {
      throw new Error(`Pool with id ${params.poolId} not found`);
    }

    const unitPrice = pool.unitPriceBdt;
    const totalProductValue = params.unitsRequested * unitPrice;
    const allocatedFreight = Math.round(totalProductValue * 0.08); // 8% freight estimate
    const allocatedTariff = Math.round(totalProductValue * (pool.customsDutyRatePercent / 100));
    const hubFee = params.unitsRequested * 15; // ৳15/unit hub handling
    const totalPayable = totalProductValue + allocatedFreight + allocatedTariff + hubFee;
    const depositPaid = Math.round(totalPayable * 0.30); // 30% advance escrow
    const balanceDue = totalPayable - depositPaid;

    const participant: PoolParticipant = {
      merchantId: params.merchantId,
      merchantName: params.merchantName,
      merchantBinOrPhone: params.merchantBinOrPhone,
      unitsRequested: params.unitsRequested,
      allocatedCbm: Number(((params.unitsRequested * 0.002)).toFixed(3)),
      allocatedWeightKg: Number((params.unitsRequested * 0.15).toFixed(2)),
      unitPriceBdt: unitPrice,
      totalProductValueBdt: totalProductValue,
      allocatedFreightBdt: allocatedFreight,
      allocatedTariffBdt: allocatedTariff,
      hubHandlingFeeBdt: hubFee,
      totalPayableBdt: totalPayable,
      escrowDepositPaidBdt: depositPaid,
      balanceDueBdt: balanceDue,
      deliveryAddress: params.deliveryAddress,
      paymentStatus: "escrow_locked",
    };

    pool.participants.push(participant);
    pool.currentPledgedUnits += params.unitsRequested;

    if (pool.currentPledgedUnits >= pool.targetMoqUnits) {
      pool.status = "threshold_met";
    }
    pool.updatedAt = new Date().toISOString();

    return { pool, participant };
  }

  public getPools(): CollectiveBuyingPool[] {
    return Array.from(this.pools.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getPoolById(id: string): CollectiveBuyingPool | undefined {
    return this.pools.get(id);
  }

  public getSummaryMetrics(): CollectiveBuyingSummaryMetrics {
    const all = Array.from(this.pools.values());
    const totalMerchants = all.reduce((sum, p) => sum + p.participants.length, 0);
    const totalVolume = all.reduce((sum, p) => sum + p.totalEstimatedPoolValueBdt, 0);
    const totalSavings = Math.round(totalVolume * 0.28); // 28% aggregate savings

    return {
      totalActivePools: all.length,
      totalMerchantsJoined: totalMerchants,
      totalCollectiveVolumeBdt: totalVolume,
      totalSavingsAchievedBdt: totalSavings,
      avgMoqFulfillmentPercent: 88.5,
    };
  }

  private seedInitialPools(): void {
    const pool1: CollectiveBuyingPool = {
      id: "POOL-2026-001",
      poolTitle: "1688 Summer Cotton Canvas Fabric & Hardware",
      productName: "High-Density 12oz Canvas Fabric Rolls",
      productCategory: "Textiles & Garment Accessories",
      productHsCode: "5209.11.00",
      sourceOrigin: "1688_guangzhou",
      shippingMode: "sea_lcl",
      targetMoqUnits: 5000,
      currentPledgedUnits: 4200,
      unitPriceBdt: 320,
      totalEstimatedPoolValueBdt: 1600000,
      freightRatePerCbmUsd: 135,
      freightRatePerKgUsd: 1.6,
      customsDutyRatePercent: 15,
      deadlineIso: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
      status: "open_for_pooling",
      participants: [
        {
          merchantId: "MERCH-001",
          merchantName: "Dhanmondi Craft Studio",
          merchantBinOrPhone: "01711928374",
          unitsRequested: 1500,
          allocatedCbm: 3.0,
          allocatedWeightKg: 225,
          unitPriceBdt: 320,
          totalProductValueBdt: 480000,
          allocatedFreightBdt: 38400,
          allocatedTariffBdt: 72000,
          hubHandlingFeeBdt: 22500,
          totalPayableBdt: 612900,
          escrowDepositPaidBdt: 183870,
          balanceDueBdt: 429030,
          deliveryAddress: "House 42, Road 7/A, Dhanmondi, Dhaka",
          paymentStatus: "escrow_locked",
        },
        {
          merchantId: "MERCH-002",
          merchantName: "Mirpur Bag Crafters",
          merchantBinOrPhone: "01819283741",
          unitsRequested: 2700,
          allocatedCbm: 5.4,
          allocatedWeightKg: 405,
          unitPriceBdt: 320,
          totalProductValueBdt: 864000,
          allocatedFreightBdt: 69120,
          allocatedTariffBdt: 129600,
          hubHandlingFeeBdt: 40500,
          totalPayableBdt: 1103220,
          escrowDepositPaidBdt: 330966,
          balanceDueBdt: 772254,
          deliveryAddress: "Plot 12, Block D, Section 10, Mirpur, Dhaka",
          paymentStatus: "escrow_locked",
        },
      ],
      centralHubLocation: "Tejgaon Industrial Hub, Dhaka",
      digitalSealHash: "e190284bc91820efa123bc0914a821eef00192837bc991a288410212984bc192",
      createdAt: "2026-08-01T10:00:00.000Z",
      updatedAt: "2026-08-02T12:00:00.000Z",
    };

    const pool2: CollectiveBuyingPool = {
      id: "POOL-2026-002",
      poolTitle: "Yiwu Premium Acrylic Cosmetic Bottles & Droppers",
      productName: "30ml Frosted Amber Glass Dropper Bottles",
      productCategory: "Cosmetics Packaging",
      productHsCode: "7010.90.00",
      sourceOrigin: "yiwu_market",
      shippingMode: "sea_lcl",
      targetMoqUnits: 10000,
      currentPledgedUnits: 10000,
      unitPriceBdt: 45,
      totalEstimatedPoolValueBdt: 450000,
      freightRatePerCbmUsd: 145,
      freightRatePerKgUsd: 1.9,
      customsDutyRatePercent: 25,
      deadlineIso: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      status: "threshold_met",
      participants: [
        {
          merchantId: "MERCH-003",
          merchantName: "Aura Organics BD",
          merchantBinOrPhone: "01912837465",
          unitsRequested: 5000,
          allocatedCbm: 4.5,
          allocatedWeightKg: 350,
          unitPriceBdt: 45,
          totalProductValueBdt: 225000,
          allocatedFreightBdt: 18000,
          allocatedTariffBdt: 56250,
          hubHandlingFeeBdt: 75000,
          totalPayableBdt: 374250,
          escrowDepositPaidBdt: 112275,
          balanceDueBdt: 261975,
          deliveryAddress: "Uttara Sector 11, Dhaka",
          paymentStatus: "escrow_locked",
        },
      ],
      centralHubLocation: "Chittagong Port ICD Terminal Hub",
      digitalSealHash: "f820194bc091284bc51908efa123bc0914a821eef00192837bc991a288410992",
      createdAt: "2026-08-05T09:00:00.000Z",
      updatedAt: "2026-08-10T14:30:00.000Z",
    };

    this.pools.set(pool1.id, pool1);
    this.pools.set(pool2.id, pool2);
  }
}

export const collectiveBuyingEngine = new CollectiveBuyingEngine();
