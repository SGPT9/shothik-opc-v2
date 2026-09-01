/**
 * Payment Capability Seam Definition & Providers
 * Follows DSH 3-Role Capability Seam Architecture (Definition, Provider, Consumer)
 */

import type { ServiceDefinition, ServiceProvider } from '../../harness/capability-seam';
import { BkashTokenizedPGW, type BkashConfig } from './bkash-tokenized-pgw';
import { NagadDirectPGW, type NagadConfig } from './nagad-direct-pgw';

export interface PaymentService {
  readonly providerName: string;
  createCheckout(params: {
    amountBdt: number;
    invoiceId: string;
    customerPhone?: string;
  }): Promise<{ checkoutUrl: string; paymentId: string }>;
  verifyPayment(paymentId: string): Promise<{ success: boolean; trxId: string; amount: number }>;
}

export const PaymentServiceDefinition: ServiceDefinition<PaymentService> = {
  name: 'payment-gateway',
  description: 'South Asian MFS & Global Payment Gateway Seam',
  interfaceVersion: '1.0.0',
};

export class BkashPaymentProvider implements ServiceProvider<PaymentService> {
  readonly id = 'bkash-tokenized';
  readonly name = 'bKash Tokenized Checkout (Live MFS)';
  readonly version = '1.2.0';
  readonly priority = 10;
  readonly implementation: PaymentService;

  private client: BkashTokenizedPGW;

  constructor(config: BkashConfig) {
    this.client = new BkashTokenizedPGW(config);
    this.implementation = {
      providerName: 'bKash',
      createCheckout: async (params) => {
        const res = await this.client.createPayment({
          amount: params.amountBdt,
          invoiceNumber: params.invoiceId,
          payerReference: params.customerPhone,
        });
        return {
          checkoutUrl: res.bkashURL,
          paymentId: res.paymentID,
        };
      },
      verifyPayment: async (paymentId) => {
        const res = await this.client.executePayment(paymentId);
        return {
          success: res.transactionStatus === 'Completed',
          trxId: res.trxID,
          amount: parseFloat(res.amount || '0'),
        };
      },
    };
  }
}

export class NagadPaymentProvider implements ServiceProvider<PaymentService> {
  readonly id = 'nagad-direct';
  readonly name = 'Nagad Direct PGW';
  readonly version = '0.2.0';
  readonly priority = 8;
  readonly implementation: PaymentService;

  private client: NagadDirectPGW;

  constructor(config: NagadConfig) {
    this.client = new NagadDirectPGW(config);
    this.implementation = {
      providerName: 'Nagad',
      createCheckout: async (params) => {
        const res = await this.client.initializePayment({
          orderId: params.invoiceId,
          amount: params.amountBdt,
          customerMobile: params.customerPhone,
        });
        return {
          checkoutUrl: res.callBackUrl,
          paymentId: res.paymentReferenceId,
        };
      },
      verifyPayment: async (paymentId) => {
        const res = await this.client.verifyPayment(paymentId);
        return {
          success: res.status === 'Success',
          trxId: res.issuerPaymentRefNo || paymentId,
          amount: parseFloat(res.amount || '0'),
        };
      },
    };
  }
}
