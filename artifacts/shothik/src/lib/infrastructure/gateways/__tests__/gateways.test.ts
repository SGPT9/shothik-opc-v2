/**
 * Production Gateways Test Suite
 * Tests for bKash PGW, Nagad PGW, Webhook Receiver, Steadfast API, Pathao API, and Capability Seams
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BkashTokenizedPGW } from '../bkash-tokenized-pgw';
import { NagadDirectPGW } from '../nagad-direct-pgw';
import { PaymentWebhookReceiver } from '../payment-webhook-receiver';
import { SteadfastCourierAPI } from '../steadfast-courier-api';
import { PathaoCourierAPI } from '../pathao-courier-api';
import { CapabilitySeamRegistry } from '../../../harness/capability-seam';
import {
  PaymentServiceDefinition,
  BkashPaymentProvider,
  NagadPaymentProvider,
  type PaymentService,
} from '../payment-capability';
import {
  CourierServiceDefinition,
  SteadfastCourierProvider,
  PathaoCourierProvider,
  type CourierService,
} from '../courier-capability';
import { SessionEventLog } from '../../../harness/session-event-log';
import { HookBridge } from '../../../harness/hook-bridge';
import crypto from 'crypto';

describe('Production Gateways & Capability Seams', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // ── 1. bKash Tokenized Checkout PGW Tests ─────────────────

  describe('bKash Tokenized PGW', () => {
    const config = {
      baseUrl: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
      appKey: 'test_app_key',
      appSecret: 'test_app_secret',
      username: 'test_user',
      password: 'test_pass',
      callbackUrl: 'https://shothik.app/callback',
    };

    it('should grant and cache token', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id_token: 'mock_id_token_123',
          refresh_token: 'mock_refresh_token',
          expires_in: 3600,
          statusCode: '0000',
          statusMessage: 'Successful',
        }),
      });

      const pgw = new BkashTokenizedPGW(config);
      const token = await pgw.getAuthToken();

      expect(token).toBe('mock_id_token_123');
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Second call should return cached token without fetch
      const cachedToken = await pgw.getAuthToken();
      expect(cachedToken).toBe('mock_id_token_123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should create payment session', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          // token grant
          ok: true,
          json: async () => ({
            id_token: 'mock_token',
            expires_in: 3600,
            statusCode: '0000',
          }),
        })
        .mockResolvedValueOnce({
          // create payment
          ok: true,
          json: async () => ({
            paymentID: 'BKASH_PAY_999',
            bkashURL: 'https://pay.bka.sh/checkout/BKASH_PAY_999',
            statusCode: '0000',
            statusMessage: 'Successful',
            amount: '500.00',
            currency: 'BDT',
          }),
        });

      const pgw = new BkashTokenizedPGW(config);
      const res = await pgw.createPayment({
        amount: 500,
        invoiceNumber: 'INV_001',
      });

      expect(res.paymentID).toBe('BKASH_PAY_999');
      expect(res.bkashURL).toContain('BKASH_PAY_999');
    });

    it('should execute payment successfully', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id_token: 'mock_token',
            expires_in: 3600,
            statusCode: '0000',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            paymentID: 'BKASH_PAY_999',
            trxID: 'TRX_BKASH_LIVE_001',
            transactionStatus: 'Completed',
            amount: '500.00',
            statusCode: '0000',
          }),
        });

      const pgw = new BkashTokenizedPGW(config);
      const res = await pgw.executePayment('BKASH_PAY_999');

      expect(res.transactionStatus).toBe('Completed');
      expect(res.trxID).toBe('TRX_BKASH_LIVE_001');
    });
  });

  // ── 2. Nagad Direct PGW Tests ─────────────────────────────

  describe('Nagad Direct PGW', () => {
    const config = {
      baseUrl: 'https://api.sandbox.nagad.com.bd',
      merchantId: 'NAGAD_M_001',
      merchantPrivateKey: 'MOCK_KEY',
      nagadPublicKey: 'MOCK_PUB',
      callbackUrl: 'https://shothik.app/nagad/callback',
    };

    it('should initialize payment and return checkout URL', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'Success',
          callBackUrl: 'https://api.sandbox.nagad.com.bd/check-out/payment/NAGAD_REF_123',
          paymentReferenceId: 'NAGAD_REF_123',
        }),
      });

      const pgw = new NagadDirectPGW(config);
      const res = await pgw.initializePayment({
        orderId: 'ORDER_100',
        amount: 1200,
        customerMobile: '01711111111',
      });

      expect(res.status).toBe('Success');
      expect(res.paymentReferenceId).toBe('NAGAD_REF_123');
      expect(res.callBackUrl).toContain('NAGAD_REF_123');
    });

    it('should verify completed Nagad payment', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          merchantId: 'NAGAD_M_001',
          orderId: 'ORDER_100',
          paymentRefId: 'NAGAD_REF_123',
          amount: '1200.00',
          status: 'Success',
          statusCode: '000',
          issuerPaymentRefNo: 'TRX_NAGAD_999',
        }),
      });

      const pgw = new NagadDirectPGW(config);
      const res = await pgw.verifyPayment('NAGAD_REF_123');

      expect(res.status).toBe('Success');
      expect(res.issuerPaymentRefNo).toBe('TRX_NAGAD_999');
    });
  });

  // ── 3. Payment Webhook Receiver Tests ─────────────────────

  describe('Payment Webhook Receiver & Signature Verification', () => {
    const secret = 'super_secret_webhook_key_2026';
    let eventLog: SessionEventLog;
    let hookBridge: HookBridge;
    let receiver: PaymentWebhookReceiver;

    beforeEach(() => {
      eventLog = new SessionEventLog('webhook-test-session');
      hookBridge = new HookBridge({}, eventLog);
      receiver = new PaymentWebhookReceiver(secret, eventLog, hookBridge);
    });

    it('should verify valid HMAC-SHA256 signature', () => {
      const body = JSON.stringify({ paymentID: 'PAY_123', amount: '250' });
      const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

      expect(receiver.verifyHmacSignature(body, signature)).toBe(true);
      expect(receiver.verifyHmacSignature(body, 'invalid_signature')).toBe(false);
    });

    it('should process bKash webhook and emit to HookBridge & SessionEventLog', () => {
      const payload = {
        paymentID: 'PAY_123',
        trxID: 'TRX_BKASH_HOOK_01',
        amount: '350.00',
        transactionStatus: 'Completed',
        customerMsisdn: '01800000000',
        merchantInvoiceNumber: 'INV_555',
      };

      const result = receiver.processBkashWebhook(payload);

      expect(result.valid).toBe(true);
      expect(result.eventType).toBe('payment.success');
      expect(result.transactionId).toBe('TRX_BKASH_HOOK_01');

      // Verify SessionEventLog captured result
      const loggedEvents = eventLog.getAll();
      expect(loggedEvents.some((e) => e.data['trxID'] === 'TRX_BKASH_HOOK_01')).toBe(true);
    });

    it('should maintain idempotency on duplicate webhook deliveries', () => {
      const payload = {
        paymentID: 'PAY_DUP',
        trxID: 'TRX_DUP_01',
        amount: '100.00',
        transactionStatus: 'Completed',
      };

      const first = receiver.processBkashWebhook(payload);
      const second = receiver.processBkashWebhook(payload);

      expect(first.valid).toBe(true);
      expect(second.valid).toBe(true);
    });
  });

  // ── 4. Steadfast Courier API Tests ────────────────────────

  describe('Steadfast Logistics API', () => {
    const config = {
      baseUrl: 'https://portal.steadfast.com.bd/api/v1',
      apiKey: 'test_key',
      secretKey: 'test_secret',
    };

    it('should create delivery consignment order', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          message: 'Consignment created',
          consignment: {
            consignment_id: 104523,
            invoice: 'INV_STEADFAST_001',
            tracking_code: 'STDF_TRK_9999',
            recipient_name: 'Anisul Hoque',
            recipient_phone: '01700000000',
            recipient_address: 'Dhanmondi 27, Dhaka',
            cod_amount: 550,
            status: 'in_review',
            created_at: '2026-09-01T12:00:00Z',
          },
        }),
      });

      const api = new SteadfastCourierAPI(config);
      const res = await api.createOrder({
        invoice: 'INV_STEADFAST_001',
        recipientName: 'Anisul Hoque',
        recipientPhone: '01700000000',
        recipientAddress: 'Dhanmondi 27, Dhaka',
        codAmount: 550,
      });

      expect(res.status).toBe(200);
      expect(res.consignment.tracking_code).toBe('STDF_TRK_9999');
      expect(res.consignment.consignment_id).toBe(104523);
    });

    it('should track parcel by tracking code', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 200,
          delivery_status: 'delivered',
        }),
      });

      const api = new SteadfastCourierAPI(config);
      const tracking = await api.getStatusByTrackingCode('STDF_TRK_9999');

      expect(tracking.delivery_status).toBe('delivered');
    });
  });

  // ── 5. Pathao Courier API Tests ───────────────────────────

  describe('Pathao Logistics API', () => {
    const config = {
      baseUrl: 'https://api-hermes.pathao.com',
      clientId: 'pathao_client_id',
      clientSecret: 'pathao_secret',
      username: 'pathao_user',
      password: 'pathao_password',
      storeId: 101,
    };

    it('should create order on Pathao', async () => {
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'pathao_bearer_token',
            expires_in: 3600,
            token_type: 'Bearer',
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            type: 'success',
            message: 'Order created',
            data: {
              consignment_id: 'PT_CNS_888',
              merchant_order_id: 'INV_PTH_01',
              order_status: 'Pickup_Pending',
              delivery_fee: 60,
            },
          }),
        });

      const api = new PathaoCourierAPI(config);
      const res = await api.createOrder({
        merchantOrderId: 'INV_PTH_01',
        recipientName: 'Sumon Ahmed',
        recipientPhone: '01811111111',
        recipientAddress: 'Gulshan 2, Dhaka',
        recipientCityId: 1,
        recipientZoneId: 1,
        amountToCollect: 1500,
      });

      expect(res.data.consignment_id).toBe('PT_CNS_888');
      expect(res.data.order_status).toBe('Pickup_Pending');
    });
  });

  // ── 6. DSH Capability Seam Integration ────────────────────

  describe('DSH Capability Seams for Payment & Logistics', () => {
    let registry: CapabilitySeamRegistry;

    beforeEach(() => {
      registry = new CapabilitySeamRegistry();
    });

    it('should register Payment and Courier seams and resolve priority providers', () => {
      // Define seams
      registry.defineSeam(PaymentServiceDefinition);
      registry.defineSeam(CourierServiceDefinition);

      // Register bKash (Priority 10) & Nagad (Priority 8)
      registry.registerProvider(
        'payment-gateway',
        new BkashPaymentProvider({
          baseUrl: 'https://tokenized.bka.sh',
          appKey: 'k',
          appSecret: 's',
          username: 'u',
          password: 'p',
          callbackUrl: 'c',
        })
      );
      registry.registerProvider(
        'payment-gateway',
        new NagadPaymentProvider({
          baseUrl: 'https://nagad.bd',
          merchantId: 'm',
          merchantPrivateKey: 'k',
          nagadPublicKey: 'p',
          callbackUrl: 'c',
        })
      );

      // Register Steadfast (Priority 10) & Pathao (Priority 8)
      registry.registerProvider(
        'courier-logistics',
        new SteadfastCourierProvider({
          baseUrl: 'https://steadfast.bd',
          apiKey: 'k',
          secretKey: 's',
        })
      );

      // Consumers resolve without knowing concrete class
      const paymentService = registry.resolve<PaymentService>('payment-gateway');
      const courierService = registry.resolve<CourierService>('courier-logistics');

      expect(paymentService.providerName).toBe('bKash'); // Auto-selected highest priority
      expect(courierService.providerName).toBe('Steadfast'); // Auto-selected highest priority

      // Seamless runtime switch to Nagad
      registry.switchProvider('payment-gateway', 'nagad-direct');
      expect(registry.resolve<PaymentService>('payment-gateway').providerName).toBe('Nagad');
    });
  });
});
