import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';
import { Mushak43Engine } from '../../lib/mushak43/mushak43-engine.js';

describe('NBR Mushak-4.3 Factory Costing & Coefficient API Routes (/api/v1/mushak43/*)', () => {
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

  it('GET /api/v1/mushak43/templates returns industry BOM templates', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mushak43/templates`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.templates.length).toBeGreaterThanOrEqual(2);
    expect(body.templates[0].productName).toContain('Butter Toast Biscuit');
  });

  it('GET /api/v1/mushak43/declarations lists active registered declarations', async () => {
    const res = await fetch(`${baseUrl}/api/v1/mushak43/declarations`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.count).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/mushak43/calculate computes net consumption, overheads, and value addition %', async () => {
    const payload = {
      rawMaterials: [
        {
          materialId: 'MAT-COTTON',
          name: 'Combed Cotton Yarn',
          banglaName: 'কটন সুতা',
          hsCode: '5205.12.00',
          unitOfMeasure: 'kg',
          grossConsumptionPerUnit: 0.25,
          standardWastagePercent: 6.0,
          unitCostBdt: 420
        }
      ],
      overheads: {
        directLaborCostBdt: 30,
        utilitiesEnergyCostBdt: 12,
        packagingMaterialCostBdt: 8,
        profitMarginPercent: 20,
        vatRatePercent: 15
      }
    };

    const res = await fetch(`${baseUrl}/api/v1/mushak43/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.result.rawMaterials[0].totalMaterialCostBdt).toBe(105);
    expect(body.result.costingBreakdown.totalCostOfProductionBdt).toBe(155);
    expect(body.result.costingBreakdown.profitMarginBdt).toBe(31);
    expect(body.result.costingBreakdown.declaredSellingPriceExVatBdt).toBe(186);
    expect(body.result.costingBreakdown.valueAdditionPercent).toBeGreaterThan(40);
  });

  it('POST /api/v1/mushak43/declarations/create creates formal declaration with 13-digit BIN validation', async () => {
    const payload = {
      finishedProductSku: 'SKU-POLO-001',
      finishedProductName: 'Premium Mens Knit Polo Shirt',
      finishedProductBanglaName: 'মেনস নিট পোলো শার্ট',
      finishedProductHsCode: '6105.10.00',
      unitOfSupply: 'Piece',
      manufacturerBin: '001234567-0101',
      manufacturerName: 'Shothik Apparel Industries',
      factoryAddress: 'Plot 12, Export Processing Zone, Savar',
      divisionalVatOffice: 'Divisional VAT Office, Savar Division',
      rawMaterials: [
        {
          materialId: 'MAT-KNIT',
          name: 'Single Jersey Cotton Fabric',
          banglaName: 'কটন ফেব্রিক',
          hsCode: '6006.22.00',
          unitOfMeasure: 'yard',
          grossConsumptionPerUnit: 1.2,
          standardWastagePercent: 5.0,
          unitCostBdt: 150
        }
      ],
      overheads: {
        directLaborCostBdt: 50,
        utilitiesEnergyCostBdt: 15,
        packagingMaterialCostBdt: 10,
        profitMarginPercent: 20,
        vatRatePercent: 7.5
      },
      firstSupplyEffectiveDate: '2026-10-15',
      declaredBy: 'Mahmudur Rahman',
      designation: 'Director of Taxation'
    };

    const res = await fetch(`${baseUrl}/api/v1/mushak43/declarations/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.declaration.formNumber).toBe('মূসক-৪.৩');
    expect(body.declaration.sha256Seal).toBeDefined();
    expect(body.declaration.costingBreakdown.valueAdditionPercent).toBeGreaterThan(0);
  });

  it('POST /api/v1/mushak43/batch-audit flags >7.5% variance threshold triggering refiling', async () => {
    // Normal variance within threshold (e.g. 3%)
    const normalRes = await fetch(`${baseUrl}/api/v1/mushak43/batch-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        declarationId: 'MUSHAK43-BAKERY-001',
        batchNumber: 'BCH-2026-09A',
        actualUnitsProduced: 1000,
        actualTotalCostRecordedBdt: 52000 // Standard is 50.6 * 1000 = 50600. 52000 is ~2.7% variance
      })
    });

    expect(normalRes.status).toBe(200);
    const normalBody = await normalRes.json();
    expect(normalBody.success).toBe(true);
    expect(normalBody.audit.thresholdExceeded).toBe(false);
    expect(normalBody.audit.actionRequired).toBe('none');

    // High variance exceeding 7.5% NBR threshold (e.g. 15% cost surge due to raw material hike)
    const surgeRes = await fetch(`${baseUrl}/api/v1/mushak43/batch-audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        declarationId: 'MUSHAK43-BAKERY-001',
        batchNumber: 'BCH-2026-09B',
        actualUnitsProduced: 1000,
        actualTotalCostRecordedBdt: 58000 // Standard is 50600. 58000 is +14.6% variance
      })
    });

    expect(surgeRes.status).toBe(200);
    const surgeBody = await surgeRes.json();
    expect(surgeBody.success).toBe(true);
    expect(surgeBody.audit.thresholdExceeded).toBe(true);
    expect(surgeBody.audit.actionRequired).toBe('refile_mushak_4_3_declaration');
  });
});
