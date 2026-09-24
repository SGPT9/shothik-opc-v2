import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';
import {
  fxHedgingEngine,
  FxHedgingEngine,
} from '../../lib/hedging/fx-hedging-engine.js';

describe('Cross-Border FX Hedging & Forward Rate Lock API (/api/v1/fx-hedging/*)', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    fxHedgingEngine.resetStore();
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

  describe('FxHedgingEngine Unit Logic', () => {
    it('calculates CIRP forward rates and annualized premiums for 30, 60, 90, 180 days', () => {
      const engine = new FxHedgingEngine();
      const quotes = engine.calculateForwardQuotes(121.5, 11.5, 5.25);

      expect(quotes[30].forwardRate).toBeGreaterThan(121.5);
      expect(quotes[60].forwardRate).toBeGreaterThan(quotes[30].forwardRate);
      expect(quotes[90].forwardRate).toBeGreaterThan(quotes[60].forwardRate);
      expect(quotes[180].forwardRate).toBeGreaterThan(quotes[90].forwardRate);
      expect(quotes[90].annualizedPremiumPercent).toBeGreaterThan(5);
    });

    it('books forward contract and computes 5% margin lien amount', () => {
      const engine = new FxHedgingEngine();
      const contract = engine.bookForwardContract({
        exporterName: 'Bengal Jute Mills',
        notionalAmountUsd: 20000,
        spotRateAtBooking: 121.5,
        tenorDays: 90,
        marginLienPercent: 5,
      });

      expect(contract.contractNumber).toContain('FWD-0420-');
      expect(contract.notionalAmountUsd).toBe(20000);
      expect(contract.lockedValueBdt).toBeGreaterThan(2430000);
      expect(contract.marginLienAmountBdt).toBe(Number(((contract.lockedValueBdt * 5) / 100).toFixed(2)));
      expect(contract.status).toBe('active');
    });

    it('settles forward contract and calculates realized exchange gain/loss', () => {
      const engine = new FxHedgingEngine();
      const contract = engine.bookForwardContract({
        contractNumber: 'FWD-TEST-SETTLE',
        notionalAmountUsd: 10000,
        lockedForwardRate: 123.5,
      });

      // Settle when spot rate dropped to 121.0 (Realized Gain: 10000 * (123.5 - 121.0) = +25,000 BDT)
      const settled = engine.settleForwardContract('FWD-TEST-SETTLE', 121.0);
      expect(settled.status).toBe('settled');
      expect(settled.realizedGainLossBdt).toBe(25000);
    });

    it('revalues portfolio MTM unrealized gains across market spot shifts', () => {
      const engine = new FxHedgingEngine();
      engine.bookForwardContract({
        contractNumber: 'FWD-MTM-01',
        notionalAmountUsd: 10000,
        lockedForwardRate: 123.0,
      });

      engine.revalueMtm(120.0);
      const contract = engine.getContractByNumber('FWD-MTM-01');
      expect(contract?.unrealizedMtmGainLossBdt).toBe(30000); // 10000 * (123 - 120)
    });
  });

  describe('HTTP REST Endpoints', () => {
    it('POST /api/v1/fx-hedging/quote returns live CIRP curve', async () => {
      const res = await fetch(`${baseUrl}/api/v1/fx-hedging/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotRate: 121.5, bdtRate: 11.5, usdRate: 5.25 }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data[90].forwardRate).toBeDefined();
    });

    it('POST /api/v1/fx-hedging/contract/book creates export forward hedge', async () => {
      const payload = {
        exporterName: 'Shothik Export Ltd.',
        notionalAmountUsd: 15000,
        tenorDays: 60,
      };

      const res = await fetch(`${baseUrl}/api/v1/fx-hedging/contract/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.contractNumber).toBeDefined();
      expect(data.data.notionalAmountUsd).toBe(15000);
    });

    it('GET /api/v1/fx-hedging/contract/list returns active contracts', async () => {
      await fetch(`${baseUrl}/api/v1/fx-hedging/contract/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionalAmountUsd: 5000 }),
      });

      const res = await fetch(`${baseUrl}/api/v1/fx-hedging/contract/list`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/fx-hedging/contract/settle settles active forward', async () => {
      const bookRes = await fetch(`${baseUrl}/api/v1/fx-hedging/contract/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notionalAmountUsd: 12000 }),
      });
      const bookData = await bookRes.json();

      const settleRes = await fetch(`${baseUrl}/api/v1/fx-hedging/contract/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractNumber: bookData.data.contractNumber,
          settlementSpotRate: 121.0,
        }),
      });

      expect(settleRes.status).toBe(200);
      const settleData = await settleRes.json();
      expect(settleData.ok).toBe(true);
      expect(settleData.data.status).toBe('settled');
    });

    it('GET /api/v1/fx-hedging/summary returns portfolio risk exposure metrics', async () => {
      const res = await fetch(`${baseUrl}/api/v1/fx-hedging/summary`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.totalOpenHedgedUsd).toBeDefined();
    });
  });
});
