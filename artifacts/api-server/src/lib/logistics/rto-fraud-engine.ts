import { createHash } from "node:crypto";

/**
 * Shothik Autonomous Steadfast & Pathao RTO Prediction, Delivery Success Scoring
 * & Fraud Blacklist Sync Engine (Slice 77)
 */

export type FraudCategory =
  | "FAKE_ORDER"
  | "PHONE_SWITCHED_OFF"
  | "REFUSED_ON_ARRIVAL"
  | "HARASSMENT"
  | "DAMAGED_RETURN_FRAUD";

export interface FraudReport {
  reportId: string;
  phone: string;
  phoneHash: string;
  category: FraudCategory;
  reporterMerchant: string;
  orderRef?: string;
  notes?: string;
  reportedAt: string;
}

export interface CarrierDeliveryHistory {
  carrier: "steadfast" | "pathao" | "redx" | "paperfly";
  carrierName: string;
  totalOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  cancelledOrders: number;
  successRatePercent: number;
}

export type RTORiskTier =
  | "TIER_VERIFIED_LOW"
  | "TIER_MODERATE"
  | "TIER_HIGH_RISK"
  | "TIER_CRITICAL_BLOCKED";

export interface AdvancePolicy {
  requiresAdvance: boolean;
  recommendedAdvanceAmountBdt: number;
  advanceReason: string;
  policyType: "NO_ADVANCE" | "PARTIAL_DELIVERY_CHARGE" | "FULL_PREPAYMENT";
  paymentLink: string;
  whatsappTemplate: string;
  smsTemplate: string;
}

export interface RTOPredictionResult {
  phone: string;
  normalizedPhone: string;
  isBlacklisted: boolean;
  blacklistDetails?: FraudReport[];
  credibilityScore: number; // 0 - 100
  rtoProbabilityPercent: number; // 0 - 100
  riskTier: RTORiskTier;
  riskFactors: string[];
  carrierHistory: CarrierDeliveryHistory[];
  totalHistoricalOrders: number;
  totalHistoricalDelivered: number;
  totalHistoricalReturned: number;
  overallDsrPercent: number;
  advancePolicy: AdvancePolicy;
  evaluationTimestamp: string;
  auditHash: string;
}

export class RtoFraudEngine {
  private static blacklistMap: Map<string, FraudReport[]> = new Map();

  // Known mock carrier database for realistic testing and demonstration
  private static mockCarrierProfiles: Map<
    string,
    {
      steadfast?: { total: number; delivered: number; returned: number; cancelled: number };
      pathao?: { total: number; delivered: number; returned: number; cancelled: number };
      redx?: { total: number; delivered: number; returned: number; cancelled: number };
    }
  > = new Map([
    // Highly reliable customer
    [
      "01711002233",
      {
        steadfast: { total: 18, delivered: 18, returned: 0, cancelled: 0 },
        pathao: { total: 12, delivered: 11, returned: 1, cancelled: 0 },
        redx: { total: 5, delivered: 5, returned: 0, cancelled: 0 },
      },
    ],
    // High-return / chronic cancellation customer
    [
      "01899112233",
      {
        steadfast: { total: 10, delivered: 2, returned: 7, cancelled: 1 },
        pathao: { total: 6, delivered: 1, returned: 4, cancelled: 1 },
        redx: { total: 4, delivered: 0, returned: 4, cancelled: 0 },
      },
    ],
    // Moderate customer
    [
      "01922334455",
      {
        steadfast: { total: 5, delivered: 4, returned: 1, cancelled: 0 },
        pathao: { total: 3, delivered: 2, returned: 1, cancelled: 0 },
      },
    ],
  ]);

  static {
    // Seed sample known blacklist records
    const sampleBlacklistPhone = "01999887766";
    const report: FraudReport = {
      reportId: "REP_FL_001",
      phone: sampleBlacklistPhone,
      phoneHash: createHash("sha256").update(sampleBlacklistPhone).digest("hex"),
      category: "REFUSED_ON_ARRIVAL",
      reporterMerchant: "Dhaka Fashion Hub",
      orderRef: "ORD_FAKE_991",
      notes: "Ordered 3 items COD, rider arrived and customer refused to accept or answer calls.",
      reportedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    };
    this.blacklistMap.set(sampleBlacklistPhone, [report]);
  }

  /**
   * Normalizes Bangladeshi phone numbers to standard 11-digit `01XXXXXXXXX`
   */
  public static normalizeBdPhone(phone: string): {
    isValid: boolean;
    normalized: string;
    operator: string;
  } {
    const rawClean = phone.replace(/[\s\-().]/g, "");

    // Match +8801XXXXXXXXX, 8801XXXXXXXXX, or 01XXXXXXXXX
    let digits = rawClean;
    if (digits.startsWith("+880")) {
      digits = digits.slice(4);
    } else if (digits.startsWith("880")) {
      digits = digits.slice(3);
    }

    if (!digits.startsWith("0") && digits.length === 10) {
      digits = "0" + digits;
    }

    const bdRegex = /^01([3-9])\d{8}$/;
    const match = digits.match(bdRegex);

    if (!match) {
      return {
        isValid: false,
        normalized: digits,
        operator: "UNKNOWN",
      };
    }

    const prefix = "01" + match[1];
    let operator = "OTHER";
    if (prefix === "017" || prefix === "013") operator = "Grameenphone";
    else if (prefix === "018") operator = "Robi";
    else if (prefix === "019" || prefix === "014") operator = "Banglalink";
    else if (prefix === "015") operator = "Teletalk";
    else if (prefix === "016") operator = "Airtel";

    return {
      isValid: true,
      normalized: digits,
      operator,
    };
  }

  /**
   * Reports a customer phone number to the community fraud blacklist
   */
  public static reportFraud(params: {
    phone: string;
    category: FraudCategory;
    reporterMerchant: string;
    orderRef?: string;
    notes?: string;
  }): { success: boolean; report: FraudReport; totalReports: number } {
    const { isValid, normalized } = this.normalizeBdPhone(params.phone);
    if (!isValid) {
      throw new Error(`Invalid Bangladeshi phone number: ${params.phone}`);
    }

    const phoneHash = createHash("sha256").update(normalized).digest("hex");
    const report: FraudReport = {
      reportId: `REP_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      phone: normalized,
      phoneHash,
      category: params.category,
      reporterMerchant: params.reporterMerchant,
      orderRef: params.orderRef,
      notes: params.notes,
      reportedAt: new Date().toISOString(),
    };

    const existing = this.blacklistMap.get(normalized) || [];
    existing.push(report);
    this.blacklistMap.set(normalized, existing);

    return {
      success: true,
      report,
      totalReports: existing.length,
    };
  }

  /**
   * Checks if phone number is present in the fraud blacklist
   */
  public static checkBlacklist(phone: string): {
    isBlacklisted: boolean;
    reports: FraudReport[];
  } {
    const { normalized } = this.normalizeBdPhone(phone);
    const reports = this.blacklistMap.get(normalized) || [];
    return {
      isBlacklisted: reports.length > 0,
      reports,
    };
  }

  /**
   * Removes phone number from blacklist (whitelist override)
   */
  public static removeFromBlacklist(phone: string): { success: boolean; removedCount: number } {
    const { normalized } = this.normalizeBdPhone(phone);
    const existing = this.blacklistMap.get(normalized);
    if (!existing) {
      return { success: false, removedCount: 0 };
    }
    const count = existing.length;
    this.blacklistMap.delete(normalized);
    return { success: true, removedCount: count };
  }

  /**
   * Lists all blacklisted phone numbers with summary metadata
   */
  public static listBlacklist(): Array<{
    phone: string;
    phoneHash: string;
    reportCount: number;
    categories: FraudCategory[];
    lastReportedAt: string;
    reports: FraudReport[];
  }> {
    const results: Array<{
      phone: string;
      phoneHash: string;
      reportCount: number;
      categories: FraudCategory[];
      lastReportedAt: string;
      reports: FraudReport[];
    }> = [];

    for (const [phone, reports] of this.blacklistMap.entries()) {
      const categories = Array.from(new Set(reports.map((r) => r.category)));
      const sorted = [...reports].sort(
        (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
      );
      results.push({
        phone,
        phoneHash: reports[0].phoneHash,
        reportCount: reports.length,
        categories,
        lastReportedAt: sorted[0]?.reportedAt || new Date().toISOString(),
        reports,
      });
    }

    return results;
  }

  /**
   * Evaluates multi-carrier delivery history
   */
  public static getMultiCarrierHistory(normalizedPhone: string): CarrierDeliveryHistory[] {
    const mock = this.mockCarrierProfiles.get(normalizedPhone);

    const history: CarrierDeliveryHistory[] = [];

    // Steadfast history
    const stf = mock?.steadfast || {
      total: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };
    const stfRate = stf.total > 0 ? Math.round((stf.delivered / stf.total) * 100) : 100;
    history.push({
      carrier: "steadfast",
      carrierName: "Steadfast Courier",
      totalOrders: stf.total,
      deliveredOrders: stf.delivered,
      returnedOrders: stf.returned,
      cancelledOrders: stf.cancelled,
      successRatePercent: stfRate,
    });

    // Pathao history
    const pth = mock?.pathao || {
      total: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };
    const pthRate = pth.total > 0 ? Math.round((pth.delivered / pth.total) * 100) : 100;
    history.push({
      carrier: "pathao",
      carrierName: "Pathao Express",
      totalOrders: pth.total,
      deliveredOrders: pth.delivered,
      returnedOrders: pth.returned,
      cancelledOrders: pth.cancelled,
      successRatePercent: pthRate,
    });

    // RedX history
    const rdx = mock?.redx || {
      total: 0,
      delivered: 0,
      returned: 0,
      cancelled: 0,
    };
    const rdxRate = rdx.total > 0 ? Math.round((rdx.delivered / rdx.total) * 100) : 100;
    history.push({
      carrier: "redx",
      carrierName: "RedX Network",
      totalOrders: rdx.total,
      deliveredOrders: rdx.delivered,
      returnedOrders: rdx.returned,
      cancelledOrders: rdx.cancelled,
      successRatePercent: rdxRate,
    });

    return history;
  }

  /**
   * Main Predictive Engine: Assesses RTO Probability, Risk Tier, and Dynamic Advance Policy
   */
  public static predictRTORisk(params: {
    phone: string;
    codAmountBdt: number;
    district?: string;
    deliveryAddress?: string;
    orderRef?: string;
  }): RTOPredictionResult {
    const { isValid, normalized, operator } = this.normalizeBdPhone(params.phone);
    const blacklistCheck = this.checkBlacklist(params.phone);

    const carrierHistory = this.getMultiCarrierHistory(normalized);
    const totalOrders = carrierHistory.reduce((acc, c) => acc + c.totalOrders, 0);
    const totalDelivered = carrierHistory.reduce((acc, c) => acc + c.deliveredOrders, 0);
    const totalReturned = carrierHistory.reduce((acc, c) => acc + c.returnedOrders, 0);

    const overallDsr =
      totalOrders > 0 ? Math.round((totalDelivered / totalOrders) * 100) : 90; // Default 90% for new buyers without negative history

    let credibilityScore = 100;
    const riskFactors: string[] = [];

    // Factor 1: Phone validity check
    if (!isValid) {
      credibilityScore -= 50;
      riskFactors.push("Invalid or non-standard Bangladeshi phone number format");
    } else {
      riskFactors.push(`Verified operator network (${operator})`);
    }

    // Factor 2: Community Blacklist penalty
    if (blacklistCheck.isBlacklisted) {
      credibilityScore = 0;
      const count = blacklistCheck.reports.length;
      const cats = Array.from(new Set(blacklistCheck.reports.map((r) => r.category))).join(", ");
      riskFactors.push(
        `🚨 FLAG: Customer is listed on community fraud blacklist with ${count} verified report(s) (${cats})`
      );
    }

    // Factor 3: Multi-Carrier Delivery Success Rate
    if (totalOrders > 0) {
      const returnRatio = totalReturned / totalOrders;
      if (returnRatio >= 0.5) {
        credibilityScore -= 50;
        riskFactors.push(
          `Severe courier return history (${(returnRatio * 100).toFixed(0)}% return rate across ${totalOrders} orders)`
        );
      } else if (returnRatio >= 0.25) {
        credibilityScore -= 25;
        riskFactors.push(
          `Elevated courier return history (${(returnRatio * 100).toFixed(0)}% return rate across ${totalOrders} orders)`
        );
      } else if (totalDelivered >= 5 && returnRatio === 0) {
        credibilityScore = Math.min(100, credibilityScore + 10);
        riskFactors.push(`Trusted buyer track record: ${totalDelivered} flawless deliveries across couriers`);
      }
    } else {
      riskFactors.push("First-time courier buyer (no prior multi-carrier parcel history recorded)");
    }

    // Factor 4: High Ticket Size Risk
    if (params.codAmountBdt > 10000) {
      credibilityScore -= 20;
      riskFactors.push(
        `High COD value (৳${params.codAmountBdt}) significantly increases buyer remorse and refusal risk`
      );
    } else if (params.codAmountBdt > 5000) {
      credibilityScore -= 10;
      riskFactors.push(`Moderate COD ticket size (৳${params.codAmountBdt})`);
    }

    // Factor 5: Address Granularity & Geographical Risk
    const dist = (params.district || "").trim().toLowerCase();
    const addr = (params.deliveryAddress || "").trim();

    if (addr && addr.length < 12) {
      credibilityScore -= 15;
      riskFactors.push("Extremely short or vague delivery address details");
    }

    const isRemote =
      dist.includes("cox") ||
      dist.includes("bandarban") ||
      dist.includes("khagrachari") ||
      dist.includes("rangamati") ||
      dist.includes("sunamganj") ||
      dist.includes("kurigram");

    if (isRemote) {
      credibilityScore -= 10;
      riskFactors.push(`Remote / hill tracts destination (${params.district}) with longer courier turnaround`);
    }

    // Bound credibility between 0 and 100
    credibilityScore = Math.max(0, Math.min(100, credibilityScore));

    // RTO Probability calculation (inversion of credibility with floor/ceil)
    let rtoProbabilityPercent = Math.max(5, 100 - credibilityScore);
    if (blacklistCheck.isBlacklisted) {
      rtoProbabilityPercent = 95;
    }

    // Classify into Risk Tier
    let riskTier: RTORiskTier = "TIER_VERIFIED_LOW";
    if (blacklistCheck.isBlacklisted || credibilityScore < 35) {
      riskTier = "TIER_CRITICAL_BLOCKED";
    } else if (credibilityScore < 65) {
      riskTier = "TIER_HIGH_RISK";
    } else if (credibilityScore < 85) {
      riskTier = "TIER_MODERATE";
    } else {
      riskTier = "TIER_VERIFIED_LOW";
    }

    // Determine Dynamic Advance Payment Policy
    const advancePolicy = this.computeAdvancePolicy({
      riskTier,
      codAmountBdt: params.codAmountBdt,
      district: params.district || "Dhaka",
      phone: normalized,
      orderRef: params.orderRef || "ORD-COD",
    });

    const evalTimestamp = new Date().toISOString();
    const auditHash = createHash("sha256")
      .update(`${normalized}-${riskTier}-${rtoProbabilityPercent}-${evalTimestamp}`)
      .digest("hex");

    return {
      phone: params.phone,
      normalizedPhone: normalized,
      isBlacklisted: blacklistCheck.isBlacklisted,
      blacklistDetails: blacklistCheck.reports.length > 0 ? blacklistCheck.reports : undefined,
      credibilityScore,
      rtoProbabilityPercent,
      riskTier,
      riskFactors,
      carrierHistory,
      totalHistoricalOrders: totalOrders,
      totalHistoricalDelivered: totalDelivered,
      totalHistoricalReturned: totalReturned,
      overallDsrPercent: overallDsr,
      advancePolicy,
      evaluationTimestamp: evalTimestamp,
      auditHash,
    };
  }

  /**
   * Computes dynamic advance policy and pre-formats WhatsApp/SMS payment templates
   */
  private static computeAdvancePolicy(params: {
    riskTier: RTORiskTier;
    codAmountBdt: number;
    district: string;
    phone: string;
    orderRef: string;
  }): AdvancePolicy {
    const isInsideDhaka = params.district.toLowerCase().includes("dhaka");
    const stdDeliveryCharge = isInsideDhaka ? 80 : 150;

    if (params.riskTier === "TIER_VERIFIED_LOW") {
      return {
        requiresAdvance: false,
        recommendedAdvanceAmountBdt: 0,
        advanceReason: "Trusted customer profile with low RTO risk. Safe for instant 1-click COD dispatch.",
        policyType: "NO_ADVANCE",
        paymentLink: "",
        whatsappTemplate: `প্রিয় গ্রাহক, আপনার #${params.orderRef} অর্ডারটি নিশ্চিত হয়েছে। শীঘ্রই কুরিয়ার পার্সেলটি নিয়ে রওনা হবে। নগদ ৳${params.codAmountBdt} প্রস্তুত রাখবেন। ধন্যবাদ!`,
        smsTemplate: `Shothik: Apnar order #${params.orderRef} confirm hoyese. COD Tk ${params.codAmountBdt} ready rakhun.`,
      };
    }

    if (params.riskTier === "TIER_MODERATE") {
      return {
        requiresAdvance: false,
        recommendedAdvanceAmountBdt: 0,
        advanceReason: "Moderate risk level. Recommended automated Voice IVR call confirmation before dispatch.",
        policyType: "NO_ADVANCE",
        paymentLink: "",
        whatsappTemplate: `আসসালামু আলাইকুম! #${params.orderRef} নম্বরের ৳${params.codAmountBdt} টাকার COD অর্ডারটি কনফার্ম করতে অনুগ্রহ করে '1' লিখে রিপ্লাই দিন অথবা ঠিকানার আপডেট দিন।`,
        smsTemplate: `Shothik: Order #${params.orderRef} confirm korte reply korun ba call dhorun.`,
      };
    }

    if (params.riskTier === "TIER_HIGH_RISK") {
      const paymentLink = `https://pay.shothik.com/advance/${params.orderRef}?amt=${stdDeliveryCharge}&phone=${params.phone}`;
      return {
        requiresAdvance: true,
        recommendedAdvanceAmountBdt: stdDeliveryCharge,
        advanceReason: `High RTO risk profile. Require partial delivery charge advance (৳${stdDeliveryCharge}) via bKash/Nagad before shipping.`,
        policyType: "PARTIAL_DELIVERY_CHARGE",
        paymentLink,
        whatsappTemplate: `আসসালামু আলাইকুম! 🛍️\nআপনার অর্ডার #${params.orderRef} (মোট ৳${params.codAmountBdt}) প্রসেস করতে ডেলিভারি চার্জ বাবদ ৳${stdDeliveryCharge} অগ্রিম বিকাশ/নগদে প্রদান করতে হবে। বাকি ৳${params.codAmountBdt - stdDeliveryCharge} ডেলিভারির সময় পরিশোধ করবেন।\n\n💳 পেমেন্ট লিংক: ${paymentLink}\nপেমেন্ট সম্পন্ন হলে পার্সেলটি বুকিং করা হবে।`,
        smsTemplate: `Shothik: Order #${params.orderRef} er delivery charge Tk ${stdDeliveryCharge} bikash korun: ${paymentLink}. Baki tk COD te deben.`,
      };
    }

    // TIER_CRITICAL_BLOCKED
    const paymentLink = `https://pay.shothik.com/full/${params.orderRef}?amt=${params.codAmountBdt}&phone=${params.phone}`;
    return {
      requiresAdvance: true,
      recommendedAdvanceAmountBdt: params.codAmountBdt,
      advanceReason:
        "CRITICAL ALERT: Customer is flagged on fraud blacklist or has severe return record. Full pre-payment mandatory.",
      policyType: "FULL_PREPAYMENT",
      paymentLink,
      whatsappTemplate: `আসসালামু আলাইকুম। আপনার অর্ডার #${params.orderRef} কনফার্ম করতে ১০০% প্রি-পেমেন্ট প্রয়োজন।\n💳 বিকাশ/নগদে পেমেন্ট লিংক: ${paymentLink}\nধন্যবাদ।`,
      smsTemplate: `Shothik: Order #${params.orderRef} confirm korte 100% advance payment proyojon: ${paymentLink}.`,
    };
  }
}
