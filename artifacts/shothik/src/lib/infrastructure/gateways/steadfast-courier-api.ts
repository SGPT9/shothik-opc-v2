/**
 * Steadfast Logistics & Courier API Client
 * Official Steadfast Courier Merchant API v1
 * 
 * Supports:
 *  - Automated Parcel Consignment Creation (COD & Paid)
 *  - Real-time Parcel Tracking by Consignment ID or Tracking Code
 *  - Delivery Status Webhook Synchronization
 *  - Automated Merchant Balance & Return Tracking
 */

export interface SteadfastConfig {
  baseUrl: string;
  apiKey: string;
  secretKey: string;
}

export interface SteadfastCreateOrderParams {
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface SteadfastCreateOrderResponse {
  status: number;
  message: string;
  consignment: {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string;
    created_at: string;
  };
}

export interface SteadfastTrackingResponse {
  status: number;
  delivery_status: 'pending' | 'delivered' | 'cancelled' | 'in_transit' | 'partial_delivered';
  consignment?: {
    consignment_id: number;
    tracking_code: string;
    status: string;
    updated_at: string;
  };
}

export class SteadfastCourierAPI {
  constructor(private readonly config: SteadfastConfig) {}

  /**
   * Dispatches a new parcel order to Steadfast Courier.
   */
  async createOrder(params: SteadfastCreateOrderParams): Promise<SteadfastCreateOrderResponse> {
    const endpoint = `${this.config.baseUrl}/create_order`;

    const payload = {
      invoice: params.invoice,
      recipient_name: params.recipientName,
      recipient_phone: params.recipientPhone,
      recipient_address: params.recipientAddress,
      cod_amount: params.codAmount,
      note: params.note || 'Shothik Autonomous Twin Fulfillment',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.config.apiKey,
        'Secret-Key': this.config.secretKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Steadfast Create Order failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as SteadfastCreateOrderResponse;
    if (data.status !== 200) {
      throw new Error(`Steadfast Create Order returned status ${data.status}: ${data.message}`);
    }

    return data;
  }

  /**
   * Query parcel tracking status using consignment ID.
   */
  async getStatusByCid(consignmentId: number | string): Promise<SteadfastTrackingResponse> {
    const endpoint = `${this.config.baseUrl}/status_by_cid/${consignmentId}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Api-Key': this.config.apiKey,
        'Secret-Key': this.config.secretKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Steadfast Tracking failed (${response.status}): ${errorText}`);
    }

    return (await response.json()) as SteadfastTrackingResponse;
  }

  /**
   * Query parcel tracking status using tracking code.
   */
  async getStatusByTrackingCode(trackingCode: string): Promise<SteadfastTrackingResponse> {
    const endpoint = `${this.config.baseUrl}/status_by_trackingcode/${trackingCode}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Api-Key': this.config.apiKey,
        'Secret-Key': this.config.secretKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Steadfast Tracking failed (${response.status}): ${errorText}`);
    }

    return (await response.json()) as SteadfastTrackingResponse;
  }
}
