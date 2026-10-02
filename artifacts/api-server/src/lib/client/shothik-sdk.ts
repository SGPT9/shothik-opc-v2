/**
 * Shothik Platform Typed Client SDK
 * Production-grade, cross-environment (Node.js / Browser) client for Shothik APIs.
 * Supports typed RPC calls, automatic JSON serialization, Idempotency-Key handling,
 * and comprehensive error diagnostics.
 */

export interface ShothikClientConfig {
  baseUrl?: string;
  token?: string;
  defaultHeaders?: Record<string, string>;
  fetch?: typeof fetch;
}

export class ShothikApiError extends Error {
  public readonly status: number;
  public readonly data: any;
  public readonly url: string;
  public readonly method: string;

  constructor(message: string, status: number, data: any, url: string, method: string) {
    super(message);
    this.name = "ShothikApiError";
    this.status = status;
    this.data = data;
    this.url = url;
    this.method = method;
  }
}

// Model Types matching OpenAPI 3.1.0 Schemas
export interface HealthCheckResponse {
  status: string;
  uptime?: number;
}

export interface LivenessResponse {
  status: string;
  uptimeSeconds: number;
  pid: number;
  timestamp: string;
}

export interface DeepHealthResponse {
  platform: string;
  status: string;
  version: string;
  uptimeSeconds: number;
  memory: {
    heapUsedMb: number;
    heapTotalMb: number;
    rssMb: number;
  };
  subsystems: Record<string, string>;
  timestamp: string;
}

export interface TeaEstateProfile {
  id: string;
  name: string;
  region: string;
  elevationMeters: number;
  annualProductionMetricTons: number;
  primaryGrades: string[];
}

export interface TeaAuctionBidRequest {
  lotId: string;
  estateId: string;
  leafGrade: string;
  totalWeightKg: number;
  currentHighBidBdtPerKg: number;
  newBidBdtPerKg: number;
  bidderName: string;
  bidderBtbLicense: string;
}

export interface TeaAuctionBidResponse {
  success: boolean;
  bid: {
    lotId: string;
    bidAmountBdtPerKg: number;
    clearingPriceBdtPerKg: number;
    bidderName: string;
    timestamp: string;
  };
}

export interface MfsVerificationRequest {
  trxId: string;
  provider: "bkash" | "nagad" | "rocket" | "upay";
  tier: "micro_100_bdt" | "student_350_bdt" | "pro_750_bdt" | "merchant_1500_bdt";
  amountBdt: number;
  userId: string;
  senderMobileNumber: string;
}

export interface MfsVerificationResponse {
  success: boolean;
  trxId: string;
  provider: string;
  status: string;
  message?: string;
  balanceRemainingBdt?: number;
}

export interface SteadfastBookingRequest {
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmount: number;
  note?: string;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  idempotencyKey?: string;
  signal?: AbortSignal;
}

export class ShothikClient {
  private baseUrl: string;
  private token?: string;
  private defaultHeaders: Record<string, string>;
  private fetchFn: typeof fetch;

  constructor(config: ShothikClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? "").replace(/\/+$/, "");
    this.token = config.token;
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.fetchFn = config.fetch ?? (globalThis.fetch ? globalThis.fetch.bind(globalThis) : (fetch as any));
  }

  private async request<T>(
    path: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = path.startsWith("http://") || path.startsWith("https://") 
      ? path 
      : `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...this.defaultHeaders,
      ...options.headers,
    };

    if (this.token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }

    let payload: string | undefined;
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }

    const res = await this.fetchFn(url, {
      method,
      headers,
      body: payload,
      signal: options.signal,
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorMsg =
        (typeof data === "object" && data !== null && (data.error?.message || data.message)) ||
        `HTTP ${res.status} request failed`;
      throw new ShothikApiError(errorMsg, res.status, data, url, method);
    }

    return data as T;
  }

  // --- Sub-Namespaces ---

  public readonly health = {
    get: (options?: RequestOptions): Promise<HealthCheckResponse> => {
      return this.request<HealthCheckResponse>("/health", "GET", undefined, options);
    },
    liveness: (options?: RequestOptions): Promise<LivenessResponse> => {
      return this.request<LivenessResponse>("/health/liveness", "GET", undefined, options);
    },
    readiness: async (options?: RequestOptions): Promise<{ ready: boolean; status: number }> => {
      try {
        const url = `${this.baseUrl}/health/readiness`;
        const res = await this.fetchFn(url, {
          method: "GET",
          headers: { ...this.defaultHeaders, ...options?.headers },
          signal: options?.signal,
        });
        return { ready: res.ok, status: res.status };
      } catch (err: any) {
        return { ready: false, status: 503 };
      }
    },
    deep: (options?: RequestOptions): Promise<DeepHealthResponse> => {
      return this.request<DeepHealthResponse>("/health/deep", "GET", undefined, options);
    },
  };

  public readonly agri = {
    listEstates: (options?: RequestOptions): Promise<{ success: boolean; count: number; estates: TeaEstateProfile[] }> => {
      return this.request<{ success: boolean; count: number; estates: TeaEstateProfile[] }>(
        "/api/v1/agri/tea/estates",
        "GET",
        undefined,
        options
      );
    },
    submitBid: (
      bid: TeaAuctionBidRequest,
      options?: RequestOptions
    ): Promise<TeaAuctionBidResponse> => {
      return this.request<TeaAuctionBidResponse>(
        "/api/v1/agri/tea/auction/bid",
        "POST",
        bid,
        options
      );
    },
  };

  public readonly mfs = {
    verifyTrx: (
      payload: MfsVerificationRequest,
      options?: RequestOptions
    ): Promise<MfsVerificationResponse> => {
      return this.request<MfsVerificationResponse>(
        "/api/v1/mfs/verify-trx",
        "POST",
        payload,
        options
      );
    },
  };

  public readonly logistics = {
    bookSteadfast: (
      parcel: SteadfastBookingRequest,
      options?: RequestOptions
    ): Promise<{ success: boolean; consignmentId?: string; data?: any }> => {
      return this.request<{ success: boolean; consignmentId?: string; data?: any }>(
        "/api/v1/logistics/steadfast/book",
        "POST",
        parcel,
        options
      );
    },
  };

  public readonly academic = {
    scanPlagiarism: (
      payload: { text: string; threshold?: number },
      options?: RequestOptions
    ): Promise<any> => {
      return this.request<any>(
        "/api/academic/plagiarism/scan",
        "POST",
        payload,
        options
      );
    },
  };
}

export function createShothikClient(config?: ShothikClientConfig): ShothikClient {
  return new ShothikClient(config);
}
