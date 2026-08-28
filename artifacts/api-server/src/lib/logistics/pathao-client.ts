import { logger } from "../logger";

export interface PathaoConfig {
  clientId?: string;
  clientSecret?: string;
  username?: string;
  password?: string;
  baseUrl?: string;
}

export interface PathaoCreateOrderPayload {
  storeId: number | string;
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCity: number;
  recipientZone: number;
  amountToCollect: number;
  itemQuantity?: number;
  itemWeight?: number;
  itemDescription?: string;
  specialInstruction?: string;
}

export interface PathaoCreateOrderResponse {
  type: string;
  message: string;
  data?: {
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee: number;
    amount_to_collect: number;
  };
}

export class PathaoClient {
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config?: PathaoConfig) {
    this.clientId = config?.clientId || process.env.PATHAO_CLIENT_ID || "";
    this.clientSecret = config?.clientSecret || process.env.PATHAO_CLIENT_SECRET || "";
    this.username = config?.username || process.env.PATHAO_USERNAME || "";
    this.password = config?.password || process.env.PATHAO_PASSWORD || "";
    this.baseUrl = config?.baseUrl || process.env.PATHAO_BASE_URL || "https://api-hermes.pathao.com";
  }

  public isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.username && this.password);
  }

  /**
   * OAuth 2.0 Access Token exchange
   */
  public async getAccessToken(): Promise<string> {
    if (!this.isConfigured()) {
      return "simulated_pathao_bearer_token";
    }

    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/aladdin/api/v1/issue-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          username: this.username,
          password: this.password,
          grant_type: "password",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.access_token) {
        throw new Error(data.message || `Pathao OAuth error: HTTP ${response.status}`);
      }

      this.accessToken = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      return this.accessToken as string;
    } catch (error: any) {
      logger.error({ error: error.message }, "[PathaoClient] getAccessToken failed");
      throw error;
    }
  }

  /**
   * Create parcel order on Pathao Logistics
   */
  public async createOrder(payload: PathaoCreateOrderPayload): Promise<PathaoCreateOrderResponse> {
    if (!this.isConfigured()) {
      logger.info({ payload }, "[PathaoClient] Simulating order creation in test mode");
      const consignmentId = `PTH_CN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        type: "success",
        message: "Order placed successfully (Simulated / Test Mode)",
        data: {
          consignment_id: consignmentId,
          merchant_order_id: payload.merchantOrderId,
          order_status: "Pending",
          delivery_fee: 100,
          amount_to_collect: payload.amountToCollect,
        },
      };
    }

    const token = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}/aladdin/api/v1/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        store_id: payload.storeId,
        merchant_order_id: payload.merchantOrderId,
        recipient_name: payload.recipientName,
        recipient_phone: payload.recipientPhone,
        recipient_address: payload.recipientAddress,
        recipient_city: payload.recipientCity,
        recipient_zone: payload.recipientZone,
        delivery_type: 48, // Standard 48-hour delivery
        item_type: 2, // Book / Document
        special_instruction: payload.specialInstruction || "Nilkhet Print Book Delivery",
        item_quantity: payload.itemQuantity || 1,
        item_weight: payload.itemWeight || 0.5,
        amount_to_collect: payload.amountToCollect,
        item_description: payload.itemDescription || "Shothik AI Book Manuscript",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Pathao API error: HTTP ${response.status}`);
    }

    return data as PathaoCreateOrderResponse;
  }
}

export const pathaoClient = new PathaoClient();
