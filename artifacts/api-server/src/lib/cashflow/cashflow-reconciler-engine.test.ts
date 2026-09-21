import { describe, it, expect } from 'vitest';
import { CashflowReconcilerEngine } from './cashflow-reconciler-engine';

describe('CashflowReconcilerEngine', () => {
  it('should initialize with multi-channel liquid balances and in-transit COD receivables', () => {
    const engine = new CashflowReconcilerEngine();
    const summary = engine.getLiquiditySummary();

    expect(summary.totalLiquidBankMfsBdt).toBeGreaterThan(0);
    expect(summary.totalInTransitCodBdt).toBeGreaterThan(0);
    expect(summary.totalGrossCapitalBdt).toBe(summary.totalLiquidBankMfsBdt + summary.totalInTransitCodBdt);
    expect(summary.channels.length).toBe(5);
  });

  it('should reconcile courier settlement manifest and deduct delivery, COD, and RTO return charges', () => {
    const engine = new CashflowReconcilerEngine();
    const batch = engine.reconcileSettlementBatch('steadfast', [
      {
        trackingCode: 'STF_TEST_101',
        orderRef: 'ORD_101',
        destination: 'Dhanmondi, Dhaka',
        expectedCodBdt: 3000,
        collectedCodBdt: 3000,
        deliveryFeeBdt: 80,
        codCommissionBdt: 30,
        returnFeeBdt: 0,
        deliveryStatus: 'delivered'
      },
      {
        trackingCode: 'STF_TEST_102',
        orderRef: 'ORD_102',
        destination: 'Uttara, Dhaka',
        expectedCodBdt: 1500,
        collectedCodBdt: 0,
        deliveryFeeBdt: 80,
        codCommissionBdt: 0,
        returnFeeBdt: 60,
        deliveryStatus: 'returned'
      }
    ]);

    expect(batch.carrier).toBe('steadfast');
    expect(batch.consignmentsCount).toBe(2);
    expect(batch.deliveredCount).toBe(1);
    expect(batch.returnedCount).toBe(1);
    expect(batch.grossCodCollectedBdt).toBe(3000);
    expect(batch.deliveryFeesDeductedBdt).toBe(160); // 80 + 80
    expect(batch.codCommissionDeductedBdt).toBe(30);
    expect(batch.rtoReturnFeesDeductedBdt).toBe(60);
    // Net Payout = 3000 - 160 - 30 - 60 = 2750
    expect(batch.netPayoutBdt).toBe(2750);
    expect(batch.verificationHash).toBeDefined();
  });

  it('should detect underpayment discrepancies and generate claim briefs', () => {
    const engine = new CashflowReconcilerEngine();
    const batch = engine.reconcileSettlementBatch('pathao', [
      {
        trackingCode: 'PAT_DISC_01',
        orderRef: 'ORD_PAT_01',
        destination: 'Gulshan, Dhaka',
        expectedCodBdt: 5000,
        collectedCodBdt: 4200, // Shortage of ৳800
        deliveryFeeBdt: 90,
        codCommissionBdt: 42,
        returnFeeBdt: 0,
        deliveryStatus: 'delivered'
      }
    ]);

    expect(batch.discrepanciesCount).toBe(1);
    expect(batch.discrepanciesAmountBdt).toBe(800);
    expect(batch.status).toBe('discrepancy_detected');

    const discrepancies = engine.getDiscrepancies();
    const found = discrepancies.find(d => d.trackingCode === 'PAT_DISC_01');
    expect(found).toBeDefined();
    expect(found?.shortageAmountBdt).toBe(800);
    expect(found?.claimBriefText).toContain('Shortage of ৳800 claimed');
  });

  it('should compute real-time daily unit economics and PnL waterfall with RTO return loss', () => {
    const engine = new CashflowReconcilerEngine();
    const pnl = engine.calculateDailyPnL('2026-09-21');

    expect(pnl.grossDeliveredRevenueBdt).toBe(68500);
    expect(pnl.cogsBdt).toBe(26800);
    expect(pnl.rtoFreightLossBdt).toBeGreaterThan(0);
    expect(pnl.netOperatingProfitBdt).toBeGreaterThan(0);
    expect(pnl.netMarginPercent).toBeGreaterThan(0);
    expect(pnl.rtoRatePercent).toBeGreaterThan(0);
  });

  it('should predict 30-day working capital runway and liquidity trajectory', () => {
    const engine = new CashflowReconcilerEngine();
    const forecast = engine.generateRunwayForecast();

    expect(forecast.effectiveWorkingCapitalBdt).toBeGreaterThan(0);
    expect(forecast.trajectoryDays.length).toBe(30);
    expect(forecast.runwayDays).toBeGreaterThan(0);
    expect(['healthy', 'caution', 'critical']).toContain(forecast.runwayStatus);
  });
});
