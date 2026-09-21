import { describe, it, expect } from 'vitest';
import {
  WholesaleRfqEscrowEngine,
  VERIFIED_WHOLESALE_SUPPLIERS
} from './wholesale-rfq-escrow-engine.js';

describe('WholesaleRfqEscrowEngine (Unit Tests)', () => {
  it('calculates tiered volume pricing curves with progressive discounts', () => {
    const basePrice = 500;
    const moq = 100;
    const tiers = WholesaleRfqEscrowEngine.calculateVolumeTiers(basePrice, moq);

    expect(tiers.length).toBe(4);
    // Tier 1: 100-199 @ 500 (0% discount)
    expect(tiers[0].minQty).toBe(100);
    expect(tiers[0].unitPriceBdt).toBe(500);
    expect(tiers[0].discountPercent).toBe(0);

    // Tier 2: 200-499 @ ~470 (6% discount)
    expect(tiers[1].minQty).toBe(200);
    expect(tiers[1].discountPercent).toBe(6);
    expect(tiers[1].unitPriceBdt).toBe(470);
    expect(tiers[1].marginalSavingsBdt).toBeGreaterThan(0);

    // Tier 4: 1000+ @ 400 (20% discount)
    expect(tiers[3].minQty).toBe(1000);
    expect(tiers[3].discountPercent).toBe(20);
    expect(tiers[3].unitPriceBdt).toBe(400);
  });

  it('generates structured RFQ drafts with cryptographic SHA-256 seal', () => {
    const rfq = WholesaleRfqEscrowEngine.generateRfqDraft({
      title: 'Bulk 100% Combed Cotton Single Jersey Fabric (180 GSM)',
      hub: 'islampur',
      category: 'textiles',
      skuName: 'SKU-FABRIC-COTTON-180',
      specifications: '100% Combed Cotton, Bio-washed, Reactive Dyed Black',
      targetQuantity: 1000,
      estimatedBasePriceBdt: 420,
      deliverySlaDays: 7
    });

    expect(rfq.rfqId).toMatch(/^RFQ_/);
    expect(rfq.hub).toBe('islampur');
    expect(rfq.targetQuantity).toBe(1000);
    expect(rfq.maxBudgetBdt).toBe(420000);
    expect(rfq.sha256Seal).toBeDefined();
    expect(rfq.sha256Seal.length).toBe(64);
    expect(rfq.volumeTiers.length).toBe(4);
  });

  it('evaluates competing supplier bids and ranks by Supplier Reliability Index (SRI)', () => {
    const rfq = WholesaleRfqEscrowEngine.generateRfqDraft({
      title: 'Amber Glass Cosmetic Bottles 50ml with Dropper Pipette',
      hub: 'chawkbazar',
      category: 'cosmetics_hardware',
      skuName: 'SKU-JAR-AMBER-50ML',
      specifications: 'Medical grade amber glass with gold aluminium collar',
      targetQuantity: 2000,
      estimatedBasePriceBdt: 45
    });

    const evalResult = WholesaleRfqEscrowEngine.evaluateSupplierBids(rfq);

    expect(evalResult.totalBids).toBeGreaterThanOrEqual(1);
    expect(evalResult.recommendedBid).toBeDefined();
    expect(evalResult.recommendedBid.recommended).toBe(true);
    expect(evalResult.recommendedBid.compositeScore).toBeGreaterThan(50);
    expect(evalResult.rankedBids[0].compositeScore).toBeGreaterThanOrEqual(
      evalResult.rankedBids[evalResult.rankedBids.length - 1].compositeScore
    );
  });

  it('compiles enforceable 3-stage milestone escrow agreements with cryptographic seal', () => {
    const rfq = WholesaleRfqEscrowEngine.generateRfqDraft({
      title: 'Premium Denim Jeans 12.5oz Heavyweight Washed',
      hub: 'keraniganj',
      category: 'apparel',
      skuName: 'SKU-JEANS-DNM-125',
      specifications: 'YKK zipper, brass rivets, 12.5oz indigo twill denim',
      targetQuantity: 500,
      estimatedBasePriceBdt: 650
    });

    const evalResult = WholesaleRfqEscrowEngine.evaluateSupplierBids(rfq);
    const topBid = evalResult.recommendedBid;

    const contract = WholesaleRfqEscrowEngine.compileMilestoneEscrowContract({
      rfq,
      bid: topBid,
      buyerName: 'Urban Vibe Apparel Ltd.'
    });

    expect(contract.contractId).toMatch(/^CTR_ESCROW_/);
    expect(contract.buyerName).toBe('Urban Vibe Apparel Ltd.');
    expect(contract.totalContractValueBdt).toBe(topBid.unitPriceBdt * 500);
    expect(contract.milestones.length).toBe(3);

    // Milestones split: 30% + 40% + 30% = 100%
    const totalMilestoneAmt = contract.milestones.reduce((acc, m) => acc + m.amountBdt, 0);
    expect(totalMilestoneAmt).toBe(contract.totalContractValueBdt);
    expect(contract.milestones[0].percentage).toBe(30);
    expect(contract.milestones[1].percentage).toBe(40);
    expect(contract.milestones[2].percentage).toBe(30);
    expect(contract.sha256Seal).toBeDefined();
    expect(contract.sha256Seal.length).toBe(64);
  });

  it('returns wholesale market hub overview across all 5 commercial zones', () => {
    const overview = WholesaleRfqEscrowEngine.getWholesaleHubsOverview();
    expect(overview.hubs.length).toBe(5);
    const hubs = overview.hubs.map((h) => h.id);
    expect(hubs).toContain('chawkbazar');
    expect(hubs).toContain('islampur');
    expect(hubs).toContain('keraniganj');
    expect(hubs).toContain('tongi_industrial');
    expect(hubs).toContain('crossborder_1688');
  });
});
