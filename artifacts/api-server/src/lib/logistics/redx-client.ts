import { logger } from "../logger.js";

export interface RedxConfig {
  apiToken?: string;
  baseUrl?: string;
}

export interface RedxCreateParcelPayload {
  customerName: string;
  customerPhone: string;
  deliveryArea: string;
  deliveryAreaId?: number;
  customerAddress: string;
  merchantInvoiceId: string;
  cashCollectionAmount: number;
  parcelWeightGrams: number;
  value?: number;
  instruction?: string;
}

export interface RedxCreateParcelResponse {
  trackingId: string;
  trackingUrl?: string;
  status: string;
  message?: string;
}

export class RedxClient {
  private apiToken: string;
  private baseUrl: string;

  constructor(config?: RedxConfig) {
    this.apiToken = config?.apiToken || process.env.REDX_API_TOKEN || "";
    this.baseUrl = config?.baseUrl || process.env.REDX_BASE_URL || "https://openapi.redx.com.bd/v1.0.0-sandbox";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiToken);
  }

  /**
   * Create parcel order on RedX Logistics
   */
  public async createParcel(payload: RedxCreateParcelPayload): Promise<RedxCreateParcelResponse> {
    if (!this.isConfigured()) {
      logger.info({ payload }, "[RedxClient] Simulating parcel creation in test mode");
      const trackingId = `REDX_${Math.floor(10000000 + Math.random() * 90000000)}`;
      return {
        trackingId,
        trackingUrl: `https://redx.com.bd/track-parcel/?trackingId=${trackingId}`,
        status: "ready_for_pickup",
        message: "Parcel booked successfully (Simulated Test Mode)",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/parcels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify({
          customer_name: payload.customerName,
          customer_phone: payload.customerPhone,
          delivery_area: payload.deliveryArea,
          delivery_area_id: payload.deliveryAreaId,
          customer_address: payload.customerAddress,
          merchant_invoice_id: payload.merchantInvoiceId,
          cash_collection_amount: payload.cashCollectionAmount,
          parcel_weight: payload.parcelWeightGrams,
          value: payload.value || payload.cashCollectionAmount,
          instruction: payload.instruction || "Handle with care - Shothik OPC",
        }),
      });

      const data = (await response.json()) as any;
      if (!response.ok || !data.tracking_id) {
        throw new Error(data.message || `RedX API error: HTTP ${response.status}`);
      }

      return {
        trackingId: data.tracking_id,
        trackingUrl: `https://redx.com.bd/track-parcel/?trackingId=${data.tracking_id}`,
        status: "ready_for_pickup",
        message: data.message,
      };
    } catch (error: any) {
      logger.error({ error: error.message }, "[RedxClient] createParcel failed");
      throw error;
    }
  }

  /**
   * Track parcel status on RedX
   */
  public async trackParcel(trackingId: string): Promise<{ trackingId: string; status: string; history: any[] }> {
    if (!this.isConfigured()) {
      return {
        trackingId,
        status: "in_transit",
        history: [
          { status: "pickup_assigned", message: "Rider assigned for pickup", time: new Date().toISOString() },
          { status: "picked_up", message: "Parcel received at Dhaka Sorting Hub", time: new Date().toISOString() },
        ],
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/parcels/track/${trackingId}`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      });
      const data = (await response.json()) as any;
      return {
        trackingId,
        status: data.status || "in_transit",
        history: data.tracking_history || [],
      };
    } catch (error: any) {
      logger.error({ error: error.message }, "[RedxClient] trackParcel failed");
      throw error;
    }
  }
}

export const redxClient = new RedxClient();
