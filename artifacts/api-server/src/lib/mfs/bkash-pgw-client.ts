import logger from "../logger.js";

export interface BkashConfig {
  appKey?: string;
  appSecret?: string;
  username?: string;
  password?: string;
  baseUrl?: string;
}

export interface BkashCreatePaymentRequest {
  mode: string;
  payerReference: string;
  callbackURL: string;
  amount: string;
  currency: string;
  intent: "sale" | "authorization";
  merchantInvoiceNumber: string;
}

export interface BkashCreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  customerMsisdn?: string;
  amount: string;
  intent: string;
  paymentCreateTime: string;
  transactionStatus: "Initiated" | "Completed" | "Failed";
  statusCode: string;
  statusMessage: string;
}

export interface BkashExecutePaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: "Completed" | "Failed";
  amount: string;
  currency: string;
  intent: string;
  paymentExecuteTime: string;
  statusCode: string;
  statusMessage: string;
}

export class BkashPgwClient {
  private appKey: string;
  private appSecret: string;
  private username: string;
  private password: string;
  private baseUrl: string;
  private idToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config?: BkashConfig) {
    this.appKey = config?.appKey || process.env.BKASH_MERCHANT_KEY || process.env.BKASH_APP_KEY || "";
    this.appSecret = config?.appSecret || process.env.BKASH_MERCHANT_SECRET || process.env.BKASH_APP_SECRET || "";
    this.username = config?.username || process.env.BKASH_USERNAME || "";
    this.password = config?.password || process.env.BKASH_PASSWORD || "";
    this.baseUrl = config?.baseUrl || process.env.BKASH_BASE_URL || "https://tokenized.pay.bka.sh/v1.2.0-beta";
  }

  public isLiveConfigured(): boolean {
    return Boolean(
      this.appKey &&
      this.appKey !== "false" &&
      this.appKey !== "placeholder" &&
      this.appSecret &&
      this.appSecret !== "false"
    );
  }

  /**
   * Acquire or refresh bKash JWT Grant Token
   */
  public async getGrantToken(): Promise<string> {
    if (this.idToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.idToken;
    }

    if (!this.isLiveConfigured()) {
      this.idToken = "mock_bkash_id_token_speculative";
      this.tokenExpiresAt = Date.now() + 3600000;
      return this.idToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/tokenized/checkout/token/grant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: this.username,
          password: this.password,
        },
        body: JSON.stringify({
          app_key: this.appKey,
          app_secret: this.appSecret,
        }),
      });

      if (!response.ok) {
        throw new Error(`bKash Grant Token HTTP ${response.status}`);
      }

      const data: any = await response.json();
      if (data.id_token) {
        this.idToken = data.id_token;
        this.tokenExpiresAt = Date.now() + (parseInt(data.expires_in, 10) || 3600) * 1000;
        return this.idToken as string;
      }
      throw new Error(`bKash token grant failed: ${data.statusMessage || "Unknown"}`);
    } catch (err: any) {
      logger.error({ error: err.message }, "[bkash-pgw] Grant token error");
      // Fallback for offline testing
      this.idToken = "mock_bkash_fallback_token";
      return this.idToken;
    }
  }

  /**
   * Create Checkout Payment Session
   */
  public async createPayment(req: BkashCreatePaymentRequest): Promise<BkashCreatePaymentResponse> {
    const token = await this.getGrantToken();

    if (!this.isLiveConfigured()) {
      const mockPaymentId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      return {
        paymentID: mockPaymentId,
        bkashURL: `https://sandbox.payment.bka.sh/checkout/${mockPaymentId}`,
        amount: req.amount,
        intent: req.intent,
        paymentCreateTime: new Date().toISOString(),
        transactionStatus: "Initiated",
        statusCode: "0000",
        statusMessage: "Successful (Sandbox Speculative)",
      };
    }

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-APP-Key": this.appKey,
      },
      body: JSON.stringify(req),
    });

    return (await response.json()) as BkashCreatePaymentResponse;
  }

  /**
   * Execute Payment after customer OTP/PIN entry
   */
  public async executePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
    const token = await this.getGrantToken();

    if (!this.isLiveConfigured()) {
      return {
        paymentID,
        trxID: `TRX${Date.now().toString().slice(-7)}BK`,
        transactionStatus: "Completed",
        amount: "550",
        currency: "BDT",
        intent: "sale",
        paymentExecuteTime: new Date().toISOString(),
        statusCode: "0000",
        statusMessage: "Successful (Sandbox Speculative)",
      };
    }

    const response = await fetch(`${this.baseUrl}/tokenized/checkout/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "X-APP-Key": this.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    return (await response.json()) as BkashExecutePaymentResponse;
  }
}

export const bkashPgwClient = new BkashPgwClient();
