/**
 * Shothik Social Commerce Live-Selling & Comment-to-Order Engine (Slice 33)
 * High-velocity Banglish comment parsing, real-time inventory locking with 15-minute TTL,
 * automated 1-tap bKash checkout link generation, and live stream telemetry.
 */

import { CodIvrEngine } from "../ivr/cod-ivr-engine.js";

export interface LiveSellingSession {
  sessionId: string;
  channel: "facebook_live" | "tiktok_live" | "instagram_live" | "youtube_live";
  sessionTitle: string;
  merchantId: string;
  status: "live" | "paused" | "ended";
  startedAt: string;
  totalCommentsIngested: number;
  ordersCapturedCount: number;
  totalGmvCapturedBdt: number;
  activeViewerCount: number;
  activeSkuLocks: Record<string, number>;
}

export interface LiveCommentParsedOrder {
  commentId: string;
  sessionId: string;
  rawComment: string;
  authorName: string;
  extractedSku?: string;
  productName?: string;
  unitPriceBdt: number;
  extractedQuantity: number;
  extractedSize?: string;
  extractedColor?: string;
  extractedPhone?: string;
  extractedDistrict?: string;
  paymentMethod: "bkash" | "cod" | "nagad" | "unspecified";
  confidenceScore: number;
  status: "order_drafted" | "payment_link_sent" | "confirmed" | "low_confidence_review" | "expired";
  orderId: string;
  checkoutUrl: string;
  totalAmountBdt: number;
  expiresAt: string;
  ingestedAt: string;
}

export interface LiveProductCatalogItem {
  sku: string;
  title: string;
  priceBdt: number;
  stockAvailable: number;
  keywords: string[];
}

const DEFAULT_CATALOG: Record<string, LiveProductCatalogItem> = {
  "SKU-PANJABI-BLK": {
    sku: "SKU-PANJABI-BLK",
    title: "Royal Platinum Silk Panjabi",
    priceBdt: 3500,
    stockAvailable: 150,
    keywords: ["panjabi", "punjabi", "silk", "black", "পাঞ্জাবি", "কালো"],
  },
  "SKU-EARBUDS-TWS": {
    sku: "SKU-EARBUDS-TWS",
    title: "Wireless ANC TWS Earbuds",
    priceBdt: 2400,
    stockAvailable: 200,
    keywords: ["earbuds", "tws", "airpod", "headphone", "ইয়ারবাড", "হেডফোন"],
  },
  "SKU-CHARGER-65W": {
    sku: "SKU-CHARGER-65W",
    title: "65W GaN Fast Charger",
    priceBdt: 1800,
    stockAvailable: 90,
    keywords: ["charger", "gan", "fast charger", "adapter", "চার্জার"],
  },
  "SKU-SAREE-SILK": {
    sku: "SKU-SAREE-SILK",
    title: "Pure Rajshahi Silk Saree",
    priceBdt: 5800,
    stockAvailable: 60,
    keywords: ["saree", "shari", "silk saree", "শাড়ি", "সিল্ক"],
  },
};

const BANGLADESH_DISTRICTS = [
  "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur",
  "Mymensingh", "Comilla", "Gazipur", "Narayanganj", "Bogra", "Cox's Bazar", "Dhanmondi", "Uttara", "Mirpur", "Gulshan", "Banani"
];

export class LiveSellingEngine {
  private static sessions: Map<string, LiveSellingSession> = new Map();
  private static orders: Map<string, LiveCommentParsedOrder> = new Map();
  private static catalog: Map<string, LiveProductCatalogItem> = new Map(Object.entries(DEFAULT_CATALOG));

  static {
    // Seed an active demo live session
    const demoSession: LiveSellingSession = {
      sessionId: "SESSION_LIVE_8829",
      channel: "facebook_live",
      sessionTitle: "Eid Premium Collection Live Flash Sale 🔥",
      merchantId: "merch_shothik_dhaka_01",
      status: "live",
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      totalCommentsIngested: 482,
      ordersCapturedCount: 39,
      totalGmvCapturedBdt: 124500,
      activeViewerCount: 1420,
      activeSkuLocks: {
        "SKU-PANJABI-BLK": 14,
        "SKU-EARBUDS-TWS": 22,
        "SKU-CHARGER-65W": 3,
      },
    };
    this.sessions.set(demoSession.sessionId, demoSession);
  }

  /**
   * Parse a raw live stream comment into an actionable order draft
   */
  static parseComment(
    sessionId: string,
    authorName: string,
    rawComment: string
  ): LiveCommentParsedOrder {
    const commentLower = rawComment.toLowerCase();

    // 1. Extract Phone Number (Bangladeshi 11-digit regex: 013, 014, 015, 016, 017, 018, 019)
    const phoneMatch = rawComment.match(/(?:\+88)?(01[3-9]\d{8})\b/);
    const extractedPhone = phoneMatch ? phoneMatch[1] : undefined;

    // 2. Extract SKU matching keywords
    let matchedSku: string | undefined;
    let matchedProduct: LiveProductCatalogItem | undefined;

    for (const item of this.catalog.values()) {
      if (item.keywords.some((k) => commentLower.includes(k.toLowerCase()))) {
        matchedSku = item.sku;
        matchedProduct = item;
        break;
      }
    }

    if (!matchedProduct) {
      // Default to Panjabi if no specific match
      matchedSku = "SKU-PANJABI-BLK";
      matchedProduct = this.catalog.get("SKU-PANJABI-BLK")!;
    }

    // 3. Extract Quantity
    let quantity = 1;
    const qtyMatch = commentLower.match(/(\d+)\s*(?:ta|pcs|piece|টা|পিস|টি)/i);
    if (qtyMatch && parseInt(qtyMatch[1], 10) > 0) {
      quantity = Math.min(parseInt(qtyMatch[1], 10), 10);
    }

    // 4. Extract Size
    let extractedSize: string | undefined;
    const sizeMatch = commentLower.match(/\b(xxl|xl|l|m|s|38|40|42|44)\b/i);
    if (sizeMatch) {
      extractedSize = sizeMatch[1].toUpperCase();
    }

    // 5. Extract Color
    let extractedColor: string | undefined;
    if (commentLower.includes("black") || commentLower.includes("কালো")) extractedColor = "Black";
    else if (commentLower.includes("white") || commentLower.includes("সাদা")) extractedColor = "White";
    else if (commentLower.includes("blue") || commentLower.includes("নীল")) extractedColor = "Navy Blue";
    else if (commentLower.includes("maroon") || commentLower.includes("মেরুন")) extractedColor = "Maroon";

    // 6. Extract District / Location
    let extractedDistrict: string | undefined;
    for (const dist of BANGLADESH_DISTRICTS) {
      if (commentLower.includes(dist.toLowerCase())) {
        extractedDistrict = dist;
        break;
      }
    }

    // 7. Extract Payment Mode
    let paymentMethod: "bkash" | "cod" | "nagad" | "unspecified" = "unspecified";
    if (commentLower.includes("bkash") || commentLower.includes("বিকাশ")) {
      paymentMethod = "bkash";
    } else if (commentLower.includes("nagad") || commentLower.includes("নগদ")) {
      paymentMethod = "nagad";
    } else if (commentLower.includes("cod") || commentLower.includes("ক্যাশ অন") || commentLower.includes("cash on")) {
      paymentMethod = "cod";
    }

    // Calculate Confidence Score
    let confidenceScore = 0.5;
    if (extractedPhone) confidenceScore += 0.25;
    if (extractedSize || extractedColor) confidenceScore += 0.15;
    if (extractedDistrict) confidenceScore += 0.10;

    confidenceScore = Math.min(confidenceScore, 1.0);

    const unitPrice = matchedProduct.priceBdt;
    const totalAmount = unitPrice * quantity;
    const orderId = `LIVE_ORD_${Date.now().toString(36).toUpperCase()}_${Math.floor(Math.random() * 1000)}`;
    const commentId = `CMT_${Date.now().toString(36).toUpperCase()}_${Math.floor(Math.random() * 1000)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15-minute TTL lock

    // Generate Dynamic 1-Tap bKash Checkout Link
    const checkoutUrl = `https://pay.shothikgpt.com/checkout/live?orderId=${orderId}&amt=${totalAmount}&sku=${matchedSku}&ref=${encodeURIComponent(authorName)}`;

    const status = confidenceScore >= 0.7 ? "payment_link_sent" : "order_drafted";

    const order: LiveCommentParsedOrder = {
      commentId,
      sessionId,
      rawComment,
      authorName,
      extractedSku: matchedSku,
      productName: matchedProduct.title,
      unitPriceBdt: unitPrice,
      extractedQuantity: quantity,
      extractedSize,
      extractedColor,
      extractedPhone,
      extractedDistrict,
      paymentMethod,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      status,
      orderId,
      checkoutUrl,
      totalAmountBdt: totalAmount,
      expiresAt,
      ingestedAt: new Date().toISOString(),
    };

    this.orders.set(order.orderId, order);

    // Update Session Telemetry
    const session = this.sessions.get(sessionId);
    if (session) {
      session.totalCommentsIngested += 1;
      session.ordersCapturedCount += 1;
      session.totalGmvCapturedBdt += totalAmount;
      if (matchedSku) {
        session.activeSkuLocks[matchedSku] = (session.activeSkuLocks[matchedSku] || 0) + quantity;
      }
    }

    return order;
  }

  /**
   * Confirm and finalize payment for a drafted live order
   */
  static confirmOrder(orderId: string): { success: boolean; order?: LiveCommentParsedOrder; message: string } {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: `Order ID ${orderId} not found` };
    }

    if (order.status === "confirmed") {
      return { success: true, order, message: "Order is already confirmed" };
    }

    order.status = "confirmed";

    // Permanently decrement catalog stock
    if (order.extractedSku && this.catalog.has(order.extractedSku)) {
      const catItem = this.catalog.get(order.extractedSku)!;
      catItem.stockAvailable = Math.max(0, catItem.stockAvailable - order.extractedQuantity);
    }

    // Release temporary lock from session
    const session = this.sessions.get(order.sessionId);
    if (session && order.extractedSku && session.activeSkuLocks[order.extractedSku]) {
      session.activeSkuLocks[order.extractedSku] = Math.max(
        0,
        session.activeSkuLocks[order.extractedSku] - order.extractedQuantity
      );
    }

    return { success: true, order, message: "Live order confirmed and stock finalized!" };
  }

  /**
   * Autonomous Auto-Courier Dispatch Pipeline:
   * Assesses RTO Risk, normalizes address, books Steadfast/Pathao consignment with SHA-256 seal.
   */
  static autoDispatchCourierPipeline(
    orderId: string,
    courierProvider: "steadfast" | "pathao" | "redx" | "paperfly" = "steadfast"
  ): { success: boolean; consignment?: any; message: string } {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, message: `Order ID ${orderId} not found` };
    }

    if (!order.extractedPhone) {
      return { success: false, message: "Customer phone number is missing from live order" };
    }

    // Auto-confirm the order
    this.confirmOrder(orderId);

    const consignment = CodIvrEngine.dispatchCourierConsignment(
      {
        orderId: order.orderId,
        customerName: order.authorName,
        customerPhone: order.extractedPhone,
        items: [{
          sku: order.extractedSku || "SKU-GENERIC",
          name: order.productName || "Live Stream Item",
          quantity: order.extractedQuantity,
          unitPrice: order.unitPriceBdt,
        }],
        codAmount: order.totalAmountBdt,
        rawAddress: order.extractedDistrict ? `${order.extractedDistrict}, Bangladesh` : "Dhaka, Bangladesh",
      },
      courierProvider,
      "voice_ivr"
    );

    return {
      success: true,
      consignment,
      message: `Consignment auto-booked with ${courierProvider.toUpperCase()} (${consignment.trackingCode})`,
    };
  }

  /**
   * List active sessions or get specific session
   */
  static getSession(sessionId: string): LiveSellingSession | undefined {
    return this.sessions.get(sessionId);
  }

  static getActiveSession(): LiveSellingSession {
    const active = Array.from(this.sessions.values()).find((s) => s.status === "live");
    if (active) return active;
    return Array.from(this.sessions.values())[0];
  }

  static createSession(params: {
    sessionTitle: string;
    channel: "facebook_live" | "tiktok_live" | "instagram_live" | "youtube_live";
    merchantId: string;
  }): LiveSellingSession {
    const sessionId = `SESSION_LIVE_${Date.now().toString(36).toUpperCase()}`;
    const newSession: LiveSellingSession = {
      sessionId,
      channel: params.channel,
      sessionTitle: params.sessionTitle,
      merchantId: params.merchantId,
      status: "live",
      startedAt: new Date().toISOString(),
      totalCommentsIngested: 0,
      ordersCapturedCount: 0,
      totalGmvCapturedBdt: 0,
      activeViewerCount: 1,
      activeSkuLocks: {},
    };
    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  /**
   * List orders for a session
   */
  static listOrders(sessionId?: string): LiveCommentParsedOrder[] {
    const all = Array.from(this.orders.values());
    if (!sessionId) return all.reverse();
    return all.filter((o) => o.sessionId === sessionId).reverse();
  }

  /**
   * Reset store (for testing)
   */
  static _reset(): void {
    this.sessions.clear();
    this.orders.clear();
  }
}
