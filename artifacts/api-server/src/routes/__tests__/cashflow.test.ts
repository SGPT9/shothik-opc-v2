import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';

describe('Cashflow API Routes', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('GET /api/v1/cashflow/summary should return consolidated liquidity', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cashflow/summary`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.liquidity.totalLiquidBankMfsBdt).toBeGreaterThan(0);
    expect(body.liquidity.totalInTransitCodBdt).toBeGreaterThan(0);
    expect(Array.isArray(body.liquidity.channels)).toBe(true);
  });

  it('POST /api/v1/cashflow/reconcile-batch should reconcile courier batch and return deductions', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cashflow/reconcile-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        carrier: 'steadfast',
        consignments: [
          {
            trackingCode: 'STF_ROUTE_101',
            orderRef: 'ORD_R1',
            destination: 'Dhanmondi, Dhaka',
            expectedCodBdt: 2500,
            collectedCodBdt: 2500,
            deliveryFeeBdt: 80,
            codCommissionBdt: 25,
            returnFeeBdt: 0,
            deliveryStatus: 'delivered'
          }
        ]
      })
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.settlementBatch.carrier).toBe('steadfast');
    expect(body.settlementBatch.netPayoutBdt).toBe(2395); // 2500 - 80 - 25
  });

  it('GET /api/v1/cashflow/daily-pnl should return real-time daily unit economics and profit margin', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cashflow/daily-pnl`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.dailyPnL.grossDeliveredRevenueBdt).toBeGreaterThan(0);
    expect(body.dailyPnL.netOperatingProfitBdt).toBeGreaterThan(0);
    expect(body.dailyPnL.rtoRatePercent).toBeGreaterThan(0);
  });

  it('GET /api/v1/cashflow/discrepancies should return flagged carrier shortages', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cashflow/discrepancies`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.discrepancies)).toBe(true);
  });

  it('GET /api/v1/cashflow/runway-forecast should return 30-day working capital trajectory', async () => {
    const res = await fetch(`${baseUrl}/api/v1/cashflow/runway-forecast`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.forecast.effectiveWorkingCapitalBdt).toBeGreaterThan(0);
    expect(body.forecast.trajectoryDays.length).toBe(30);
  });
});
