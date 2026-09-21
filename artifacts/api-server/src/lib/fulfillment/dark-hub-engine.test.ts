import { describe, it, expect } from 'vitest';
import { DarkHubEngine } from './dark-hub-engine';

describe('DarkHubEngine', () => {
  it('should initialize with active dark hubs across Bangladesh hubs', () => {
    const engine = new DarkHubEngine();
    const hubs = engine.getAllHubs();
    expect(hubs.length).toBeGreaterThanOrEqual(8);

    const dhanmondi = hubs.find(h => h.hubId === 'HUB-DHK-01');
    expect(dhanmondi).toBeDefined();
    expect(dhanmondi?.city).toBe('Dhaka');
    expect(dhanmondi?.coveredThanas).toContain('Dhanmondi');
  });

  it('should correctly route order to nearest dark store with available inventory and FEFO allocation', () => {
    const engine = new DarkHubEngine();
    const result = engine.routeOrder('Dhanmondi', [
      { sku: 'SKU_SHAMPOO_ONION_250ML', quantity: 10 }
    ]);

    expect(result.assignedHub.hubId).toBe('HUB-DHK-01');
    expect(result.fulfilmentType).toBe('hyperlocal_fast_dispatch');
    expect(result.itemsAvailable).toBe(true);
    expect(result.allocatedItems.length).toBeGreaterThan(0);
    // Should prioritize earlier expiring lot (LOT_ONION_2025Z before LOT_ONION_2026A)
    expect(result.allocatedItems[0].batchNumber).toBe('LOT_ONION_2025Z');
  });

  it('should fallback to Central Hub when thana is not directly covered', () => {
    const engine = new DarkHubEngine();
    const result = engine.routeOrder('Narayanganj Sadar', [
      { sku: 'SKU_HONEY_SUNDARBAN_500G', quantity: 2 }
    ]);

    expect(result.assignedHub.hubId).toBe('HUB-DHK-00');
    expect(result.itemsAvailable).toBe(true);
  });

  it('should generate S-Curve serpentine pick list sorted to minimize walking steps', () => {
    const engine = new DarkHubEngine();
    const pickList = engine.generatePickList('HUB-DHK-01', [
      { sku: 'SKU_SHAMPOO_ONION_250ML', quantity: 15 },
      { sku: 'SKU_SERUM_VITC_30ML', quantity: 5 },
      { sku: 'SKU_MUSTARD_OIL_1L', quantity: 2 }
    ]);

    expect(pickList.tasks.length).toBeGreaterThanOrEqual(3);
    expect(pickList.pathOptimization).toBe('s_curve_serpentine');
    expect(pickList.tasks[0].pickSequence).toBe(1);
    expect(pickList.estimatedPickTimeSeconds).toBeGreaterThan(0);
    expect(pickList.estimatedWalkingMeters).toBeGreaterThan(0);
  });

  it('should detect approaching expiries and calculate liquidation markdowns', () => {
    const engine = new DarkHubEngine();
    // Reference date: 2026-09-21
    const alerts = engine.getExpiryAlerts('2026-09-21');
    expect(alerts.length).toBeGreaterThan(0);

    // INV_008 (LOT_VITE_2025Q) expires 2026-10-05 (<15 days -> critical / 60% discount)
    const criticalAlert = alerts.find(a => a.batchNumber === 'LOT_VITE_2025Q');
    expect(criticalAlert).toBeDefined();
    expect(criticalAlert?.urgency).toBe('critical');
    expect(criticalAlert?.recommendedDiscountPercent).toBe(60);
    expect(criticalAlert?.suggestedMarkdownPriceBDT).toBe(220); // 550 * 0.4
  });

  it('should generate inter-hub stock rebalance transfers for depleted hubs', () => {
    const engine = new DarkHubEngine();
    const plan = engine.generateRebalancePlan();

    expect(plan.planId).toBeDefined();
    expect(plan.hubHealthScores).toBeDefined();
    expect(typeof plan.totalUnitsToMove).toBe('number');
  });
});
