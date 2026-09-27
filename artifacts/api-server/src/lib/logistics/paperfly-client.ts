import { logger } from "../logger.js";

export interface PaperflyConfig {
  username?: string;
  password?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface PaperflyNewOrderPayload {
  merOrderRef: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerThana?: string;
  customerDistrict?: string;
  maxWeightKg: number;
  productPrice: number;
  productBrief?: string;
}

export interface PaperflyNewOrderResponse {
  trackingNumber: string;
  status: string;
  message: string;
}

export class PaperflyClient {
  private username: string;
  private password: string;
  private apiKey: string;
  private baseUrl: string;

  constructor(config?: PaperflyConfig) {
    this.username = config?.username || process.env.PAPERFLY_USERNAME || "";
    this.password = config?.password || process.env.PAPERFLY_PASSWORD || "";
    this.apiKey = config?.apiKey || process.env.PAPERFLY_API_KEY || "";
    this.baseUrl = config?.baseUrl || process.env.PAPERFLY_BASE_URL || "https://api.paperfly.com.bd";
  }

  public isConfigured(): boolean {
    return Boolean(this.username && this.password && this.apiKey);
  }

  /**
   * Register a new delivery order with Paperfly
   */
  public async newOrder(payload: PaperflyNewOrderPayload): Promise<PaperflyNewOrderResponse> {
    if (!this.isConfigured()) {
      logger.info({ payload }, "[PaperflyClient] Simulating new order registration in test mode");
      const trackingNumber = `PAP_${Date.now().toString().slice(-6)}_${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        trackingNumber,
        status: "success",
        message: "Order placed successfully (Simulated Test Mode)",
      };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
      const response = await fetch(`${this.baseUrl}/OrderPlacement`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          paperflykey: this.apiKey,
        },
        body: JSON.stringify({
          merOrderRef: payload.merOrderRef,
          packagePrice: payload.productPrice,
          packageWeight: payload.maxWeightKg,
          custName: payload.customerName,
          custAddress: payload.customerAddress,
          custPhone: payload.customerPhone,
          productBrief: payload.productBrief || "Shothik Merchant Consignment",
          destinationThana: payload.customerThana || "Dhanmondi",
          destinationDistrict: payload.customerDistrict || "Dhaka",
        }),
      });

      const data = (await response.json()) as any;
      if (!response.ok || data.response_code !== 200) {
        throw new Error(data.message || `Paperfly API error: HTTP ${response.status}`);
      }

      return {
        trackingNumber: data.tracking_number,
        status: "success",
        message: data.message,
      };
    } catch (error: any) {
      logger.error({ error: error.message }, "[PaperflyClient] newOrder failed");
      throw error;
    }
  }

  /**
   * Track order status on Paperfly
   */
  public async trackOrder(trackingNumber: string): Promise<{ trackingNumber: string; status: string; history: any[] }> {
    if (!this.isConfigured()) {
      return {
        trackingNumber,
        status: "in_transit",
        history: [
          { status: "pickup_assigned", details: "Assigned to Paperfly Hub", time: new Date().toISOString() },
          { status: "in_hub", details: "Received at Central Hub", time: new Date().toISOString() },
        ],
      };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString("base64")}`;
      const response = await fetch(`${this.baseUrl}/Tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          paperflykey: this.apiKey,
        },
        body: JSON.stringify({
          tracking_number: trackingNumber,
        }),
      });

      const data = (await response.json()) as any;
      return {
        trackingNumber,
        status: data.status || "in_transit",
        history: data.timeline || [],
      };
    } catch (error: any) {
      logger.error({ error: error.message }, "[PaperflyClient] trackOrder failed");
      throw error;
    }
  }
}

export const paperflyClient = new PaperflyClient();
