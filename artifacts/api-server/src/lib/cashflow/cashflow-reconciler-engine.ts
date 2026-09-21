/**
 * Autonomous Multi-Channel Cashflow & COD Settlement Reconciler
 * Slice 38: Unified merchant liquidity, courier settlement reconciliation,
 * RTO loss absorption, carrier discrepancy auditing, and 30-day runway forecasting.
 */

import { createHash } from 'crypto';

export type ChannelType = 'bkash_merchant' | 'nagad_sheba' | 'bank_city' | 'steadfast_transit' | 'pathao_transit';

export interface ChannelBalance {
  channelId: ChannelType;
  channelName: string;
  accountNumber: string;
  currency: 'BDT';
  currentBalanceBdt: number;
  pendingReceivableBdt: number;
  settlementFeePercent: number;
  lastUpdated: string;
}

export interface SettlementConsignmentInput {
  trackingCode: string;
  orderRef: string;
  destination: string;
  expectedCodBdt: number;
  collectedCodBdt: number;
  deliveryFeeBdt: number;
  codCommissionBdt: number;
  returnFeeBdt: number;
  deliveryStatus: 'delivered' | 'returned' | 'lost' | 'partial_delivered';
}

export interface CourierSettlementBatch {
  batchId: string;
  carrier: 'steadfast' | 'pathao' | 'redx' | 'paperfly';
  settlementDate: string;
  consignmentsCount: number;
  deliveredCount: number;
  returnedCount: number;
  grossCodCollectedBdt: number;
  deliveryFeesDeductedBdt: number;
  codCommissionDeductedBdt: number;
  rtoReturnFeesDeductedBdt: number;
  netPayoutBdt: number;
  discrepanciesCount: number;
  discrepanciesAmountBdt: number;
  status: 'reconciled' | 'discrepancy_detected' | 'pending_disbursement';
  consignments: SettlementConsignmentInput[];
  reconciledAt: string;
  verificationHash: string;
}

export interface DailyPnLSummary {
  date: string;
  grossDeliveredRevenueBdt: number;
  cogsBdt: number;
  courierDeliveryFeesBdt: number;
  codCommissionFeesBdt: number;
  rtoFreightLossBdt: number;
  mfsProcessingFeesBdt: number;
  adSpendBdt: number;
  packagingCostBdt: number;
  netOperatingProfitBdt: number;
  netMarginPercent: number;
  deliveredOrdersCount: number;
  returnedOrdersCount: number;
  rtoRatePercent: number;
}

export interface DiscrepancyItem {
  discrepancyId: string;
  carrier: 'steadfast' | 'pathao' | 'redx' | 'paperfly';
  trackingCode: string;
  orderRef: string;
  discrepancyType: 'underpayment_cod' | 'excessive_weight_charge' | 'unremitted_delivery' | 'unauthorized_return_fee';
  expectedAmountBdt: number;
  disbursedAmountBdt: number;
  shortageAmountBdt: number;
  detectedAt: string;
  status: 'open' | 'claimed' | 'resolved';
  claimBriefText: string;
}

export interface RunwayForecastResult {
  generatedAt: string;
  currentLiquidCapitalBdt: number;
  pendingInTransitCodBdt: number;
  upcomingPayablesBdt: number;
  effectiveWorkingCapitalBdt: number;
  dailyBurnRateBdt: number;
  dailyRevenueInflowBdt: number;
  netDailyCashflowBdt: number;
  runwayDays: number;
  runwayStatus: 'healthy' | 'caution' | 'critical';
  trajectoryDays: Array<{
    day: number;
    projectedDate: string;
    projectedBalanceBdt: number;
    inventoryRestockRequired: boolean;
  }>;
}

// Initial Mock Channel Balances
export const INITIAL_CHANNEL_BALANCES: ChannelBalance[] = [
  {
    channelId: 'bkash_merchant',
    channelName: 'bKash Merchant PGW Wallet',
    accountNumber: '01711998877',
    currency: 'BDT',
    currentBalanceBdt: 184500,
    pendingReceivableBdt: 12000,
    settlementFeePercent: 1.5,
    lastUpdated: new Date().toISOString()
  },
  {
    channelId: 'nagad_sheba',
    channelName: 'Nagad Sheba Merchant Wallet',
    accountNumber: '01822334455',
    currency: 'BDT',
    currentBalanceBdt: 92400,
    pendingReceivableBdt: 6500,
    settlementFeePercent: 1.2,
    lastUpdated: new Date().toISOString()
  },
  {
    channelId: 'bank_city',
    channelName: 'City Bank Business Account',
    accountNumber: '1501204899201001',
    currency: 'BDT',
    currentBalanceBdt: 480000,
    pendingReceivableBdt: 0,
    settlementFeePercent: 0,
    lastUpdated: new Date().toISOString()
  },
  {
    channelId: 'steadfast_transit',
    channelName: 'Steadfast In-Transit COD Receivables',
    accountNumber: 'STF-MERC-98210',
    currency: 'BDT',
    currentBalanceBdt: 0,
    pendingReceivableBdt: 142600,
    settlementFeePercent: 1.0,
    lastUpdated: new Date().toISOString()
  },
  {
    channelId: 'pathao_transit',
    channelName: 'Pathao In-Transit COD Receivables',
    accountNumber: 'PAT-MERC-44102',
    currency: 'BDT',
    currentBalanceBdt: 0,
    pendingReceivableBdt: 86500,
    settlementFeePercent: 1.0,
    lastUpdated: new Date().toISOString()
  }
];

export class CashflowReconcilerEngine {
  private balances: ChannelBalance[] = [...INITIAL_CHANNEL_BALANCES];
  private settlementBatches: CourierSettlementBatch[] = [];
  private discrepancies: DiscrepancyItem[] = [];

  constructor() {
    this.seedInitialSettlementBatch();
  }

  private seedInitialSettlementBatch() {
    const seedConsignments: SettlementConsignmentInput[] = [
      {
        trackingCode: 'STF9812401',
        orderRef: 'ORD_2026_0918_A1',
        destination: 'Dhanmondi, Dhaka',
        expectedCodBdt: 2400,
        collectedCodBdt: 2400,
        deliveryFeeBdt: 80,
        codCommissionBdt: 24,
        returnFeeBdt: 0,
        deliveryStatus: 'delivered'
      },
      {
        trackingCode: 'STF9812402',
        orderRef: 'ORD_2026_0918_A2',
        destination: 'GEC Circle, Chittagong',
        expectedCodBdt: 3800,
        collectedCodBdt: 3800,
        deliveryFeeBdt: 130,
        codCommissionBdt: 38,
        returnFeeBdt: 0,
        deliveryStatus: 'delivered'
      },
      {
        trackingCode: 'STF9812403',
        orderRef: 'ORD_2026_0918_A3',
        destination: 'Uttara, Dhaka',
        expectedCodBdt: 1800,
        collectedCodBdt: 0,
        deliveryFeeBdt: 80,
        codCommissionBdt: 0,
        returnFeeBdt: 60,
        deliveryStatus: 'returned' // RTO Failed delivery
      },
      {
        trackingCode: 'STF9812404',
        orderRef: 'ORD_2026_0918_A4',
        destination: 'Mirpur, Dhaka',
        expectedCodBdt: 3200,
        collectedCodBdt: 2800, // Shortage underpayment of ৳400
        deliveryFeeBdt: 80,
        codCommissionBdt: 28,
        returnFeeBdt: 0,
        deliveryStatus: 'delivered'
      }
    ];

    this.reconcileSettlementBatch('steadfast', seedConsignments, '2026-09-20');
  }

  public getChannelBalances(): ChannelBalance[] {
    return this.balances;
  }

  public getLiquiditySummary(): {
    totalLiquidBankMfsBdt: number;
    totalInTransitCodBdt: number;
    totalGrossCapitalBdt: number;
    channels: ChannelBalance[];
  } {
    const totalLiquidBankMfsBdt = this.balances
      .filter(b => b.channelId === 'bkash_merchant' || b.channelId === 'nagad_sheba' || b.channelId === 'bank_city')
      .reduce((sum, b) => sum + b.currentBalanceBdt, 0);

    const totalInTransitCodBdt = this.balances
      .filter(b => b.channelId === 'steadfast_transit' || b.channelId === 'pathao_transit')
      .reduce((sum, b) => sum + b.pendingReceivableBdt, 0);

    return {
      totalLiquidBankMfsBdt,
      totalInTransitCodBdt,
      totalGrossCapitalBdt: totalLiquidBankMfsBdt + totalInTransitCodBdt,
      channels: this.balances
    };
  }

  /**
   * Ingest and reconcile a courier settlement batch manifest.
   */
  public reconcileSettlementBatch(
    carrier: 'steadfast' | 'pathao' | 'redx' | 'paperfly',
    consignments: SettlementConsignmentInput[],
    settlementDateStr?: string
  ): CourierSettlementBatch {
    const batchId = `SET_${carrier.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const date = settlementDateStr || new Date().toISOString().split('T')[0];

    let deliveredCount = 0;
    let returnedCount = 0;
    let grossCod = 0;
    let deliveryFees = 0;
    let codCommissions = 0;
    let returnFees = 0;
    let discrepanciesCount = 0;
    let discrepanciesAmount = 0;

    for (const c of consignments) {
      if (c.deliveryStatus === 'delivered' || c.deliveryStatus === 'partial_delivered') {
        deliveredCount++;
        grossCod += c.collectedCodBdt;
        deliveryFees += c.deliveryFeeBdt;
        codCommissions += c.codCommissionBdt;

        // Check for COD shortage underpayment
        if (c.collectedCodBdt < c.expectedCodBdt) {
          const shortage = c.expectedCodBdt - c.collectedCodBdt;
          discrepanciesCount++;
          discrepanciesAmount += shortage;

          this.discrepancies.push({
            discrepancyId: `DISC_${c.trackingCode}`,
            carrier,
            trackingCode: c.trackingCode,
            orderRef: c.orderRef,
            discrepancyType: 'underpayment_cod',
            expectedAmountBdt: c.expectedCodBdt,
            disbursedAmountBdt: c.collectedCodBdt,
            shortageAmountBdt: shortage,
            detectedAt: new Date().toISOString(),
            status: 'open',
            claimBriefText: `Courier ${carrier.toUpperCase()} collected ৳${c.collectedCodBdt} but booked value was ৳${c.expectedCodBdt}. Shortage of ৳${shortage} claimed for order ${c.orderRef}.`
          });
        }
      } else if (c.deliveryStatus === 'returned') {
        returnedCount++;
        deliveryFees += c.deliveryFeeBdt;
        returnFees += c.returnFeeBdt;
      }
    }

    const netPayout = Math.max(0, grossCod - deliveryFees - codCommissions - returnFees);

    const rawPayload = `${batchId}:${carrier}:${date}:${grossCod}:${netPayout}:${consignments.length}`;
    const verificationHash = createHash('sha256').update(rawPayload).digest('hex');

    const batch: CourierSettlementBatch = {
      batchId,
      carrier,
      settlementDate: date,
      consignmentsCount: consignments.length,
      deliveredCount,
      returnedCount,
      grossCodCollectedBdt: grossCod,
      deliveryFeesDeductedBdt: deliveryFees,
      codCommissionDeductedBdt: codCommissions,
      rtoReturnFeesDeductedBdt: returnFees,
      netPayoutBdt: netPayout,
      discrepanciesCount,
      discrepanciesAmountBdt: discrepanciesAmount,
      status: discrepanciesCount > 0 ? 'discrepancy_detected' : 'reconciled',
      consignments,
      reconciledAt: new Date().toISOString(),
      verificationHash
    };

    this.settlementBatches.push(batch);
    return batch;
  }

  public getAllSettlementBatches(): CourierSettlementBatch[] {
    return this.settlementBatches;
  }

  public getDiscrepancies(): DiscrepancyItem[] {
    return this.discrepancies;
  }

  /**
   * Calculate true daily PnL with full RTO return cost absorption and MFS fee deductions.
   */
  public calculateDailyPnL(customDateStr?: string): DailyPnLSummary {
    const date = customDateStr || new Date().toISOString().split('T')[0];

    // Mock metrics based on typical daily volume for an active solopreneur/OPC
    const deliveredOrdersCount = 42;
    const returnedOrdersCount = 5; // ~10.6% RTO rate
    const grossDeliveredRevenueBdt = 68500;
    const cogsBdt = 26800; // ~39.1% COGS
    const courierDeliveryFeesBdt = 4200; // 42 * ~100
    const codCommissionFeesBdt = 685; // 1% of 68,500
    const rtoFreightLossBdt = 750; // 5 returns * (৳90 delivery + ৳60 return)
    const mfsProcessingFeesBdt = 510; // blended bKash/Nagad fee on upfront prepayments
    const adSpendBdt = 8500; // Meta / TikTok ads
    const packagingCostBdt = 1260; // 42 * ৳30

    const totalDeductions =
      cogsBdt +
      courierDeliveryFeesBdt +
      codCommissionFeesBdt +
      rtoFreightLossBdt +
      mfsProcessingFeesBdt +
      adSpendBdt +
      packagingCostBdt;

    const netOperatingProfitBdt = grossDeliveredRevenueBdt - totalDeductions;
    const netMarginPercent = parseFloat(((netOperatingProfitBdt / grossDeliveredRevenueBdt) * 100).toFixed(2));
    const rtoRatePercent = parseFloat(((returnedOrdersCount / (deliveredOrdersCount + returnedOrdersCount)) * 100).toFixed(1));

    return {
      date,
      grossDeliveredRevenueBdt,
      cogsBdt,
      courierDeliveryFeesBdt,
      codCommissionFeesBdt,
      rtoFreightLossBdt,
      mfsProcessingFeesBdt,
      adSpendBdt,
      packagingCostBdt,
      netOperatingProfitBdt,
      netMarginPercent,
      deliveredOrdersCount,
      returnedOrdersCount,
      rtoRatePercent
    };
  }

  /**
   * Predict 30-day working capital runway and liquidity trajectory.
   */
  public generateRunwayForecast(): RunwayForecastResult {
    const liquidity = this.getLiquiditySummary();
    const currentLiquidCapitalBdt = liquidity.totalLiquidBankMfsBdt;
    const pendingInTransitCodBdt = liquidity.totalInTransitCodBdt;
    const upcomingPayablesBdt = 120000; // 1688 wholesale supplier bill due in 5 days

    // Effective working capital = Liquid + (In-Transit * 97% realization) - Upcoming payables
    const effectiveWorkingCapitalBdt =
      currentLiquidCapitalBdt + Math.round(pendingInTransitCodBdt * 0.97) - upcomingPayablesBdt;

    const dailyBurnRateBdt = 18500; // Daily ad spend + operational overhead + inventory replenishment
    const dailyRevenueInflowBdt = 25800; // Daily net realized operating cashflow
    const netDailyCashflowBdt = dailyRevenueInflowBdt - dailyBurnRateBdt; // +৳7,300 net positive

    // If net positive, runway is indefinitely sustainable (>180 days). If negative, calculate burn days.
    const runwayDays = netDailyCashflowBdt > 0
      ? 180
      : Math.max(1, Math.round(effectiveWorkingCapitalBdt / Math.abs(netDailyCashflowBdt)));

    let runwayStatus: RunwayForecastResult['runwayStatus'] = 'healthy';
    if (runwayDays < 15) {
      runwayStatus = 'critical';
    } else if (runwayDays < 45) {
      runwayStatus = 'caution';
    }

    const trajectoryDays: RunwayForecastResult['trajectoryDays'] = [];
    let runningBalance = effectiveWorkingCapitalBdt;

    for (let day = 1; day <= 30; day++) {
      const projDate = new Date();
      projDate.setDate(projDate.getDate() + day);

      runningBalance += netDailyCashflowBdt;
      // On day 10 and 20, simulate standard inventory re-order cycle
      const isRestock = day === 10 || day === 20;
      if (isRestock) {
        runningBalance -= 45000;
      }

      trajectoryDays.push({
        day,
        projectedDate: projDate.toISOString().split('T')[0],
        projectedBalanceBdt: Math.round(runningBalance),
        inventoryRestockRequired: isRestock
      });
    }

    return {
      generatedAt: new Date().toISOString(),
      currentLiquidCapitalBdt,
      pendingInTransitCodBdt,
      upcomingPayablesBdt,
      effectiveWorkingCapitalBdt,
      dailyBurnRateBdt,
      dailyRevenueInflowBdt,
      netDailyCashflowBdt,
      runwayDays,
      runwayStatus,
      trajectoryDays
    };
  }
}

export const cashflowReconcilerEngine = new CashflowReconcilerEngine();
