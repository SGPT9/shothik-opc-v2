import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';
import {
  multiCarrierWebhookEngine,
  MultiCarrierWebhookEngine,
} from '../../lib/logistics/multi-carrier-webhook-engine.js';

describe('Multi-Carrier Inbound Webhook Dispatcher & Settlement Reconciler (/api/v1/carrier-webhooks/*)', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    multiCarrierWebhookEngine.resetMemoryStore();
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

  describe('MultiCarrierWebhookEngine Unit Tests', () => {
    it('normalizes Steadfast delivered webhook and generates double-entry journal entry', () => {
      const engine = new MultiCarrierWebhookEngine();
      const rawSteadfast = {
        consignment_id: 'SF-99120',
        invoice: 'INV-2026-001',
        status: 'delivered',
        cod_amount: 3200,
        delivery_charge: 70,
        cod_charge: 32,
        recipient_phone: '01711122233',
        delivery_zone: 'Gulshan, Dhaka',
      };

      const normalized = engine.normalizePayload('steadfast', rawSteadfast);
      expect(normalized.carrier).toBe('steadfast');
      expect(normalized.consignmentId).toBe('SF-99120');
      expect(normalized.status).toBe('delivered');
      expect(normalized.collectedAmount).toBe(3200);

      const result = engine.processEvent(normalized);
      expect(result.journalEntries.length).toBe(1);
      expect(result.journalEntries[0].debitAccount).toContain('Accounts Receivable: Courier COD (STEADFAST)');
      expect(result.journalEntries[0].creditAccount).toContain('Customer Sales Revenue');
      expect(result.journalEntries[0].amount).toBe(3200);
    });

    it('normalizes Pathao settled webhook and posts bank disbursement + freight & COD expenses', () => {
      const engine = new MultiCarrierWebhookEngine();
      const rawPathao = {
        consignment_id: 'PT-88310',
        merchant_order_id: 'ORD-PATH-90',
        order_status: 'payment_invoice_settled',
        collected_amount: 5000,
        delivery_fee: 60,
        cod_charge: 50,
      };

      const normalized = engine.normalizePayload('pathao', rawPathao);
      expect(normalized.carrier).toBe('pathao');
      expect(normalized.status).toBe('settled');
      expect(normalized.netDisbursed).toBe(4890); // 5000 - 60 - 50

      const result = engine.processEvent(normalized);
      expect(result.journalEntries.length).toBe(3); // bank debit, delivery expense debit, cod commission debit
      expect(result.journalEntries[0].debitAccount).toContain('Cash at Bank');
      expect(result.journalEntries[0].amount).toBe(4890);
    });

    it('detects underpayment variance discrepancy and produces bilingual dispute claim', () => {
      const engine = new MultiCarrierWebhookEngine();
      const rawRedx = {
        tracking_id: 'REDX-7744',
        customer_order_id: 'ORD-RX-12',
        status: 'disbursed',
        cash_collection_amount: 4000,
        delivery_charge: 80,
        cod_fee: 40,
      };

      // Manually trigger normalized event with reduced net disbursement (e.g. unexpected weight penalty)
      const normalized = engine.normalizePayload('redx', rawRedx);
      normalized.netDisbursed = 3600; // Expected was 4000 - 80 - 40 = 3880. Underpaid by 280

      const result = engine.processEvent(normalized);
      expect(result.discrepancy).toBeDefined();
      expect(result.discrepancy?.variance).toBe(280);
      expect(result.discrepancy?.disputeClaimDraftBangla).toContain('কনসাইনমেন্ট #REDX-7744-এর সিওডি ডিসবার্সমেন্টে');
      expect(result.discrepancy?.disputeClaimDraftEnglish).toContain('Subject: Dispute Claim for COD Disbursement Variance');
    });

    it('calculates aggregate reconciliation summary with multi-carrier breakdown', () => {
      const engine = new MultiCarrierWebhookEngine();

      // Ingest Steadfast delivered
      engine.processEvent(
        engine.normalizePayload('steadfast', {
          consignment_id: 'SF-1',
          invoice: 'INV-1',
          status: 'delivered',
          cod_amount: 2000,
          delivery_charge: 70,
          cod_charge: 20,
        })
      );

      // Ingest Pathao delivered
      engine.processEvent(
        engine.normalizePayload('pathao', {
          consignment_id: 'PT-1',
          merchant_order_id: 'INV-2',
          order_status: 'delivered',
          collected_amount: 3000,
          delivery_fee: 60,
          cod_charge: 30,
        })
      );

      const summary = engine.getReconciliationSummary();
      expect(summary.totalEvents).toBe(2);
      expect(summary.totalCollectedCod).toBe(5000);
      expect(summary.carrierBreakdown.steadfast.deliveredCount).toBe(1);
      expect(summary.carrierBreakdown.pathao.deliveredCount).toBe(1);
    });
  });

  describe('Carrier Webhooks HTTP API Endpoints', () => {
    it('POST /api/v1/carrier-webhooks/ingest/:carrier successfully ingests Steadfast webhook', async () => {
      const payload = {
        consignment_id: 'SF-API-9901',
        invoice: 'ORD-WEBHOOK-01',
        status: 'delivered',
        cod_amount: 4500,
        delivery_charge: 70,
        cod_charge: 45,
        recipient_phone: '01812345678',
        delivery_zone: 'Chittagong Central',
      };

      const res = await fetch(`${baseUrl}/api/v1/carrier-webhooks/ingest/steadfast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.event.carrier).toBe('steadfast');
      expect(data.data.event.status).toBe('delivered');
      expect(data.data.journalEntries.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/v1/carrier-webhooks/ingest/unsupported rejects with 400', async () => {
      const res = await fetch(`${baseUrl}/api/v1/carrier-webhooks/ingest/fedex`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.ok).toBe(false);
      expect(data.error).toContain('Unsupported carrier');
    });

    it('POST /api/v1/carrier-webhooks/simulate processes simulated parcel lifecycle event', async () => {
      const res = await fetch(`${baseUrl}/api/v1/carrier-webhooks/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: 'pathao',
          consignmentId: 'MOCK-PT-100',
          orderId: 'ORD-SIM-99',
          status: 'delivered',
          collectedAmount: 1850,
          deliveryFee: 60,
          codFee: 18.5,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.event.consignmentId).toBe('MOCK-PT-100');
    });

    it('GET /api/v1/carrier-webhooks/reconciliation-summary returns complete ledger overview', async () => {
      // Seed an event first
      await fetch(`${baseUrl}/api/v1/carrier-webhooks/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: 'redx',
          consignmentId: 'RX-SIM-88',
          status: 'delivered',
          collectedAmount: 2500,
        }),
      });

      const res = await fetch(`${baseUrl}/api/v1/carrier-webhooks/reconciliation-summary`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.totalEvents).toBeGreaterThanOrEqual(1);
      expect(data.data.totalCollectedCod).toBe(2500);
    });

    it('GET /api/v1/carrier-webhooks/events retrieves normalized event log', async () => {
      await fetch(`${baseUrl}/api/v1/carrier-webhooks/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: 'paperfly',
          consignmentId: 'PF-LOG-55',
          status: 'delivered',
          collectedAmount: 1200,
        }),
      });

      const res = await fetch(`${baseUrl}/api/v1/carrier-webhooks/events?carrier=paperfly`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
      expect(data.data[0].carrier).toBe('paperfly');
    });

    it('GET /api/v1/carrier-webhooks/ledger retrieves double-entry postings', async () => {
      await fetch(`${baseUrl}/api/v1/carrier-webhooks/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: 'steadfast',
          consignmentId: 'SF-LEDGER-1',
          status: 'delivered',
          collectedAmount: 3400,
        }),
      });

      const res = await fetch(`${baseUrl}/api/v1/carrier-webhooks/ledger`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
      expect(data.data[0].amount).toBe(3400);
    });
  });
});
