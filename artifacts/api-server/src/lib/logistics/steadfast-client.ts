import { logger } from "../logger";

export interface SteadfastConfig {
  apiKey?: string;
  secretKey?: string;
  baseUrl?: string;
}

export interface SteadfastCreateOrderPayload {
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
  consignment?: {
    consignment_id: number | string;
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

export class SteadfastClient {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(config?: SteadfastConfig) {
    this.apiKey = config?.apiKey || process.env.STEADFAST_API_KEY || "";
    this.secretKey = config?.secretKey || process.env.STEADFAST_SECRET_KEY || "";
    this.baseUrl = config?.baseUrl || process.env.STEADFAST_BASE_URL || "https://portal.steadfast.com.bd/api/v1";
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.secretKey);
  }

  /**
   * Create a parcel delivery order with Steadfast Courier
   */
  public async createOrder(payload: SteadfastCreateOrderPayload): Promise<SteadfastCreateOrderResponse> {
    if (!this.isConfigured()) {
      logger.info({ payload }, "[SteadfastClient] Simulating order creation in test mode");
      const trackingCode = `BD_ST_${Math.floor(100000 + Math.random() * 900000)}`;
      const consignmentId = `CN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      return {
        status: 200,
        message: "Order placed successfully (Simulated / Test Mode)",
        consignment: {
          consignment_id: consignmentId,
          invoice: payload.invoice,
          tracking_code: trackingCode,
          recipient_name: payload.recipientName,
          recipient_phone: payload.recipientPhone,
          recipient_address: payload.recipientAddress,
          cod_amount: payload.codAmount,
          status: "in_review",
          created_at: new Date().toISOString(),
        },
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/create_order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": this.apiKey,
          "Secret-Key": this.secretKey,
        },
        body: JSON.stringify({
          invoice: payload.invoice,
          recipient_name: payload.recipientName,
          recipient_phone: payload.recipientPhone,
          recipient_address: payload.recipientAddress,
          cod_amount: payload.codAmount,
          note: payload.note || "Nilkhet Print-On-Demand Book Delivery",
        }),
      });

      const data = await response.json();
      if (!response.ok || data.status !== 200) {
        throw new Error(data.message || `Steadfast API error: HTTP ${response.status}`);
      }

      return data as SteadfastCreateOrderResponse;
    } catch (error: any) {
      logger.error({ error: error.message }, "[SteadfastClient] createOrder failed");
      throw error;
    }
  }

  /**
   * Track status by tracking code
   */
  public async checkStatus(trackingCode: string): Promise<any> {
    if (!this.isConfigured()) {
      return {
        status: 200,
        delivery_status: "in_transit",
        tracking_code: trackingCode,
        message: "Simulated courier tracking status",
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`, {
        method: "GET",
        headers: {
          "Api-Key": this.apiKey,
          "Secret-Key": this.secretKey,
        },
      });

      return await response.json();
    } catch (error: any) {
      logger.error({ error: error.message }, "[SteadfastClient] checkStatus failed");
      throw error;
    }
  }

  /**
   * Check account balance
   */
  public async getCurrentBalance(): Promise<{ status: number; current_balance: number }> {
    if (!this.isConfigured()) {
      return { status: 200, current_balance: 14500 };
    }

    const response = await fetch(`${this.baseUrl}/get_balance`, {
      headers: {
        "Api-Key": this.apiKey,
        "Secret-Key": this.secretKey,
      },
    });

    return await response.json();
  }
}

export const steadfastClient = new SteadfastClient();
