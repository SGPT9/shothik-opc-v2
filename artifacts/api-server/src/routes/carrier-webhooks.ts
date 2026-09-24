import { Router, Request, Response } from 'express';
import {
  multiCarrierWebhookEngine,
  SupportedCarrier,
  CanonicalParcelStatus,
} from '../lib/logistics/multi-carrier-webhook-engine.js';

export const carrierWebhooksRouter = Router();

/**
 * POST /api/v1/carrier-webhooks/ingest/:carrier
 * Ingests inbound webhook from Steadfast, Pathao, RedX, or Paperfly
 */
carrierWebhooksRouter.post('/v1/carrier-webhooks/ingest/:carrier', (req: Request, res: Response) => {
  try {
    const carrier = req.params.carrier as SupportedCarrier;
    const validCarriers: SupportedCarrier[] = ['steadfast', 'pathao', 'redx', 'paperfly'];

    if (!validCarriers.includes(carrier)) {
      return res.status(400).json({
        ok: false,
        error: `Unsupported carrier '${carrier}'. Supported carriers: ${validCarriers.join(', ')}`,
      });
    }

    const signature =
      (req.headers['x-webhook-signature'] as string) ||
      (req.headers['x-signature'] as string) ||
      (req.headers['authorization'] as string);

    // If signature is present, verify it
    if (signature && !multiCarrierWebhookEngine.verifySignature(carrier, req.body, signature)) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid cryptographic webhook signature or unauthorized bearer token.',
      });
    }

    const normalized = multiCarrierWebhookEngine.normalizePayload(carrier, req.body || {});
    const result = multiCarrierWebhookEngine.processEvent(normalized);

    return res.status(200).json({
      ok: true,
      data: result,
      message: `Webhook successfully ingested and reconciled for ${carrier.toUpperCase()}`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Internal server error while processing carrier webhook.',
    });
  }
});

/**
 * GET /api/v1/carrier-webhooks/reconciliation-summary
 * Returns holistic reconciliation metrics and carrier financial breakdown
 */
carrierWebhooksRouter.get('/v1/carrier-webhooks/reconciliation-summary', (_req: Request, res: Response) => {
  try {
    const summary = multiCarrierWebhookEngine.getReconciliationSummary();
    return res.status(200).json({
      ok: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to calculate reconciliation summary.',
    });
  }
});

/**
 * GET /api/v1/carrier-webhooks/events
 * Returns list of normalized carrier events
 */
carrierWebhooksRouter.get('/v1/carrier-webhooks/events', (req: Request, res: Response) => {
  try {
    const carrier = req.query.carrier as SupportedCarrier | undefined;
    const status = req.query.status as CanonicalParcelStatus | undefined;
    const events = multiCarrierWebhookEngine.getEvents({ carrier, status });

    return res.status(200).json({
      ok: true,
      data: events,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve carrier events.',
    });
  }
});

/**
 * GET /api/v1/carrier-webhooks/ledger
 * Returns real-time double-entry general ledger journal entries
 */
carrierWebhooksRouter.get('/v1/carrier-webhooks/ledger', (_req: Request, res: Response) => {
  try {
    const journalEntries = multiCarrierWebhookEngine.getJournalEntries();
    return res.status(200).json({
      ok: true,
      data: journalEntries,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve ledger entries.',
    });
  }
});

/**
 * GET /api/v1/carrier-webhooks/disputes
 * Returns detected disbursement discrepancies and draft dispute claims
 */
carrierWebhooksRouter.get('/v1/carrier-webhooks/disputes', (_req: Request, res: Response) => {
  try {
    const disputes = multiCarrierWebhookEngine.getDiscrepancies();
    return res.status(200).json({
      ok: true,
      data: disputes,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve disputes.',
    });
  }
});

/**
 * POST /api/v1/carrier-webhooks/simulate
 * Simulates a carrier webhook event for quick demo / twin studio testing
 */
carrierWebhooksRouter.post('/v1/carrier-webhooks/simulate', (req: Request, res: Response) => {
  try {
    const {
      carrier = 'steadfast',
      consignmentId = `MOCK-${Date.now()}`,
      orderId = `ORD-SIM-${Math.floor(Math.random() * 9000 + 1000)}`,
      status = 'delivered',
      collectedAmount = 2450,
      deliveryFee = 70,
      codFee = 24.5,
      recipientPhone = '01711000000',
      hubLocation = 'Dhanmondi, Dhaka',
    } = req.body || {};

    let rawPayload: Record<string, any> = {};
    if (carrier === 'steadfast') {
      rawPayload = {
        consignment_id: consignmentId,
        invoice: orderId,
        status,
        cod_amount: collectedAmount,
        delivery_charge: deliveryFee,
        cod_charge: codFee,
        recipient_phone: recipientPhone,
        delivery_zone: hubLocation,
      };
    } else if (carrier === 'pathao') {
      rawPayload = {
        consignment_id: consignmentId,
        merchant_order_id: orderId,
        order_status: status,
        collected_amount: collectedAmount,
        delivery_fee: deliveryFee,
        cod_charge: codFee,
        recipient_phone: recipientPhone,
        recipient_city: hubLocation,
      };
    } else {
      rawPayload = {
        tracking_id: consignmentId,
        customer_order_id: orderId,
        status,
        cash_collection_amount: collectedAmount,
        delivery_charge: deliveryFee,
        cod_fee: codFee,
        customer_phone: recipientPhone,
        delivery_hub: hubLocation,
      };
    }

    const normalized = multiCarrierWebhookEngine.normalizePayload(carrier as SupportedCarrier, rawPayload);
    const result = multiCarrierWebhookEngine.processEvent(normalized);

    return res.status(200).json({
      ok: true,
      data: result,
      message: `Simulated ${carrier.toUpperCase()} webhook event processed.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to simulate webhook event.',
    });
  }
});
