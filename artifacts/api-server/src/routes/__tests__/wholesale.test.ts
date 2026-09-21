import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';

describe('Wholesale RFQ & Escrow API Routes (/api/v1/wholesale/*)', () => {
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

  it('GET /api/v1/wholesale/suppliers lists verified suppliers and filters by hub', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wholesale/suppliers`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.suppliers.length).toBeGreaterThanOrEqual(5);

    const filteredRes = await fetch(`${baseUrl}/api/v1/wholesale/suppliers?hub=islampur`);
    expect(filteredRes.status).toBe(200);
    const filteredBody = await filteredRes.json();
    expect(filteredBody.suppliers.every((s: { hub: string }) => s.hub === 'islampur')).toBe(true);
  });

  it('POST /api/v1/wholesale/rfq/generate creates an RFQ draft with volume tiers', async () => {
    const payload = {
      title: 'Bulk Premium Oxford Cotton Shirting Fabric',
      hub: 'islampur',
      category: 'textiles',
      skuName: 'SKU-SHIRT-OXFORD-BLU',
      specifications: '100% 80s two-ply yarn-dyed Oxford cotton',
      targetQuantity: 1500,
      estimatedBasePriceBdt: 380,
      deliverySlaDays: 8,
      sampleRequired: true,
      incoterm: 'ddp_warehouse'
    };

    const res = await fetch(`${baseUrl}/api/v1/wholesale/rfq/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.rfq.rfqId).toMatch(/^RFQ_/);
    expect(body.rfq.volumeTiers.length).toBe(4);
    expect(body.rfq.sha256Seal).toBeDefined();
  });

  it('POST /api/v1/wholesale/rfq/evaluate-bids ranks bids using Supplier Reliability Index', async () => {
    const genRes = await fetch(`${baseUrl}/api/v1/wholesale/rfq/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Cosmetic Aluminium Dropper Bottles 30ml',
        hub: 'chawkbazar',
        category: 'cosmetics_hardware',
        skuName: 'SKU-BOTTLE-30ML',
        specifications: 'Matte black dropper with pipette',
        targetQuantity: 3000,
        estimatedBasePriceBdt: 35
      })
    });

    const genBody = await genRes.json();
    const rfq = genBody.rfq;

    const res = await fetch(`${baseUrl}/api/v1/wholesale/rfq/evaluate-bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfq })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.evaluation.rankedBids.length).toBeGreaterThanOrEqual(1);
    expect(body.evaluation.recommendedBid.recommended).toBe(true);
  });

  it('POST /api/v1/wholesale/escrow/compile-contract compiles 3-stage milestone escrow agreement', async () => {
    const genRes = await fetch(`${baseUrl}/api/v1/wholesale/rfq/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Heavy Duty 3-Ply Corrugated Cartons (12x10x8 inch)',
        hub: 'tongi_industrial',
        category: 'packaging',
        skuName: 'SKU-CARTON-12X10',
        specifications: '150 GSM Kraft paper, burst factor 18',
        targetQuantity: 2000,
        estimatedBasePriceBdt: 28
      })
    });

    const genBody = await genRes.json();
    const rfq = genBody.rfq;

    const evalRes = await fetch(`${baseUrl}/api/v1/wholesale/rfq/evaluate-bids`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rfq })
    });

    const evalBody = await evalRes.json();
    const topBid = evalBody.evaluation.recommendedBid;

    const res = await fetch(`${baseUrl}/api/v1/wholesale/escrow/compile-contract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rfq,
        bid: topBid,
        buyerName: 'Dhaka Agro Commerce Ltd.'
      })
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.contract.contractId).toMatch(/^CTR_ESCROW_/);
    expect(body.contract.milestones.length).toBe(3);
    expect(body.contract.sha256Seal).toBeDefined();
  });

  it('GET /api/v1/wholesale/hubs/overview returns market overview', async () => {
    const res = await fetch(`${baseUrl}/api/v1/wholesale/hubs/overview`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.hubs.length).toBe(5);
  });
});
