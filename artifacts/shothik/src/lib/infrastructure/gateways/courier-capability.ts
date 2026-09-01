/**
 * Courier Logistics Capability Seam Definition & Providers
 * Follows DSH 3-Role Capability Seam Architecture (Definition, Provider, Consumer)
 */

import type { ServiceDefinition, ServiceProvider } from '../../harness/capability-seam';
import { SteadfastCourierAPI, type SteadfastConfig } from './steadfast-courier-api';
import { PathaoCourierAPI, type PathaoConfig } from './pathao-courier-api';

export interface CourierService {
  readonly providerName: string;
  bookDelivery(params: {
    invoiceNumber: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    codAmount: number;
    city?: string;
  }): Promise<{
    trackingCode: string;
    consignmentId: string;
    status: string;
  }>;
  trackParcel(trackingCodeOrCid: string): Promise<{
    status: string;
    isDelivered: boolean;
  }>;
}

export const CourierServiceDefinition: ServiceDefinition<CourierService> = {
  name: 'courier-logistics',
  description: 'Steadfast & Pathao Courier Logistics Seam',
  interfaceVersion: '1.0.0',
};

export class SteadfastCourierProvider implements ServiceProvider<CourierService> {
  readonly id = 'steadfast-courier';
  readonly name = 'Steadfast Logistics (Priority Provider)';
  readonly version = '1.0.0';
  readonly priority = 10;
  readonly implementation: CourierService;

  private client: SteadfastCourierAPI;

  constructor(config: SteadfastConfig) {
    this.client = new SteadfastCourierAPI(config);
    this.implementation = {
      providerName: 'Steadfast',
      bookDelivery: async (params) => {
        const res = await this.client.createOrder({
          invoice: params.invoiceNumber,
          recipientName: params.recipientName,
          recipientPhone: params.recipientPhone,
          recipientAddress: params.recipientAddress,
          codAmount: params.codAmount,
        });
        return {
          trackingCode: res.consignment.tracking_code,
          consignmentId: String(res.consignment.consignment_id),
          status: res.consignment.status,
        };
      },
      trackParcel: async (identifier) => {
        const res = await this.client.getStatusByTrackingCode(identifier);
        return {
          status: res.delivery_status,
          isDelivered: res.delivery_status === 'delivered',
        };
      },
    };
  }
}

export class PathaoCourierProvider implements ServiceProvider<CourierService> {
  readonly id = 'pathao-courier';
  readonly name = 'Pathao Merchant Logistics';
  readonly version = '1.0.0';
  readonly priority = 8;
  readonly implementation: CourierService;

  private client: PathaoCourierAPI;

  constructor(config: PathaoConfig) {
    this.client = new PathaoCourierAPI(config);
    this.implementation = {
      providerName: 'Pathao',
      bookDelivery: async (params) => {
        const res = await this.client.createOrder({
          merchantOrderId: params.invoiceNumber,
          recipientName: params.recipientName,
          recipientPhone: params.recipientPhone,
          recipientAddress: params.recipientAddress,
          recipientCityId: 1, // Default Dhaka
          recipientZoneId: 1,
          amountToCollect: params.codAmount,
        });
        return {
          trackingCode: res.data.consignment_id,
          consignmentId: res.data.consignment_id,
          status: res.data.order_status,
        };
      },
      trackParcel: async (identifier) => {
        const res = await this.client.getOrderInfo(identifier);
        return {
          status: res.data.order_status,
          isDelivered: res.data.order_status === 'Delivered',
        };
      },
    };
  }
}
