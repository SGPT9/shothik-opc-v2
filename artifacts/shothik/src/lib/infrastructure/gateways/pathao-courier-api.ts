/**
 * Pathao Logistics & Courier API Client
 * Official Pathao Merchant API v1
 * 
 * Supports:
 *  - OAuth2 Client Credentials Authentication
 *  - Dynamic Store ID selection & City/Zone Resolution
 *  - Parcel Booking with COD and Special Instructions
 *  - Real-time Order Tracking & State Updates
 */

export interface PathaoConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId?: number;
}

export interface PathaoCreateOrderParams {
  storeId?: number;
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  recipientCityId: number;
  recipientZoneId: number;
  amountToCollect: number;
  itemQuantity?: number;
  itemWeight?: number; // In KG
  itemDescription?: string;
  specialInstruction?: string;
}

export interface PathaoCreateOrderResponse {
  type: string;
  message: string;
  data: {
    consignment_id: string;
    merchant_order_id: string;
    order_status: string;
    delivery_fee: number;
  };
}

export interface PathaoTrackingResponse {
  type: string;
  data: {
    consignment_id: string;
    order_status: string;
    order_status_slug: string;
    updated_at: string;
  };
}

export class PathaoCourierAPI {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly config: PathaoConfig) {}

  /**
   * Fetch or refresh the Pathao OAuth2 bearer token.
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.accessToken && now < this.tokenExpiresAt - 60_000) {
      return this.accessToken;
    }

    const endpoint = `${this.config.baseUrl}/aladdin/api/v1/issue-token`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        username: this.config.username,
        password: this.config.password,
        grant_type: 'password',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pathao Token Issue failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
      token_type: string;
    };

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

    return this.accessToken;
  }

  /**
   * Creates a parcel delivery order on Pathao.
   */
  async createOrder(params: PathaoCreateOrderParams): Promise<PathaoCreateOrderResponse> {
    const token = await this.getAccessToken();
    const endpoint = `${this.config.baseUrl}/aladdin/api/v1/orders`;

    const payload = {
      store_id: params.storeId || this.config.storeId || 1,
      merchant_order_id: params.merchantOrderId,
      recipient_name: params.recipientName,
      recipient_phone: params.recipientPhone,
      recipient_address: params.recipientAddress,
      recipient_city: params.recipientCityId,
      recipient_zone: params.recipientZoneId,
      delivery_type: 48, // Standard 48-hour delivery
      item_type: 2, // Parcel
      item_quantity: params.itemQuantity || 1,
      item_weight: params.itemWeight || 0.5,
      amount_to_collect: params.amountToCollect,
      item_description: params.itemDescription || 'Shothik Autopilot Merchant Order',
      special_instruction: params.specialInstruction || 'Handle with care',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pathao Create Order failed (${response.status}): ${errorText}`);
    }

    return (await response.json()) as PathaoCreateOrderResponse;
  }

  /**
   * Query parcel tracking information using Pathao consignment ID.
   */
  async getOrderInfo(consignmentId: string): Promise<PathaoTrackingResponse> {
    const token = await this.getAccessToken();
    const endpoint = `${this.config.baseUrl}/aladdin/api/v1/orders/${consignmentId}/info`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pathao Order Info failed (${response.status}): ${errorText}`);
    }

    return (await response.json()) as PathaoTrackingResponse;
  }
}
