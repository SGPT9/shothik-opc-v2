import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';
import {
  exportComplianceEngine,
  ExportComplianceEngine,
} from '../../lib/export/export-compliance-engine.js';

describe('Cross-Border Export Manifest & Form-EXP Compliance API (/api/v1/export-compliance/*)', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    exportComplianceEngine.resetStore();
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

  describe('ExportComplianceEngine Unit Logic', () => {
    it('validates 10-digit ERC against 13-digit NBR BIN', () => {
      const engine = new ExportComplianceEngine();
      const res = engine.validateErc('ERC-EXP-2026-9041', '001234567-0101');
      expect(res.valid).toBe(true);
      expect(res.ccieStatus).toBe('active');
      expect(res.expiryDate).toBe('2027-06-30');

      const invalidBinRes = engine.validateErc('ERC-EXP-2026-9041', '12345');
      expect(invalidBinRes.valid).toBe(false);
      expect(invalidBinRes.message).toContain('13-Digit');
    });

    it('generates compliant Form-EXP with 120-day FERA repatriation countdown and subsidy accrual', () => {
      const engine = new ExportComplianceEngine();
      const exp = engine.generateFormExp({
        exporterName: 'Bengal Artisan Exports',
        consigneeName: 'Kyoto Crafts Ltd.',
        destinationCountry: 'Japan',
        portOfShipment: 'chittagong_seaport',
        items: [
          {
            itemDescription: 'Traditional Handloom Nakshi Kantha Quilts',
            banglaDescription: 'হাতে সেলাই করা নকশী কাঁথা',
            hsCode: '6304.92.00',
            quantity: 300,
            unit: 'Pcs',
            unitPriceUsd: 45,
            fobValueUsd: 13500,
          },
        ],
        cashIncentiveEligiblePercent: 10,
      });

      expect(exp.expNumber).toContain('EXP-0420-');
      expect(exp.totalFobUsd).toBe(13500);
      expect(exp.totalFobBdt).toBe(1640250); // 13500 * 121.5
      expect(exp.daysRemainingRepatriation).toBeGreaterThanOrEqual(119);
      expect(exp.cashIncentiveAccruedBdt).toBe(164025);
      expect(exp.verificationHash.length).toBe(64);
    });

    it('updates LC milestone to realized and generates PRC certificate number', () => {
      const engine = new ExportComplianceEngine();
      const exp = engine.generateFormExp({
        expNumber: 'EXP-TEST-99',
        totalFobUsd: 10000,
      });

      const updated = engine.updateLcMilestone('EXP-TEST-99', 'realized', 10000);
      expect(updated.status).toBe('realized');
      expect(updated.realizedAmountUsd).toBe(10000);
      expect(updated.prcCertificateNumber).toContain('PRC-BB-');
    });
  });

  describe('HTTP REST Endpoints', () => {
    it('POST /api/v1/export-compliance/form-exp/generate creates new export filing', async () => {
      const payload = {
        exporterName: 'Shothik Leather Crafts Ltd.',
        consigneeName: 'Milano Leather House S.r.l.',
        destinationCountry: 'Italy',
        portOfShipment: 'chittagong_seaport',
        items: [
          {
            itemDescription: 'Full-Grain Leather Wallets & Cardholders',
            banglaDescription: 'চামড়ার মানিব্যাগ',
            hsCode: '4202.31.00',
            quantity: 1000,
            unit: 'Pcs',
            unitPriceUsd: 9.5,
            fobValueUsd: 9500,
          },
        ],
        cashIncentiveEligiblePercent: 10,
      };

      const res = await fetch(`${baseUrl}/api/v1/export-compliance/form-exp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.expNumber).toBeDefined();
      expect(data.data.totalFobUsd).toBe(9500);
    });

    it('GET /api/v1/export-compliance/form-exp/list returns active filings', async () => {
      // Seed one record
      await fetch(`${baseUrl}/api/v1/export-compliance/form-exp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exporterName: 'Test Exporter',
          destinationCountry: 'UK',
        }),
      });

      const res = await fetch(`${baseUrl}/api/v1/export-compliance/form-exp/list`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/export-compliance/validate-erc verifies statutory standing', async () => {
      const res = await fetch(`${baseUrl}/api/v1/export-compliance/validate-erc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ercNumber: 'ERC-2026-8812',
          bin: '001234567-0101',
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.valid).toBe(true);
      expect(data.data.ccieStatus).toBe('active');
    });

    it('POST /api/v1/export-compliance/lc/update updates realization status', async () => {
      const expRes = await fetch(`${baseUrl}/api/v1/export-compliance/form-exp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expNumber: 'EXP-LC-TEST-01',
          exporterName: 'LC Exporter',
        }),
      });
      const expData = await expRes.json();

      const updateRes = await fetch(`${baseUrl}/api/v1/export-compliance/lc/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expNumber: expData.data.expNumber,
          status: 'shipped_onboard',
          shipmentDate: '2026-09-20',
        }),
      });

      expect(updateRes.status).toBe(200);
      const updateData = await updateRes.json();
      expect(updateData.ok).toBe(true);
      expect(updateData.data.status).toBe('shipped_onboard');
    });

    it('GET /api/v1/export-compliance/summary returns turnover and subsidy ledger', async () => {
      const res = await fetch(`${baseUrl}/api/v1/export-compliance/summary`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.totalExportsCount).toBeDefined();
    });
  });
});
