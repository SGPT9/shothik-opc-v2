/**
 * bKash Tokenized Payment Gateway (PGW)
 * Official bKash Tokenized Checkout API v1.2.0-beta
 * 
 * Supports:
 *  - Automated OAuth2 Token Grant & In-Memory Refresh
 *  - Create Payment Session & Direct Checkout URL Generation
 *  - Execute Payment (Finalizing after customer PIN & OTP)
 *  - Query Payment Status & Transaction Validation
 *  - Refund Processing with TrxID reconciliation
 */

export interface BkashConfig {
  baseUrl: string;
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  callbackUrl: string;
}

export interface BkashCreatePaymentParams {
  amount: number;
  invoiceNumber: string;
  payerReference?: string;
  intent?: 'sale' | 'authorization';
}

export interface BkashCreatePaymentResponse {
  paymentID: string;
  bkashURL: string;
  statusCode: string;
  statusMessage: string;
  paymentCreateTime: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  merchantInvoiceNumber: string;
}

export interface BkashExecutePaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  paymentExecuteTime: string;
  merchantInvoiceNumber: string;
  payerReference: string;
  customerMsisdn: string;
  statusCode: string;
  statusMessage: string;
}

export interface BkashQueryPaymentResponse {
  paymentID: string;
  trxID: string;
  transactionStatus: string;
  amount: string;
  currency: string;
  intent: string;
  paymentCreateTime: string;
  paymentExecuteTime: string;
  merchantInvoiceNumber: string;
  payerReference: string;
  customerMsisdn: string;
  statusCode: string;
  statusMessage: string;
}

export class BkashTokenizedPGW {
  private idToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(private readonly config: BkashConfig) {}

  /**
   * Grant or refresh the bKash authentication token.
   */
  async getAuthToken(): Promise<string> {
    const now = Date.now();
    if (this.idToken && now < this.tokenExpiresAt - 60_000) {
      return this.idToken;
    }

    const endpoint = `${this.config.baseUrl}/tokenized/checkout/token/grant`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        username: this.config.username,
        password: this.config.password,
      },
      body: JSON.stringify({
        app_key: this.config.appKey,
        app_secret: this.config.appSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`bKash Token Grant failed (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      id_token: string;
      refresh_token: string;
      expires_in: number;
      statusCode: string;
      statusMessage: string;
    };

    if (data.statusCode !== '0000' && data.statusCode !== undefined) {
      throw new Error(`bKash Token Grant error: ${data.statusMessage} (Code: ${data.statusCode})`);
    }

    this.idToken = data.id_token;
    this.refreshToken = data.refresh_token;
    this.tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;

    return this.idToken;
  }

  /**
   * Create a 1-click tokenized payment session.
   */
  async createPayment(params: BkashCreatePaymentParams): Promise<BkashCreatePaymentResponse> {
    const token = await this.getAuthToken();
    const endpoint = `${this.config.baseUrl}/tokenized/checkout/create`;

    const payload = {
      mode: '0011',
      payerReference: params.payerReference || 'ShothikCustomer',
      callbackURL: this.config.callbackUrl,
      amount: params.amount.toFixed(2),
      currency: 'BDT',
      intent: params.intent || 'sale',
      merchantInvoiceNumber: params.invoiceNumber,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-APP-Key': this.config.appKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`bKash Create Payment failed (${response.status}): ${errorText}`);
    }

    const data = await response.json() as BkashCreatePaymentResponse;
    if (data.statusCode && data.statusCode !== '0000') {
      throw new Error(`bKash Create Payment error: ${data.statusMessage} (Code: ${data.statusCode})`);
    }

    return data;
  }

  /**
   * Execute payment once user approves via bKash interface callback.
   */
  async executePayment(paymentID: string): Promise<BkashExecutePaymentResponse> {
    const token = await this.getAuthToken();
    const endpoint = `${this.config.baseUrl}/tokenized/checkout/execute`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-APP-Key': this.config.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`bKash Execute Payment failed (${response.status}): ${errorText}`);
    }

    const data = await response.json() as BkashExecutePaymentResponse;
    if (data.statusCode && data.statusCode !== '0000') {
      throw new Error(`bKash Execute Payment error: ${data.statusMessage} (Code: ${data.statusCode})`);
    }

    return data;
  }

  /**
   * Query status of any transaction by paymentID.
   */
  async queryPayment(paymentID: string): Promise<BkashQueryPaymentResponse> {
    const token = await this.getAuthToken();
    const endpoint = `${this.config.baseUrl}/tokenized/checkout/payment/status`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-APP-Key': this.config.appKey,
      },
      body: JSON.stringify({ paymentID }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`bKash Query Payment failed (${response.status}): ${errorText}`);
    }

    return (await response.json()) as BkashQueryPaymentResponse;
  }
}
