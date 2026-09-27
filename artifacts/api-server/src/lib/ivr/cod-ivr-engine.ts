import { createHash } from "node:crypto";

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CODOrderInput {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  codAmount: number;
  rawAddress: string;
  dialect?: "dhaka_standard" | "chittagong_regional" | "sylhet_regional" | "english_bangla_hybrid";
  pastDeliverySuccessCount?: number;
  pastDeliveryReturnCount?: number;
}

export interface IVRDialogueStep {
  stepId: string;
  speaker: "agent_ivr" | "customer";
  banglaScript: string;
  banglishScript: string;
  expectedInputType: "dtmf_or_speech";
  dtmfOptions?: Record<string, string>;
}

export interface IVRCallPlan {
  callId: string;
  orderId: string;
  recipientPhone: string;
  voiceGender: "female_bangla_natural" | "male_bangla_natural";
  greetingScript: string;
  banglishScript: string;
  dialogueSteps: IVRDialogueStep[];
  fallbackWhatsAppMessage: string;
  scheduledAt: string;
}

export type RTORiskTier = "LOW" | "MEDIUM" | "HIGH" | "BLOCKED";

export interface RTORiskAssessment {
  riskScore: number; // 0 to 100 (higher = riskier)
  riskTier: RTORiskTier;
  riskFactors: string[];
  recommendation: string;
  requiresPartialAdvancePayment: boolean;
  advanceAmountRequiredBDT: number;
}

export interface ParsedAddress {
  rawAddress: string;
  district: string;
  thana: string;
  area: string;
  roadAndHouse: string;
  postcode: string;
  zoneType: "inside_dhaka" | "sub_dhaka" | "outside_dhaka";
  standardDeliveryChargeBDT: number;
}

export interface CourierConsignment {
  consignmentId: string;
  orderId: string;
  courierProvider: "steadfast" | "pathao" | "redx" | "paperfly";
  trackingCode: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  zone: string;
  codAmountBDT: number;
  deliveryChargeBDT: number;
  status: "draft_prepared" | "booked_ready_for_pickup";
  verificationHashSha256: string;
  createdAt: string;
}

export class CodIvrEngine {
  private static readonly BANGLADESH_DISTRICTS = [
    "Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh",
    "Comilla", "Gazipur", "Narayanganj", "Bogra", "Cox's Bazar", "Jessore", "Feni", "Brahmanbaria",
    "Tangail", "Dinajpur", "Pabna", "Noakhali", "Kushtia", "Faridpur", "Jamalpur"
  ];

  private static readonly DHAKA_THANAS = [
    "Mirpur", "Dhanmondi", "Gulshan", "Banani", "Uttara", "Mohammadpur", "Motijheel", "Badda",
    "Rampura", "Khilgaon", "Malibagh", "Bashundhara", "Lalbagh", "Tejgaon", "Pallabi", "Jatrabari"
  ];

  private static readonly SUB_DHAKA_AREAS = [
    "Savar", "Gazipur", "Narayanganj", "Keraniganj", "Tongi", "Dhamrai", "Ashulia"
  ];

  /**
   * AC-1: Generate Banglish/Bangla Voice IVR Call Script & Interactive Dialogue Matrix
   */
  public static generateIVRCallPlan(order: CODOrderInput): IVRCallPlan {
    const callId = `IVR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const dialect = order.dialect || "dhaka_standard";
    const itemListStr = order.items.map(i => `${i.quantity}x ${i.name}`).join(", ");

    let greetingBangla = "";
    let greetingBanglish = "";

    if (dialect === "chittagong_regional") {
      greetingBangla = `আসসালামু আলাইকুম ${order.customerName} ভাই/আপু, আপনার ${itemListStr} এর ${order.codAmount} টাকার ক্যাশ অন ডেলিভারি অর্ডারটি নিশ্চিত করতে কল করেছি।`;
      greetingBanglish = `Assalamu Alaikum ${order.customerName}, apnar ${itemListStr} er ${order.codAmount} tk COD order ta confirm korar jonno call koresi.`;
    } else {
      greetingBangla = `আসসালামু আলাইকুম ${order.customerName}, আপনার ${itemListStr} এর মোট ৳${order.codAmount} টাকার ক্যাশ অন ডেলিভারি অর্ডারটি কনফার্ম করতে কল করা হয়েছে।`;
      greetingBanglish = `Assalamu Alaikum ${order.customerName}, apnar ${itemListStr} er total ${order.codAmount} taka Cash on Delivery order confirm korar jonno call kora hoyese.`;
    }

    const steps: IVRDialogueStep[] = [
      {
        stepId: "step_confirmation",
        speaker: "agent_ivr",
        banglaScript: "অর্ডার নিশ্চিত করতে ১ চাপুন, ঠিকানা পরিবর্তন করতে ২ চাপুন, অথবা অর্ডার বাতিল করতে ৩ চাপুন।",
        banglishScript: "Order confirm korte 1 chapun, address change korte 2 chapun, othoba order cancel korte 3 chapun.",
        expectedInputType: "dtmf_or_speech",
        dtmfOptions: {
          "1": "CONFIRM_ORDER",
          "2": "CHANGE_ADDRESS",
          "3": "CANCEL_ORDER"
        }
      },
      {
        stepId: "step_delivery_time",
        speaker: "agent_ivr",
        banglaScript: "আগামী ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি রাইডার আপনার সাথে যোগাযোগ করবেন। অনুগ্রহ করে নগদ টাকা প্রস্তুত রাখবেন। ধন্যবাদ।",
        banglishScript: "Next 24 theke 48 hours er moddhe rider apnar sathe jogajog korbe. Please cash ready rakhben. Dhonnobad.",
        expectedInputType: "dtmf_or_speech"
      }
    ];

    const fallbackWhatsAppMessage = `Assalamu Alaikum ${order.customerName}! 🛍️\nApnar Order ID: #${order.orderId} (${itemListStr}) - Total COD: ৳${order.codAmount} confirm korte reply korun:\n\n✅ 1 - Confirm Order\n✏️ 2 - Change Address\n❌ 3 - Cancel Order\n\nDelivery Address: ${order.rawAddress}`;

    return {
      callId,
      orderId: order.orderId,
      recipientPhone: order.customerPhone,
      voiceGender: "female_bangla_natural",
      greetingScript: greetingBangla,
      banglishScript: greetingBanglish,
      dialogueSteps: steps,
      fallbackWhatsAppMessage,
      scheduledAt: new Date().toISOString()
    };
  }

  /**
   * AC-2: Return-to-Origin (RTO) Risk & Delivery Fraud Detection Engine
   */
  public static assessRTORisk(order: CODOrderInput): RTORiskAssessment {
    let score = 10;
    const factors: string[] = [];

    // 1. Phone number format validation (BD regex: +8801[3-9]\d{8} or 01[3-9]\d{8})
    const cleanPhone = order.customerPhone.replace(/[\s\-]/g, "");
    const bdPhoneRegex = /^(?:\+?880|0)?1[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      score += 40;
      factors.push("Invalid or non-standard Bangladeshi phone number format");
    }

    // 2. Address completeness check
    if (!order.rawAddress || order.rawAddress.trim().length < 12) {
      score += 30;
      factors.push("Extremely short or vague delivery address");
    } else {
      const hasThanaOrDistrict = this.BANGLADESH_DISTRICTS.some(d =>
        new RegExp(d, "i").test(order.rawAddress)
      ) || this.DHAKA_THANAS.some(t =>
        new RegExp(t, "i").test(order.rawAddress)
      );

      if (!hasThanaOrDistrict) {
        score += 20;
        factors.push("Missing recognized District or Thana in address");
      }
    }

    // 3. High COD Value Risk
    if (order.codAmount > 5000) {
      score += 25;
      factors.push(`High COD value of ৳${order.codAmount} increases rejection loss exposure`);
    } else if (order.codAmount > 2500) {
      score += 10;
      factors.push(`Moderate COD value (৳${order.codAmount})`);
    }

    // 4. Past delivery history track record
    const successes = order.pastDeliverySuccessCount || 0;
    const returns = order.pastDeliveryReturnCount || 0;
    const totalPast = successes + returns;

    if (totalPast > 0) {
      const returnRatio = returns / totalPast;
      if (returnRatio > 0.5) {
        score += 35;
        factors.push(`High historical return rate (${(returnRatio * 100).toFixed(0)}% RTO across ${totalPast} past orders)`);
      } else if (returnRatio === 0 && successes >= 3) {
        score = Math.max(0, score - 20);
        factors.push(`Trusted buyer history (${successes} successful deliveries)`);
      }
    }

    const finalScore = Math.min(100, Math.max(0, score));

    let riskTier: RTORiskTier = "LOW";
    let recommendation = "Safe to dispatch immediately upon voice IVR confirmation.";
    let requiresPartialAdvance = false;
    let advanceAmount = 0;

    if (finalScore >= 80) {
      riskTier = "BLOCKED";
      recommendation = "High fraud likelihood. Block automated courier dispatch until manual agent review.";
      requiresPartialAdvance = true;
      advanceAmount = 200;
    } else if (finalScore >= 50) {
      riskTier = "HIGH";
      recommendation = "High RTO risk. Require partial advance delivery charge (৳150) via bKash/Nagad prior to dispatch.";
      requiresPartialAdvance = true;
      advanceAmount = 150;
    } else if (finalScore >= 25) {
      riskTier = "MEDIUM";
      recommendation = "Medium risk. Automated Voice IVR call verification required before generating courier consignment.";
    }

    return {
      riskScore: finalScore,
      riskTier,
      riskFactors: factors.length > 0 ? factors : ["Clean profile, verified phone and recognizable address"],
      recommendation,
      requiresPartialAdvancePayment: requiresPartialAdvance,
      advanceAmountRequiredBDT: advanceAmount
    };
  }

  /**
   * AC-3: Hyperlocal Address Parser & District/Thana Resolution Engine
   */
  public static parseAddress(rawAddress: string): ParsedAddress {
    const text = rawAddress.trim();
    let detectedDistrict = "Dhaka";
    let detectedThana = "";
    let detectedArea = "";
    let postcode = "1200";

    // 1. Detect District
    for (const dist of this.BANGLADESH_DISTRICTS) {
      const regex = new RegExp(`\\b${dist}\\b`, "i");
      if (regex.test(text)) {
        detectedDistrict = dist;
        break;
      }
    }

    // 2. Detect Thana (if in Dhaka or other)
    for (const thana of this.DHAKA_THANAS) {
      const regex = new RegExp(`\\b${thana}\\b`, "i");
      if (regex.test(text)) {
        detectedThana = thana;
        break;
      }
    }

    // 3. Postcode search (4 digits in BD)
    const pcMatch = text.match(/\b(1\d{3}|2\d{3}|3\d{3}|4\d{3}|5\d{3}|6\d{3}|7\d{3}|8\d{3}|9\d{3})\b/);
    if (pcMatch) {
      postcode = pcMatch[1];
    }

    // 4. Zone classification
    let zoneType: "inside_dhaka" | "sub_dhaka" | "outside_dhaka" = "outside_dhaka";
    let deliveryCharge = 130;

    const isSubDhaka = this.SUB_DHAKA_AREAS.some(area => new RegExp(`\\b${area}\\b`, "i").test(text));

    if (detectedDistrict.toLowerCase() === "dhaka" && !isSubDhaka) {
      zoneType = "inside_dhaka";
      deliveryCharge = 70;
    } else if (isSubDhaka) {
      zoneType = "sub_dhaka";
      deliveryCharge = 100;
    } else {
      zoneType = "outside_dhaka";
      deliveryCharge = 130;
    }

    return {
      rawAddress: text,
      district: detectedDistrict,
      thana: detectedThana || "General",
      area: detectedThana ? `${detectedThana} Area` : "Standard Area",
      roadAndHouse: text,
      postcode,
      zoneType,
      standardDeliveryChargeBDT: deliveryCharge
    };
  }

  /**
   * AC-4: Automated Courier Consignment Dispatch & Cryptographic Verification Audit
   */
  public static dispatchCourierConsignment(
    order: CODOrderInput,
    courierProvider: "steadfast" | "pathao" | "redx" | "paperfly" = "steadfast",
    confirmedBy: "voice_ivr" | "whatsapp_otp" | "manual_admin" = "voice_ivr"
  ): CourierConsignment {
    const parsedAddress = this.parseAddress(order.rawAddress);
    const consignmentId = `CNG-${courierProvider.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const trackingCode = `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const sealPayload = JSON.stringify({
      consignmentId,
      orderId: order.orderId,
      customerPhone: order.customerPhone,
      codAmountBDT: order.codAmount,
      courierProvider,
      confirmedBy,
      zone: parsedAddress.zoneType,
      timestamp: new Date().toISOString()
    });

    const verificationHashSha256 = createHash("sha256").update(sealPayload).digest("hex");

    return {
      consignmentId,
      orderId: order.orderId,
      courierProvider,
      trackingCode,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: `${parsedAddress.roadAndHouse}, ${parsedAddress.thana}, ${parsedAddress.district}`,
      zone: parsedAddress.zoneType,
      codAmountBDT: order.codAmount,
      deliveryChargeBDT: parsedAddress.standardDeliveryChargeBDT,
      status: "booked_ready_for_pickup",
      verificationHashSha256,
      createdAt: new Date().toISOString()
    };
  }
}
