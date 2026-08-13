import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AutonomousDeliveryLoop } from '../autonomous-delivery-loop';

describe('Autonomous Technical Co-Founder Engine (autonomous-delivery-loop.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('evaluates unblocked Wayfinder frontier tasks and executes them on autopilot', async () => {
    const engine = new AutonomousDeliveryLoop({ companyId: 'comp_verifiq' });

    const result = await engine.executeNextUnblockedTask([
      { id: 't1', title: 'Setup bKash Webhook', status: 'closed' },
      { id: 't2', title: 'Build Sales Bargaining Agent', status: 'open', blockedBy: [] },
      { id: 't3', title: 'Deploy to Dokploy', status: 'open', blockedBy: ['Build Sales Bargaining Agent'] },
    ]);

    expect(result.success).toBe(true);
    expect(result.executedTaskId).toBe('t2');
    expect(result.commitMessage).toContain('Build Sales Bargaining Agent');
    expect(result.testsPassed).toBe(true);
  });

  it('self-heals broken code when runtime error logs are detected', async () => {
    const engine = new AutonomousDeliveryLoop({ companyId: 'comp_verifiq' });

    const healResult = await engine.autoHealFromErrorLog({
      errorName: 'TypeError',
      message: 'Cannot read properties of undefined',
      stack: 'at Object.calculateGst (pricing.ts:42)',
    });

    expect(healResult.healed).toBe(true);
    expect(healResult.patchApplied).toBe(true);
    expect(healResult.verifiedByVitest).toBe(true);
  });

  it('calculates daily business cash flow and P&L ledger', () => {
    const engine = new AutonomousDeliveryLoop({ companyId: 'comp_verifiq' });

    const ledger = engine.calculateDailyCashFlow({
      grossRevenueBdt: 45000,
      dailyAdSpendUsd: 50, // ~$6,000 BDT
      containerHostingCount: 2,
      ordersCount: 30,
    });

    expect(ledger.grossRevenueBdt).toBe(45000);
    expect(ledger.bkashMfsFeeBdt).toBeCloseTo(832.5, 1); // 1.85%
    expect(ledger.netProfitBdt).toBeGreaterThan(30000);
    expect(ledger.profitMarginPercent).toBeGreaterThan(60);
  });
});
