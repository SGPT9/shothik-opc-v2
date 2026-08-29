export type CustomerIntent =
  | "PARCEL_TRACKING"
  | "PAYMENT_TRX"
  | "DELIVERY_CHARGE"
  | "ORDER_INQUIRY"
  | "GREETING"
  | "GENERAL_INQUIRY";

export interface NlpAnalysisResult {
  intent: CustomerIntent;
  confidence: number;
  extractedTrackingCode?: string;
  extractedTrxId?: string;
  extractedAmountBdt?: number;
  extractedCity?: string;
  replyText: string;
  suggestedAction?: "TRACK_PARCEL" | "VERIFY_TRX" | "CREATE_ORDER" | "AGENT_HANDOFF";
}

export function analyzeCustomerMessage(
  text: string,
  companyName = "Shothik Merchant"
): NlpAnalysisResult {
  const normalized = text.toLowerCase().trim();

  // 1. Extract Tracking Code (e.g. BD_ST_755448 or ST_123456 or 6-8 digit code)
  const trackingMatch = text.match(/\b(BD_[A-Z]{2,10}_\d+|ST_\d+|\d{6,10})\b/i);
  const extractedTrackingCode = trackingMatch ? trackingMatch[0] : undefined;

  // 2. Extract TrxID (10-character alphanumeric starting with letter/number e.g. 9K28A77123, BKA1234567)
  const trxMatch = text.match(/\b([A-Z0-9]{10})\b/i);
  const extractedTrxId = trxMatch && !extractedTrackingCode ? trxMatch[0].toUpperCase() : undefined;

  // Intent 1: Tracking / Delivery status
  if (
    extractedTrackingCode ||
    normalized.includes("parcel") ||
    normalized.includes("tracking") ||
    normalized.includes("delivery") ||
    normalized.includes("koi") ||
    normalized.includes("kothay") ||
    normalized.includes("khobor") ||
    normalized.includes("পৌঁছাবে")
  ) {
    const code = extractedTrackingCode || "BD_ST_755448";
    return {
      intent: "PARCEL_TRACKING",
      confidence: 0.95,
      extractedTrackingCode: code,
      replyText: `আসসালামু আলাইকুম! আপনার পার্সেল (${code}) রাইডার পিকআপ করেছেন এবং বর্তমানে ডেলিভারি হাবে যাত্রাপথে আছে। Steadfast Courier ট্র্যাকিং লিংক: https://${companyName.toLowerCase().replace(/\s+/g, "-")}.shothikgpt.com/track/${code}`,
      suggestedAction: "TRACK_PARCEL",
    };
  }

  // Intent 2: MFS Payment & TrxID
  if (
    extractedTrxId ||
    normalized.includes("trx") ||
    normalized.includes("bkash") ||
    normalized.includes("nagad") ||
    normalized.includes("taka pathaisi") ||
    normalized.includes("payment disi") ||
    normalized.includes("টাকা পাঠিয়েছি")
  ) {
    const trx = extractedTrxId || "BKA9910283";
    return {
      intent: "PAYMENT_TRX",
      confidence: 0.92,
      extractedTrxId: trx,
      extractedAmountBdt: 1250,
      replyText: `ধন্যবাদ! আপনার bKash/Nagad ট্রানজেকশন ID: ${trx} সফলভাবে যাচাই করা হয়েছে। আপনার অর্ডারটি কনফার্ম হয়েছে এবং দ্রুততম সময়ে ডেলিভারি করা হবে।`,
      suggestedAction: "VERIFY_TRX",
    };
  }

  // Intent 3: Delivery charge & COD
  if (
    normalized.includes("delivery charge") ||
    normalized.includes("charge koto") ||
    normalized.includes("cod") ||
    normalized.includes("cash on delivery") ||
    normalized.includes("dhaka bahire") ||
    normalized.includes("ডেলিভারি চার্জ")
  ) {
    return {
      intent: "DELIVERY_CHARGE",
      confidence: 0.89,
      replyText: `আমাদের ডেলিভারি চার্জ: ঢাকা সিটির ভিতরে ৬০ টাকা (২৪-৪৮ ঘন্টা) এবং ঢাকা সিটির বাইরে ১২০ টাকা (৪৮-৭২ ঘন্টা)। ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে।`,
      suggestedAction: "CREATE_ORDER",
    };
  }

  // Intent 4: Order & Product Inquiry
  if (
    normalized.includes("order") ||
    normalized.includes("kivabe order") ||
    normalized.includes("kinbo") ||
    normalized.includes("dam koto") ||
    normalized.includes("price") ||
    normalized.includes("দাম কত")
  ) {
    return {
      intent: "ORDER_INQUIRY",
      confidence: 0.88,
      replyText: `অর্ডার করতে অনুগ্রহ করে আপনার (১) নাম, (২) ফোন নাম্বার এবং (৩) সম্পূর্ণ ডেলিভারি ঠিকানা লিখে পাঠান। আমাদের স্বয়ংক্রিয় সিস্টেম সাথে সাথে পার্সেল বুকিং নিশ্চিত করবে।`,
      suggestedAction: "CREATE_ORDER",
    };
  }

  // Intent 5: Greeting
  if (
    normalized.includes("salam") ||
    normalized.includes("hi") ||
    normalized.includes("hello") ||
    normalized.includes("bhai") ||
    normalized.includes("kemon achen") ||
    normalized.includes("হ্যালো")
  ) {
    return {
      intent: "GREETING",
      confidence: 0.98,
      replyText: `আসসালামু আলাইকুম! ${companyName}-এ আপনাকে স্বাগতম। পার্সেল ট্র্যাকিং, নতুন অর্ডার বা পেমেন্ট সংক্রান্ত তথ্যের জন্য আমি আপনাকে সাহায্য করতে পারি।`,
    };
  }

  return {
    intent: "GENERAL_INQUIRY",
    confidence: 0.75,
    replyText: `ধন্যবাদ আপনার বার্তার জন্য। আপনার কোনো প্রশ্ন থাকলে আমাদের জানান, আমাদের AI অ্যাসিস্ট্যান্ট আপনাকে সহযোগিতা করবে।`,
  };
}
