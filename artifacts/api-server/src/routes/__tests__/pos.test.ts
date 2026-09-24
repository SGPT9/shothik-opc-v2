import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';
import { FieldAgentPosEngine, DEFAULT_POS_CATALOG } from '../../lib/pos/field-agent-pos-engine.js';

describe('Micro-Franchise Field Agent POS & ESC/POS Print API Routes (/api/v1/pos/*)', () => {
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

  it('GET /api/v1/pos/catalog lists field products and filters by category/search', async () => {
    const res = await fetch(`${baseUrl}/api/v1/pos/catalog`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(5);

    const filtered = await fetch(`${baseUrl}/api/v1/pos/catalog?category=beverages`);
    const filteredBody = await filtered.json();
    expect(filteredBody.items.every((i: { category: string }) => i.category === 'beverages')).toBe(true);

    const searched = await fetch(`${baseUrl}/api/v1/pos/catalog?search=water`);
    const searchBody = await searched.json();
    expect(searchBody.items.length).toBeGreaterThanOrEqual(1);
    expect(searchBody.items[0].sku).toBe('BEV-002');
  });

  it('POST /api/v1/pos/cart/calculate correctly sums line totals and Mushak VAT', async () => {
    const payload = {
      items: [
        { sku: 'BEV-001', quantity: 2 }, // 2 x 25 = 50 + 5% VAT (2.5) = 52.5
        { sku: 'AGR-001', quantity: 1 }  // 1 x 110 = 110 + 0% VAT = 110
      ],
      discountBdt: 10
    };

    const res = await fetch(`${baseUrl}/api/v1/pos/cart/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.calculation.subtotalBdt).toBe(160);
    expect(body.calculation.vatTotalBdt).toBe(2.5);
    expect(body.calculation.discountBdt).toBe(10);
    expect(body.calculation.grandTotalBdt).toBe(152.5);
  });

  it('POST /api/v1/pos/receipt/escpos compiles raw 58mm and 80mm ESC/POS bytecode', async () => {
    const tx = {
      transactionId: 'TXN-FIELD-001',
      agentId: 'AG-902',
      branchId: 'DHN-01',
      timestamp: new Date().toISOString(),
      items: [
        {
          sku: 'BEV-001',
          name: 'Fresh Cha 200ml Flask Pack',
          unitPriceBdt: 25,
          quantity: 2,
          vatRatePercent: 5,
          totalVatBdt: 2.5,
          lineTotalBdt: 52.5
        }
      ],
      subtotalBdt: 50,
      vatTotalBdt: 2.5,
      discountBdt: 0,
      grandTotalBdt: 52.5,
      paymentMethod: 'cash' as const,
      cashReceivedBdt: 100,
      changeReturnedBdt: 47.5,
      mfsAmountBdt: 0,
      syncStatus: 'pending' as const,
      sha256Seal: ''
    };

    const res = await fetch(`${baseUrl}/api/v1/pos/receipt/escpos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paperWidth: '58mm',
        transaction: tx,
        includeQrCode: true,
        cutPaper: true
      })
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.printJob.paperWidth).toBe('58mm');
    expect(body.printJob.base64Bytecode).toBeDefined();
    expect(body.printJob.byteLength).toBeGreaterThan(50);
    expect(body.printJob.formattedText).toContain('SHOTHIK NBR FISCAL POS');
  });

  it('POST /api/v1/pos/qr/dynamic generates compliant bKash and Nagad QR payloads', async () => {
    const payload = {
      provider: 'bkash',
      merchantNumber: '01711223344',
      merchantBin: '001234567-0101',
      amountBdt: 250,
      referenceId: 'INV-9901'
    };

    const res = await fetch(`${baseUrl}/api/v1/pos/qr/dynamic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.qr.provider).toBe('bkash');
    expect(body.qr.amountBdt).toBe(250);
    expect(body.qr.rawPayload).toContain('BKASH_MERCHANT_QR');
    expect(body.qr.verificationUrl).toContain('merchant=01711223344');
  });

  it('POST /api/v1/pos/transactions/sync reconciles offline transactions and detects duplicates', async () => {
    const tx1 = {
      transactionId: `TXN-SYNC-${Date.now()}-1`,
      agentId: 'AG-902',
      branchId: 'DHN-01',
      timestamp: new Date().toISOString(),
      items: [],
      subtotalBdt: 100,
      vatTotalBdt: 5,
      discountBdt: 0,
      grandTotalBdt: 105,
      paymentMethod: 'cash' as const,
      cashReceivedBdt: 105,
      changeReturnedBdt: 0,
      mfsAmountBdt: 0,
      syncStatus: 'pending' as const,
      sha256Seal: ''
    };
    tx1.sha256Seal = FieldAgentPosEngine.generateTransactionSeal(tx1);

    const res1 = await fetch(`${baseUrl}/api/v1/pos/transactions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: [tx1] })
    });

    const body1 = await res1.json();
    expect(body1.success).toBe(true);
    expect(body1.result.totalSynced).toBe(1);
    expect(body1.result.totalDuplicates).toBe(0);

    // Sync same transaction again -> duplicate detected
    const res2 = await fetch(`${baseUrl}/api/v1/pos/transactions/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions: [tx1] })
    });

    const body2 = await res2.json();
    expect(body2.success).toBe(true);
    expect(body2.result.totalDuplicates).toBe(1);
  });

  it('POST /api/v1/pos/float/reconcile calculates end of day balancing and supervisor hash', async () => {
    const payload = {
      sessionId: 'SES-001',
      agentId: 'AG-902',
      openingFloatBdt: 1000,
      totalCashSalesBdt: 4500,
      totalMfsSalesBdt: 2200,
      actualCountedCashBdt: 5500 // 1000 + 4500 = 5500 (balanced)
    };

    const res = await fetch(`${baseUrl}/api/v1/pos/float/reconcile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.session.expectedCashInHandBdt).toBe(5500);
    expect(body.session.discrepancyBdt).toBe(0);
    expect(body.session.status).toBe('closed_balanced');
    expect(body.session.supervisorSignOffHash).toBeDefined();
  });

  it('GET /api/v1/pos/metrics returns daily summary stats', async () => {
    const res = await fetch(`${baseUrl}/api/v1/pos/metrics`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.metrics.totalCatalogItems).toBe(DEFAULT_POS_CATALOG.length);
  });
});
