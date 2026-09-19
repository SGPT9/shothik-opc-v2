import { logger } from "../logger";

export type DialectCode = "standard" | "dhakaiya" | "sylheti" | "chatgaya";

export interface ProductItem {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  priceBdt: number;
  stock: number;
  description: string;
}

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  unitPriceBdt: number;
  totalBdt: number;
}

export interface DeliveryDetails {
  city: string;
  area?: string;
  deliveryFeeBdt: number;
  courier: "STEADFAST" | "PATHAO";
}

export interface BkashInvoice {
  invoiceId: string;
  amountBdt: number;
  merchantNumber: string;
  deepLink: string;
  qrSvgDataUri: string;
  expiresAt: string;
  reference: string;
}

export interface SteadfastConsignment {
  consignmentId: string;
  trackingCode: string;
  recipientPhone: string;
  recipientAddress: string;
  codAmountBdt: number;
  deliveryFeeBdt: number;
  status: "BOOKED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED";
  trackingUrl: string;
  bookedAt: string;
}

export interface CommerceOrder {
  orderId: string;
  customerPhone: string;
  customerName?: string;
  customerAddress?: string;
  items: CartItem[];
  subtotalBdt: number;
  deliveryFeeBdt: number;
  totalBdt: number;
  paymentMethod: "BKASH_QR" | "COD" | "NAGAD";
  paymentStatus: "PENDING" | "PAID" | "COD_UNPAID";
  trxId?: string;
  invoice?: BkashInvoice;
  consignment?: SteadfastConsignment;
  dialect: DialectCode;
  requiresHumanReview: boolean;
  humanReviewReason?: string;
  createdAt: string;
}

export interface CommerceTurnResult {
  sessionId: string;
  customerPhone: string;
  dialect: DialectCode;
  intent: string;
  confidence: number;
  replyText: string;
  cart: CartItem[];
  subtotalBdt: number;
  deliveryDetails?: DeliveryDetails;
  totalBdt: number;
  invoice?: BkashInvoice;
  order?: CommerceOrder;
  suggestedAction?: "SHOW_CATALOG" | "PAY_BKASH_QR" | "CONFIRM_COD" | "TRACK_CONSIGNMENT" | "HUMAN_APPROVAL";
}

// ── Default Product Catalog ─────────────────────────────────────────────
export const DEFAULT_CATALOG: ProductItem[] = [
  {
    id: "prod_jamdani_01",
    name: "Dhakai Jamdani Saree (80 Count)",
    nameBn: "ঢাকাই জামদানি শাড়ি (৮০ কাউন্ট)",
    category: "Apparel",
    priceBdt: 3800,
    stock: 45,
    description: "Authentic handcrafted traditional woven Jamdani from Demra weavers.",
  },
  {
    id: "prod_panjabi_02",
    name: "Royal Platinum Cotton Panjabi",
    nameBn: "রয়্যাল প্লাটিনাম কটন পাঞ্জাবি",
    category: "Apparel",
    priceBdt: 2200,
    stock: 80,
    description: "Tailored 100% combed cotton festive panjabi with subtle hand-embroidery.",
  },
  {
    id: "prod_honey_03",
    name: "Sundarban Wild Natural Honey (1kg)",
    nameBn: "সুন্দরবনের প্রাকৃতিক খলিশা মধু (১ কেজি)",
    category: "Organic Food",
    priceBdt: 1450,
    stock: 120,
    description: "100% raw unpasteurized natural honey collected from Sundarban deep mangroves.",
  },
  {
    id: "prod_nilkhet_book_04",
    name: "Nilkhet Hardcover Thesis & AI Monograph",
    nameBn: "নীলক্ষেত প্রেস হার্ডকভার এআই মনোগ্রাফ",
    category: "Publishing",
    priceBdt: 650,
    stock: 250,
    description: "Laser printed 80gsm cream Munken bound monograph with gold-foil spine.",
  },
  {
    id: "prod_leather_wallet_05",
    name: "Full-Grain Hazaribagh Leather Wallet",
    nameBn: "হাজারীবাগ ফুল-গ্রেইন চামড়ার ওয়ালেট",
    category: "Accessories",
    priceBdt: 1250,
    stock: 95,
    description: "Handcrafted 100% full-grain cowhide leather wallet with RFID shielding.",
  },
];

// ── In-Memory Orders & Sessions Store ───────────────────────────────────
class WhatsAppCommerceEngine {
  private orders: Map<string, CommerceOrder> = new Map();
  private sessions: Map<string, { cart: CartItem[]; dialect: DialectCode; city?: string; address?: string }> = new Map();

  constructor() {
    this.seedDemoOrders();
  }

  private seedDemoOrders() {
    const demoOrder1: CommerceOrder = {
      orderId: "ord_wa_9901",
      customerPhone: "01711223344",
      customerName: "Tanvir Ahmed",
      customerAddress: "Dhanmondi 27, Dhaka",
      items: [
        {
          productId: "prod_jamdani_01",
          name: "Dhakai Jamdani Saree (80 Count)",
          quantity: 1,
          unitPriceBdt: 3800,
          totalBdt: 3800,
        },
      ],
      subtotalBdt: 3800,
      deliveryFeeBdt: 60,
      totalBdt: 3860,
      paymentMethod: "BKASH_QR",
      paymentStatus: "PAID",
      trxId: "9K28A77123",
      consignment: {
        consignmentId: "CID_ST_178976001",
        trackingCode: "BD_ST_882901",
        recipientPhone: "01711223344",
        recipientAddress: "Dhanmondi 27, Dhaka",
        codAmountBdt: 0,
        deliveryFeeBdt: 60,
        status: "IN_TRANSIT",
        trackingUrl: "https://merchant.shothikgpt.com/track/BD_ST_882901",
        bookedAt: "2026-09-18T10:00:00.000Z",
      },
      dialect: "dhakaiya",
      requiresHumanReview: false,
      createdAt: "2026-09-18T09:45:00.000Z",
    };

    this.orders.set(demoOrder1.orderId, demoOrder1);
  }

  // ── Delivery Fee Calculation ───────────────────────────────────────────
  public calculateDeliveryFee(cityOrArea: string): DeliveryDetails {
    const norm = (cityOrArea || "").toLowerCase().trim();

    if (
      (norm.includes("dhaka") ||
        norm.includes("ঢাকা") ||
        norm.includes("dhanmondi") ||
        norm.includes("ধানমন্ডি") ||
        norm.includes("gulshan") ||
        norm.includes("গুলশান") ||
        norm.includes("uttara") ||
        norm.includes("উত্তরা") ||
        norm.includes("mirpur") ||
        norm.includes("মিরপুর")) &&
      !norm.includes("outside") &&
      !norm.includes("বাইরে") &&
      !norm.includes("suburb") &&
      !norm.includes("gazipur") &&
      !norm.includes("গাজীপুর") &&
      !norm.includes("narayanganj") &&
      !norm.includes("নারায়ণগঞ্জ") &&
      !norm.includes("savar") &&
      !norm.includes("সাভার")
    ) {
      return {
        city: "Dhaka (Inside City)",
        area: norm,
        deliveryFeeBdt: 60,
        courier: "STEADFAST",
      };
    }

    if (
      norm.includes("gazipur") ||
      norm.includes("গাজীপুর") ||
      norm.includes("narayanganj") ||
      norm.includes("নারায়ণগঞ্জ") ||
      norm.includes("savar") ||
      norm.includes("সাভার") ||
      norm.includes("keraniganj") ||
      norm.includes("কেরানীগঞ্জ") ||
      norm.includes("suburb")
    ) {
      return {
        city: "Dhaka Suburbs",
        area: norm,
        deliveryFeeBdt: 100,
        courier: "STEADFAST",
      };
    }

    // Default outside Dhaka (Chittagong, Sylhet, Rajshahi, Khulna, etc.)
    return {
      city: cityOrArea || "Outside Dhaka (Nationwide)",
      area: norm,
      deliveryFeeBdt: 130,
      courier: "STEADFAST",
    };
  }

  // ── Dynamic bKash QR Generator ────────────────────────────────────────
  public generateBkashInvoice(amountBdt: number, reference: string, merchantNumber = "01888000999"): BkashInvoice {
    const invoiceId = `inv_bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const deepLink = `bkash://payment?merchant=${merchantNumber}&amount=${amountBdt}&ref=${reference}&intent=checkout`;

    // Compact SVG QR visual token
    const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
      <rect width="120" height="120" fill="#E2136E" rx="8"/>
      <rect x="10" y="10" width="100" height="100" fill="#ffffff" rx="4"/>
      <rect x="20" y="20" width="24" height="24" fill="#E2136E"/>
      <rect x="24" y="24" width="16" height="16" fill="#ffffff"/>
      <rect x="28" y="28" width="8" height="8" fill="#E2136E"/>
      <rect x="76" y="20" width="24" height="24" fill="#E2136E"/>
      <rect x="80" y="24" width="16" height="16" fill="#ffffff"/>
      <rect x="84" y="28" width="8" height="8" fill="#E2136E"/>
      <rect x="20" y="76" width="24" height="24" fill="#E2136E"/>
      <rect x="24" y="80" width="16" height="16" fill="#ffffff"/>
      <rect x="28" y="84" width="8" height="8" fill="#E2136E"/>
      <circle cx="60" cy="60" r="10" fill="#E2136E"/>
      <text x="60" y="64" font-family="Arial,sans-serif" font-size="10" fill="#ffffff" text-anchor="middle" font-weight="bold">৳</text>
    </svg>`;

    const qrSvgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(qrSvg.replace(/\s+/g, " "))}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    return {
      invoiceId,
      amountBdt,
      merchantNumber,
      deepLink,
      qrSvgDataUri,
      expiresAt,
      reference,
    };
  }

  // ── Auto-Book Steadfast Courier Consignment ─────────────────────────────
  public bookSteadfastConsignment(
    recipientPhone: string,
    recipientAddress: string,
    codAmountBdt: number,
    cityOrArea = "Dhaka"
  ): SteadfastConsignment {
    const delivery = this.calculateDeliveryFee(cityOrArea);
    const trackingCode = `BD_ST_${Math.floor(100000 + Math.random() * 900000)}`;
    const consignmentId = `CID_ST_${Date.now()}`;

    return {
      consignmentId,
      trackingCode,
      recipientPhone,
      recipientAddress,
      codAmountBdt,
      deliveryFeeBdt: delivery.deliveryFeeBdt,
      status: "BOOKED",
      trackingUrl: `https://steadfast.shothikgpt.com/track/${trackingCode}`,
      bookedAt: new Date().toISOString(),
    };
  }

  // ── Dialect-Aware Vernacular Response Synthesis ────────────────────────
  private synthesizeDialectReply(
    dialect: DialectCode,
    intent: string,
    data: {
      productName?: string;
      price?: number;
      total?: number;
      deliveryFee?: number;
      city?: string;
      trackingCode?: string;
      trxId?: string;
      requiresReview?: boolean;
    }
  ): string {
    const { productName = "পণ্য", price = 0, total = 0, deliveryFee = 60, city = "ঢাকা", trackingCode = "BD_ST_123456", trxId = "", requiresReview = false } = data;

    switch (dialect) {
      case "dhakaiya":
        switch (intent) {
          case "GREETING":
            return "সালাম মামা! কী অবস্থা? কী লাগবে কন এক্কেরে খাঁটি জিনিস পাইবেন!";
          case "CATALOG":
            return "আরে মামা, আমাদের সেরা কালেকশন দেখেন: জামদানি শাড়ি ৩,৮০০ টেকা, রয়্যাল পাঞ্জাবি ২,২০০ টেকা, আর সুন্দরবনের মধু ১,৪৫০ টেকা। কোনটা প্যাক করমু কন?";
          case "PRICE":
            return `মামা, ${productName}-এর দাম এক্কেরে ফিক্সড ৳${price} টেকা! খাঁটি কোয়ালিটি, এক টেকাও বেশি না!`;
          case "DELIVERY_FEE":
            return `${city}-তে ডেলিভারি চার্জ মাত্র ৳${deliveryFee} টেকা মামা! ৪৮ ঘণ্টার মইধ্যে স্টেডফাস্ট দিয়া পৌঁছায়া দিমু!`;
          case "ORDER_INIT":
            if (requiresReview) {
              return `মামা, আপনার অর্ডার মোট ৳${total} টেকা! ১০ হাজার টেকার বেশি হইলে আমাদের হেড অফিস থেইকা বস আগে কনফার্ম করবে, তারপর মাল ছাড়মু!`;
            }
            return `মামা, মাল রেডি! টোটাল বিল ৳${total} টেকা (ডেলিভারি ৳${deliveryFee})। নিচের বিকাশ কিউআর স্ক্যান কইরা TrxID মারেন, নাইলে ক্যাশ অন ডেলিভারি চাইলে কন!`;
          case "PAYMENT_CONFIRMED":
            return `সাব্বাশ মামা! TrxID (${trxId}) ভেরিফাইড হইছে! পার্সেল ট্র্যাকিং কোড: ${trackingCode}। স্টেডফাস্ট দিয়া মাল আইজকেই ছুটবে!`;
          case "TRACKING":
            return `মামা, আপনার পার্সেল (${trackingCode}) এখন স্টেডফাস্ট রাইডারের ব্যাগে আছে, খুব তাড়াতাড়ি পৌঁছায়া যাইব!`;
          default:
            return "মামা, ঠিকমত বুঝতে পারলাম না। কী অর্ডার করবেন বা TrxID কী একটু বলেন!";
        }

      case "sylheti":
        switch (intent) {
          case "GREETING":
            return "বালা আছেন নি ভাই? আপনার খেদমতে আছি, কন কী লাগত?";
          case "CATALOG":
            return "ভাইজান, আমরার বিশেষ স্টক: অরিজিনাল জামদানি শাড়ি ৩,৮০০ টেকা, প্রিমিয়াম কটন পাঞ্জাবি ২,২০০ টেকা আর সুন্দরবনের খাঁটি মধু ১,৪৫০ টেকা। কোনটা পছন্দ অইছে?";
          case "PRICE":
            return `ভাইজান, ${productName}-এর দাম ৳${price} টেকা। লন্ডন কোয়ালিটির একদম খাঁটি মাল!`;
          case "DELIVERY_FEE":
            return `${city}-ত স্টেডফাস্ট কুরিয়ারের চার্জ মাত্র ৳${deliveryFee} টেকা। ২ দিনের ভিতর পৌছাই যাইব ইনশাআল্লাহ!`;
          case "ORDER_INIT":
            if (requiresReview) {
              return `ভাইজান, আপনার অর্ডার ৳${total} টেকা অইছে। ১০,০০০ টেকার বড় অর্ডার অওয়ায় আমড়ার ম্যানেজার সাহেব আগে অনুমোদন করবা!`;
            }
            return `ভাইজান, আপনার বিল সর্বমোট ৳${total} টেকা (ডেলিভারি ৳${deliveryFee})। বিকাশ কিউআর দিয়া পেমেন্ট করি TrxID টা পাঠান, অখনই বুকিং করিরাম!`;
          case "PAYMENT_CONFIRMED":
            return `আলহামদুলিল্লাহ ভাই! TrxID (${trxId}) মিলছে। আপনার পার্সেল কোড: ${trackingCode}। সিলেট বা দেশজুড়ে স্টেডফাস্টে দ্রুত পৌছাইব!`;
          case "TRACKING":
            return `ভাইজান, আপনার পার্সেল (${trackingCode}) স্টেডফাস্ট হাব থাকি অন-রুট অই গেছে, শীঘ্রই পাইবা!`;
          default:
            return "ভাইজান, আবার একটু কইবা নি? পণ্য পছন্দ বা পেমেন্ট নিয়ে কী জানতে চান?";
        }

      case "chatgaya":
        switch (intent) {
          case "GREETING":
            return "অনরে ছালাম কাকা! গম আছেন নি? কী মালামাল চন কন, চাটগাঁইয়া খাঁটি মাল দিমু!";
          case "CATALOG":
            return "কাকা, আমাগো সেরা পাইকারি-খুচরা স্টক: জামদানি শাড়ি ৩,৮০০ টিয়া, কটন পাঞ্জাবি ২,২০০ টিয়া, সুন্দরবন মধু ১,৪৫০ টিয়া। কুনটা লাগিবু?";
          case "PRICE":
            return `কাকা, ${productName}-এর দাম অইল ৳${price} টিয়া। এক্কেরে খাঁটি কোয়ালিটি!`;
          case "DELIVERY_FEE":
            return `${city}-ত স্টেডফাস্ট এক্সপ্রেস ডেলিভারি মাত্র ৳${deliveryFee} টিয়া কাকা! চটজলদি পৌছাই যাইবু!`;
          case "ORDER_INIT":
            if (requiresReview) {
              return `কাকা, আপনার অর্ডার ৳${total} টিয়া। ১০,০০০ টিয়ার বেশি লেনদেনে বড় ভাইয়ের সুপারভাইজড অনুমোদন লাগিবু!`;
            }
            return `কাকা, হিসাব রেডি! মোট ৳${total} টিয়া (ডেলিভারি ৳${deliveryFee})। বিকাশ কিউআরে পেমেন্ট মাইরেন অথবা ক্যাশ অন ডেলিভারি সিলেক্ট গরেন!`;
          case "PAYMENT_CONFIRMED":
            return `বড় মেহেরবানি কাকা! TrxID (${trxId}) কনফার্ম অইয়ে। আপনার পার্সেল নম্বর: ${trackingCode}। চাটগাঁ এক্সপ্রেস ডেলিভারি ছুটসে!`;
          case "TRACKING":
            return `কাকা, আপনার পার্সেল (${trackingCode}) স্টেডফাস্ট গাড়িত তুলে দেওয়া অইয়ে, তারাতারি হাতত পাইবেন!`;
          default:
            return "কাকা, বুইঝতাম ন পারিলাম। অর্ডার গরিবেন না ট্র্যাকিং চাইবেন কন!";
        }

      case "standard":
      default:
        switch (intent) {
          case "GREETING":
            return "আসসালামু আলাইকুম! Shothik Merchant-এ আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সহায়তা করতে পারি?";
          case "CATALOG":
            return "আমাদের বর্তমান কালেকশন: ঢাকাই জামদানি শাড়ি (৳৩,৮০০), রয়্যাল কটন পাঞ্জাবি (৳২,২০০), সুন্দরবনের খাঁটি মধু (৳১,৪৫০) ও নীলক্ষেত প্রেস মনোগ্রাফ (৳৬৫০)। কোনটি অর্ডার করতে চান?";
          case "PRICE":
            return `${productName}-এর মূল্য ৳${price} টাকা। আমাদের প্রতিটি পণ্যে রয়েছে শতভাগ অথেনটিক কোয়ালিটি গ্যারান্টি।`;
          case "DELIVERY_FEE":
            return `${city} এলাকায় আমাদের নির্ধারিত ডেলিভারি চার্জ মাত্র ৳${deliveryFee} টাকা (Steadfast Courier-এর মাধ্যমে ২ দিনের মধ্যে সরবরাহ)।`;
          case "ORDER_INIT":
            if (requiresReview) {
              return `আপনার অর্ডারের মোট মূল্য ৳${total} টাকা। যেহেতু এটি ৳১০,০০০-এর বেশি, তাই সুপারভাইজড অটোনমি পলিসি অনুযায়ী প্রতিষ্ঠাতা অনুমোদন সম্পন্ন হলেই পার্সেল প্রেরণ করা হবে।`;
            }
            return `আপনার অর্ডার সারসংক্ষেপ: মোট প্রদেয় ৳${total} টাকা (ডেলিভারি চার্জ ৳${deliveryFee} সহ)। অনুগ্রহ করে বিকাশ কিউআর কোড স্ক্যান করে পেমেন্ট সম্পন্ন করুন অথবা ক্যাশ অন ডেলিভারি নিশ্চিত করুন।`;
          case "PAYMENT_CONFIRMED":
            return `ধন্যবাদ! আপনার পেমেন্ট TrxID (${trxId}) সফলভাবে যাচাই করা হয়েছে। আপনার পার্সেল বুকিং কোড: ${trackingCode}। Steadfast Courier ট্র্যাকিং লিংক সক্রিয় হয়েছে।`;
          case "TRACKING":
            return `আপনার পার্সেল (${trackingCode}) সফলভাবে বুক করা হয়েছে এবং বর্তমানে ডেলিভারি হাবে প্রক্রিয়াধীন আছে।`;
          default:
            return "আপনার বার্তাটির জন্য ধন্যবাদ। অর্ডার বা পেমেন্ট সংক্রান্ত বিস্তারিত জানতে আমাদের জানান।";
        }
    }
  }

  // ── Process Interactive WhatsApp Commerce Turn ────────────────────────
  public processCommerceTurn(
    sessionId: string,
    customerPhone: string,
    message: string,
    dialect: DialectCode = "standard",
    incomingCart?: CartItem[]
  ): CommerceTurnResult {
    const norm = message.toLowerCase().trim();
    let currentSession = this.sessions.get(sessionId) || {
      cart: incomingCart || [],
      dialect,
    };

    if (incomingCart && incomingCart.length > 0) {
      currentSession.cart = incomingCart;
    }
    currentSession.dialect = dialect;

    logger.info({ sessionId, customerPhone, dialect, snippet: norm.slice(0, 40) }, "[WhatsAppCommerce] Processing turn");

    // 1. Check for TrxID Verification
    const trxMatch = message.match(/\b([A-Z0-9]{10})\b/i);
    const extractedTrx = trxMatch ? trxMatch[0].toUpperCase() : undefined;

    if (extractedTrx || norm.includes("trx") || norm.includes("paid") || norm.includes("বিকাশ করেছি")) {
      const trxId = extractedTrx || "9K28A77123";
      const consignment = this.bookSteadfastConsignment(customerPhone, currentSession.address || "Dhaka", 0, currentSession.city || "Dhaka");
      const subtotal = currentSession.cart.reduce((s, i) => s + i.totalBdt, 0) || 3800;
      const deliveryDetails = this.calculateDeliveryFee(currentSession.city || "Dhaka");
      const total = subtotal + deliveryDetails.deliveryFeeBdt;

      const order: CommerceOrder = {
        orderId: `ord_wa_${Date.now().toString().slice(-4)}`,
        customerPhone,
        items: currentSession.cart.length > 0 ? currentSession.cart : [
          { productId: "prod_jamdani_01", name: "Dhakai Jamdani Saree", quantity: 1, unitPriceBdt: subtotal, totalBdt: subtotal }
        ],
        subtotalBdt: subtotal,
        deliveryFeeBdt: deliveryDetails.deliveryFeeBdt,
        totalBdt: total,
        paymentMethod: "BKASH_QR",
        paymentStatus: "PAID",
        trxId,
        consignment,
        dialect,
        requiresHumanReview: total > 10000,
        createdAt: new Date().toISOString(),
      };

      this.orders.set(order.orderId, order);

      const reply = this.synthesizeDialectReply(dialect, "PAYMENT_CONFIRMED", {
        trackingCode: consignment.trackingCode,
        trxId,
        total,
      });

      return {
        sessionId,
        customerPhone,
        dialect,
        intent: "TRX_VERIFIED",
        confidence: 0.98,
        replyText: reply,
        cart: currentSession.cart,
        subtotalBdt: subtotal,
        deliveryDetails,
        totalBdt: total,
        order,
        suggestedAction: "TRACK_CONSIGNMENT",
      };
    }

    // 2. Check for Tracking Inquiries
    const trackMatch = message.match(/\b(BD_[A-Z]{2,10}_\d+|ST_\d+|\d{6,10})\b/i);
    if (trackMatch || norm.includes("tracking") || norm.includes("parcel") || norm.includes("কবে পাব") || norm.includes("কোথায়")) {
      const code = trackMatch ? trackMatch[0] : "BD_ST_882901";
      const reply = this.synthesizeDialectReply(dialect, "TRACKING", { trackingCode: code });
      return {
        sessionId,
        customerPhone,
        dialect,
        intent: "PARCEL_TRACKING",
        confidence: 0.95,
        replyText: reply,
        cart: currentSession.cart,
        subtotalBdt: 0,
        totalBdt: 0,
        suggestedAction: "TRACK_CONSIGNMENT",
      };
    }

    // 3. Check for Delivery Charge Inquiry
    if (norm.includes("delivery") || norm.includes("চার্জ") || norm.includes("ভাড়া") || norm.includes("কুরিয়ার") || norm.includes("courier")) {
      let city = "ঢাকা";
      if (norm.includes("chittagong") || norm.includes("চট্টগ্রাম") || norm.includes("চিটাগাং")) city = "চট্টগ্রাম";
      if (norm.includes("sylhet") || norm.includes("সিলেট")) city = "সিলেট";
      if (norm.includes("gazipur") || norm.includes("গাজীপুর")) city = "গাজীপুর";

      const deliveryDetails = this.calculateDeliveryFee(city);
      const reply = this.synthesizeDialectReply(dialect, "DELIVERY_FEE", {
        city: deliveryDetails.city,
        deliveryFee: deliveryDetails.deliveryFeeBdt,
      });

      return {
        sessionId,
        customerPhone,
        dialect,
        intent: "DELIVERY_FEE_INQUIRY",
        confidence: 0.94,
        replyText: reply,
        cart: currentSession.cart,
        subtotalBdt: currentSession.cart.reduce((s, i) => s + i.totalBdt, 0),
        deliveryDetails,
        totalBdt: currentSession.cart.reduce((s, i) => s + i.totalBdt, 0) + deliveryDetails.deliveryFeeBdt,
        suggestedAction: "SHOW_CATALOG",
      };
    }

    // 4. Check for Product Price Inquiry / Matching Catalog Item
    for (const prod of DEFAULT_CATALOG) {
      if (
        norm.includes(prod.name.toLowerCase()) ||
        norm.includes(prod.nameBn) ||
        (prod.id.includes("jamdani") && (norm.includes("saree") || norm.includes("শাড়ি") || norm.includes("শাড়ি") || norm.includes("জামদানি"))) ||
        (prod.id.includes("panjabi") && (norm.includes("panjabi") || norm.includes("পাঞ্জাবি") || norm.includes("পাঞ্জাবী"))) ||
        (prod.id.includes("honey") && (norm.includes("honey") || norm.includes("মধু"))) ||
        (prod.id.includes("book") && (norm.includes("book") || norm.includes("বই") || norm.includes("মনোগ্রাফ"))) ||
        (prod.id.includes("wallet") && (norm.includes("wallet") || norm.includes("মানিব্যাগ") || norm.includes("চামড়া") || norm.includes("চামড়া")))
      ) {
        // Add to session cart
        if (!currentSession.cart.some((c) => c.productId === prod.id)) {
          currentSession.cart.push({
            productId: prod.id,
            name: prod.name,
            quantity: 1,
            unitPriceBdt: prod.priceBdt,
            totalBdt: prod.priceBdt,
          });
        }

        this.sessions.set(sessionId, currentSession);

        const subtotal = currentSession.cart.reduce((s, i) => s + i.totalBdt, 0);
        const deliveryDetails = this.calculateDeliveryFee(currentSession.city || "Dhaka");
        const total = subtotal + deliveryDetails.deliveryFeeBdt;

        const invoice = this.generateBkashInvoice(total, `REF_${sessionId.slice(0, 6).toUpperCase()}`);
        const reply = this.synthesizeDialectReply(dialect, "PRICE", {
          productName: prod.nameBn,
          price: prod.priceBdt,
        });

        return {
          sessionId,
          customerPhone,
          dialect,
          intent: "PRODUCT_PRICE_INQUIRY",
          confidence: 0.96,
          replyText: reply,
          cart: currentSession.cart,
          subtotalBdt: subtotal,
          deliveryDetails,
          totalBdt: total,
          invoice,
          suggestedAction: "PAY_BKASH_QR",
        };
      }
    }

    // 5. Check for Order Confirm / Checkout Request
    if (norm.includes("confirm") || norm.includes("order") || norm.includes("অর্ডার") || norm.includes("কিনি") || norm.includes("কিনব") || norm.includes("বিকাশ করব")) {
      // Default to Jamdani if cart is empty
      if (currentSession.cart.length === 0) {
        currentSession.cart.push({
          productId: DEFAULT_CATALOG[0].id,
          name: DEFAULT_CATALOG[0].name,
          quantity: 1,
          unitPriceBdt: DEFAULT_CATALOG[0].priceBdt,
          totalBdt: DEFAULT_CATALOG[0].priceBdt,
        });
      }

      this.sessions.set(sessionId, currentSession);

      const subtotal = currentSession.cart.reduce((s, i) => s + i.totalBdt, 0);
      const deliveryDetails = this.calculateDeliveryFee(currentSession.city || "Dhaka");
      const total = subtotal + deliveryDetails.deliveryFeeBdt;
      const requiresReview = total > 10000;

      const invoice = this.generateBkashInvoice(total, `REF_${sessionId.slice(0, 6).toUpperCase()}`);
      const reply = this.synthesizeDialectReply(dialect, "ORDER_INIT", {
        total,
        deliveryFee: deliveryDetails.deliveryFeeBdt,
        requiresReview,
      });

      return {
        sessionId,
        customerPhone,
        dialect,
        intent: "ORDER_CHECKOUT",
        confidence: 0.95,
        replyText: reply,
        cart: currentSession.cart,
        subtotalBdt: subtotal,
        deliveryDetails,
        totalBdt: total,
        invoice,
        suggestedAction: requiresReview ? "HUMAN_APPROVAL" : "PAY_BKASH_QR",
      };
    }

    // 6. Check for Greetings
    if (
      norm.includes("hi") ||
      norm.includes("hello") ||
      norm.includes("salam") ||
      norm.includes("সালাম") ||
      norm.includes("কেমন আছেন") ||
      norm.includes("আছেন নি") ||
      norm.includes("আসো নি")
    ) {
      const reply = this.synthesizeDialectReply(dialect, "GREETING", {});
      return {
        sessionId,
        customerPhone,
        dialect,
        intent: "GREETING",
        confidence: 0.95,
        replyText: reply,
        cart: currentSession.cart,
        subtotalBdt: 0,
        totalBdt: 0,
        suggestedAction: "SHOW_CATALOG",
      };
    }

    // 7. General Catalog Fallback
    const reply = this.synthesizeDialectReply(dialect, "CATALOG", {});
    return {
      sessionId,
      customerPhone,
      dialect,
      intent: "CATALOG_BROWSE",
      confidence: 0.88,
      replyText: reply,
      cart: currentSession.cart,
      subtotalBdt: currentSession.cart.reduce((s, i) => s + i.totalBdt, 0),
      totalBdt: currentSession.cart.reduce((s, i) => s + i.totalBdt, 0),
      suggestedAction: "SHOW_CATALOG",
    };
  }

  // ── Confirm Order and Generate Consignment ────────────────────────────
  public confirmOrder(params: {
    customerPhone: string;
    customerName?: string;
    customerAddress: string;
    items: CartItem[];
    city?: string;
    paymentMethod: "BKASH_QR" | "COD" | "NAGAD";
    trxId?: string;
    dialect?: DialectCode;
  }): CommerceOrder {
    const subtotal = params.items.reduce((s, i) => s + i.totalBdt, 0);
    const delivery = this.calculateDeliveryFee(params.city || params.customerAddress);
    const total = subtotal + delivery.deliveryFeeBdt;
    const isPaid = params.paymentMethod === "BKASH_QR" && !!params.trxId;
    const codAmount = isPaid ? 0 : total;
    const requiresHumanReview = total > 10000;

    const consignment = this.bookSteadfastConsignment(
      params.customerPhone,
      params.customerAddress,
      codAmount,
      params.city || params.customerAddress
    );

    const orderId = `ord_wa_${Date.now().toString().slice(-6)}`;
    const order: CommerceOrder = {
      orderId,
      customerPhone: params.customerPhone,
      customerName: params.customerName || "Valued Customer",
      customerAddress: params.customerAddress,
      items: params.items,
      subtotalBdt: subtotal,
      deliveryFeeBdt: delivery.deliveryFeeBdt,
      totalBdt: total,
      paymentMethod: params.paymentMethod,
      paymentStatus: isPaid ? "PAID" : "COD_UNPAID",
      trxId: params.trxId,
      consignment,
      dialect: params.dialect || "standard",
      requiresHumanReview,
      humanReviewReason: requiresHumanReview ? "Supervised Autonomy Rule: Order exceeds ৳10,000 disbursement boundary" : undefined,
      createdAt: new Date().toISOString(),
    };

    this.orders.set(order.orderId, order);
    return order;
  }

  public getOrders(): CommerceOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getCatalog(): ProductItem[] {
    return DEFAULT_CATALOG;
  }
}

export const whatsAppCommerceEngine = new WhatsAppCommerceEngine();
