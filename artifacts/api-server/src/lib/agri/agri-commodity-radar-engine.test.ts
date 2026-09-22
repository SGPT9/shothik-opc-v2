import { describe, it, expect } from 'vitest';
import {
  AgriCommodityRadarEngine,
  TRACKED_AGRI_COMMODITIES
} from './agri-commodity-radar-engine.js';

describe('AgriCommodityRadarEngine (Unit Tests)', () => {
  it('evaluates spatial farmgate vs. urban wholesale arbitrage with moisture shrinkage buffer', () => {
    // 2,000 kg Onion from Pabna (৳45) to Karwan Bazar (৳74)
    const analysis = AgriCommodityRadarEngine.evaluateArbitrage({
      commodityId: 'AGRI_ONION_01',
      quantityKg: 2000,
      transitHours: 12,
      transportType: 'open_bed_truck'
    });

    expect(analysis.commodityId).toBe('AGRI_ONION_01');
    expect(analysis.initialWeightKg).toBe(2000);
    expect(analysis.shrinkageLossKg).toBeGreaterThan(0);
    expect(analysis.effectiveArrivalWeightKg).toBeLessThan(2000);
    expect(analysis.farmgateSourcingCostBdt).toBe(2000 * 45); // ৳90,000
    expect(analysis.estimatedFreightCostBdt).toBe(2000 * 3.5); // ৳7,000
    expect(analysis.netGrossProfitBdt).toBeGreaterThan(0);
    expect(analysis.netMarginPercent).toBeGreaterThan(15);
    expect(analysis.arbitrageRating).toBe('HIGH_OPPORTUNITY');
  });

  it('demonstrates cold chain reefer shrinkage reduction and higher arrival weight', () => {
    // 1,000 kg Green Chili (high moisture loss)
    const openTruck = AgriCommodityRadarEngine.evaluateArbitrage({
      commodityId: 'AGRI_CHILI_01',
      quantityKg: 1000,
      transitHours: 14,
      transportType: 'open_bed_truck'
    });

    const coldChain = AgriCommodityRadarEngine.evaluateArbitrage({
      commodityId: 'AGRI_CHILI_01',
      quantityKg: 1000,
      transitHours: 14,
      transportType: 'reefer_cold_chain'
    });

    expect(coldChain.shrinkageLossKg).toBeLessThan(openTruck.shrinkageLossKg);
    expect(coldChain.effectiveArrivalWeightKg).toBeGreaterThan(openTruck.effectiveArrivalWeightKg);
  });

  it('creates sourcing lot draft with 1 maund = 40 kg conversion and farmer advance', () => {
    const lot = AgriCommodityRadarEngine.createSourcingLot({
      commodityId: 'AGRI_POTATO_01',
      farmerName: 'Matiur Rahman',
      farmerPhone: '+8801712998811',
      farmerMfsNumber: '01712998811',
      mfsProvider: 'bkash',
      farmLocation: 'Sirajdikhan, Munshiganj',
      quantityMaund: 50, // 50 maunds = 2,000 kg
      advancePercentage: 30
    });

    expect(lot.lotId).toMatch(/^LOT_AGRI_/);
    expect(lot.totalKg).toBe(2000); // 50 * 40
    expect(lot.estimatedGrossValueBdt).toBe(2000 * 22); // ৳44,000
    expect(lot.advanceAmountBdt).toBe(Math.round(44000 * 0.30)); // ৳13,200
    expect(lot.status).toBe('draft');
    expect(lot.sha256Seal).toBeDefined();
    expect(lot.sha256Seal.length).toBe(64);
  });

  it('executes digital disbursement of farmer advance via bKash/Nagad MFS', () => {
    const lot = AgriCommodityRadarEngine.createSourcingLot({
      commodityId: 'AGRI_MANGO_01',
      farmerName: 'Abdul Karim',
      farmerPhone: '+8801811223344',
      farmerMfsNumber: '01811223344',
      mfsProvider: 'nagad',
      farmLocation: 'Kansat, Chapainawabganj',
      quantityMaund: 25, // 1,000 kg @ ৳68 = ৳68,000
      advancePercentage: 35 // 35% advance = ৳23,800
    });

    const receipt = AgriCommodityRadarEngine.disburseFarmerAdvance(lot);

    expect(receipt.success).toBe(true);
    expect(receipt.lotId).toBe(lot.lotId);
    expect(receipt.trxId).toMatch(/^TRX_NAGAD_/);
    expect(receipt.disbursedAmountBdt).toBe(23800);
    expect(receipt.updatedStatus).toBe('advance_disbursed');
    expect(receipt.receiptSeal).toBeDefined();
    expect(receipt.receiptSeal.length).toBe(64);
  });

  it('calculates cold chain route plan economics and net economic benefit', () => {
    const plan = AgriCommodityRadarEngine.calculateColdChainPlan({
      origin: 'Kansat, Chapainawabganj',
      destination: 'Badamtoli, Dhaka',
      commodityId: 'AGRI_MANGO_01',
      quantityKg: 3000,
      distanceKm: 280
    });

    expect(plan.planId).toMatch(/^CCP_/);
    expect(plan.baseFreightBdt).toBe(3000 * 3.5); // ৳10,500
    expect(plan.coldChainSurchargeBdt).toBe(3000 * 2.0); // ৳6,000
    expect(plan.totalFreightCostBdt).toBe(16500);
    expect(plan.shrinkageMitigationSavingsBdt).toBeGreaterThan(0);
  });

  it('returns wholesale mandi market overview across all major trading hubs', () => {
    const overview = AgriCommodityRadarEngine.getMandisOverview();
    expect(overview.mandis.length).toBe(5);
    const mandiIds = overview.mandis.map((m) => m.id);
    expect(mandiIds).toContain('karwan_bazar');
    expect(mandiIds).toContain('badamtoli');
    expect(mandiIds).toContain('khatunganj');
    expect(mandiIds).toContain('bogra_mandi');
    expect(mandiIds).toContain('rajshahi_belt');
  });
});
