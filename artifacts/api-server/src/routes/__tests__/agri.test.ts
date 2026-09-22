import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';

describe('Agri Mandi Radar & Sourcing API Routes (/api/v1/agri/*)', () => {
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

  it('GET /api/v1/agri/commodities lists tracked commodities and filters by category', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agri/commodities`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.commodities.length).toBeGreaterThanOrEqual(5);

    const filteredRes = await fetch(`${baseUrl}/api/v1/agri/commodities?category=spices_condiments`);
    expect(filteredRes.status).toBe(200);
    const filteredBody = await filteredRes.json();
    expect(filteredBody.commodities.every((c: { category: string }) => c.category === 'spices_condiments')).toBe(true);
  });

  it('POST /api/v1/agri/arbitrage/evaluate calculates farmgate vs mandi margin with shrinkage buffer', async () => {
    const payload = {
      commodityId: 'AGRI_ONION_01',
      quantityKg: 5000,
      transitHours: 14,
      transportType: 'open_bed_truck'
    };

    const res = await fetch(`${baseUrl}/api/v1/agri/arbitrage/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.analysis.commodityId).toBe('AGRI_ONION_01');
    expect(body.analysis.shrinkageLossKg).toBeGreaterThan(0);
    expect(body.analysis.effectiveArrivalWeightKg).toBeLessThan(5000);
    expect(body.analysis.netGrossProfitBdt).toBeGreaterThan(0);
  });

  it('POST /api/v1/agri/lots/create generates sourcing lot with 1 Maund = 40kg conversion', async () => {
    const payload = {
      commodityId: 'AGRI_POTATO_01',
      farmerName: 'Kuddus Bepari',
      farmerPhone: '01711223344',
      farmerMfsNumber: '01711223344',
      mfsProvider: 'bkash',
      farmLocation: 'Munshiganj',
      quantityMaund: 50,
      advancePercentage: 30
    };

    const res = await fetch(`${baseUrl}/api/v1/agri/lots/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.lot.lotId).toMatch(/^LOT_AGRI_/);
    expect(body.lot.totalKg).toBe(2000); // 50 maund * 40 kg
    expect(body.lot.advanceAmountBdt).toBe(body.lot.estimatedGrossValueBdt * 0.3);
    expect(body.lot.sha256Seal).toBeDefined();
  });

  it('POST /api/v1/agri/lots/disburse-advance returns MFS receipt seal', async () => {
    const mockLot = {
      lotId: 'LOT_AGRI_TEST_123',
      advanceAmountBdt: 13200,
      farmerMfsNumber: '01711002233',
      mfsProvider: 'bkash'
    };

    const res = await fetch(`${baseUrl}/api/v1/agri/lots/disburse-advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lot: mockLot })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.receipt.trxId).toMatch(/^TRX_BKASH_/);
    expect(body.receipt.disbursedAmountBdt).toBe(13200);
    expect(body.receipt.receiptSeal).toBeDefined();
  });

  it('POST /api/v1/agri/logistics/cold-chain-plan evaluates reefer vs open truck savings', async () => {
    const payload = {
      origin: 'Bogra Spice Belt',
      destination: 'Karwan Bazar, Dhaka',
      commodityId: 'AGRI_CHILI_01',
      quantityKg: 3000,
      distanceKm: 220
    };

    const res = await fetch(`${baseUrl}/api/v1/agri/logistics/cold-chain-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.plan.planId).toMatch(/^CCP_/);
    expect(body.plan.shrinkageMitigationSavingsBdt).toBeGreaterThan(0);
  });

  it('GET /api/v1/agri/mandis/overview returns major trading hubs in Bangladesh', async () => {
    const res = await fetch(`${baseUrl}/api/v1/agri/mandis/overview`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.mandis.length).toBeGreaterThanOrEqual(5);
    expect(body.mandis.some((m: { id: string }) => m.id === 'karwan_bazar')).toBe(true);
    expect(body.mandis.some((m: { id: string }) => m.id === 'khatunganj')).toBe(true);
  });
});
