/**
 * Shothik Platform Elevators & Viral Growth Triggers Engine
 * 
 * Implements Product-Led Growth (PLG) mechanics for Bangladeshi One-Person Companies (OPCs):
 * 1. 4-Tier Operational Elevator (Rookie Solopreneur -> Rising OPC -> Power Merchant -> Enterprise Franchise)
 * 2. Composite Merchant Health Index (MHI) calculation
 * 3. Viral Watermarked Mushak-6.3 & Digital Receipts with 1-click OPC onboarding QR
 * 4. bKash/Nagad Referral Cashback Ledger (৳50 bKash per 5 delivered referee COD orders)
 * 5. Verifiable COD Trust Badge & Delivery Seal (Steadfast Certified)
 * 6. 1688 Cross-Border Group-Sourcing Pools (Container LCL/FCL Volume Pooling)
 */

import crypto from "crypto";
import { logger } from "../logger.js";

export type GrowthTierLevel = 1 | 2 | 3 | 4;

export type TierTitle =
  | "Rookie Solopreneur"
  | "Rising OPC"
  | "Power Merchant"
  | "Enterprise Franchise";

export interface MerchantElevatorMetrics {
  merchantId: string;
  merchantName: string;
  monthlyGmvBdt: number;
  totalOrdersDispatched: number;
  ordersDeliveredSuccessfully: number;
  avgFulfillmentHours: number;
  binVerified: boolean;
  nidVerified: boolean;
}

export interface UnlockedPrivilege {
  id: string;
  title: string;
  description: string;
  category: "telephony" | "payments" | "logistics" | "compliance" | "sourcing" | "credit";
}

export interface MerchantElevatorProfile {
  merchantId: string;
  merchantName: string;
  currentTier: GrowthTierLevel;
  tierTitle: TierTitle;
  mhiScore: number;
  scoreBreakdown: {
    gmvScore: number; // 40% weight
    codDeliveryRateScore: number; // 35% weight
    fulfillmentSpeedScore: number; // 15% weight
    statutoryVerificationScore: number; // 10% weight
  };
  metrics: MerchantElevatorMetrics;
  unlockedPrivileges: UnlockedPrivilege[];
  nextTierRequirements?: {
    targetTier: GrowthTierLevel;
    targetTierTitle: TierTitle;
    gmvShortfallBdt: number;
    mhiShortfall: number;
    actionableRecommendations: string[];
  };
  referralCode: string;
  referralStats: {
    totalReferees: number;
    activeReferees: number;
    pendingCashbackBdt: number;
    paidCashbackBdt: number;
  };
  verifiedTrustScore: number;
}

export interface RefereeEntry {
  refereeId: string;
  refereeName: string;
  referralCode: string;
  joinedAt: string;
  deliveredCodOrdersCount: number;
  cashbackQualified: boolean;
  cashbackPaid: boolean;
  rewardBdt: number;
}

export interface SourcingPool {
  poolId: string;
  productTitle: string;
  hsCode: string;
  targetQuantity: number;
  committedQuantity: number;
  unitPriceUsd: number;
  estimatedFreightSavingsPct: number;
  portOfEntry: string;
  poolMasterMerchantId: string;
  poolMasterName: string;
  participants: Array<{
    merchantId: string;
    merchantName: string;
    quantity: number;
    joinedAt: string;
  }>;
  status: "open" | "locked" | "clearing" | "distributed";
  shareableInviteUrl: string;
  expiresAt: string;
}

export interface TrustBadgeMetadata {
  merchantId: string;
  merchantName: string;
  verifiedSince: string;
  tierTitle: TierTitle;
  codDeliverySuccessRatePct: number;
  totalOrdersDelivered: number;
  fastDispatchAvgHours: number;
  isBinVerified: boolean;
  trustScore: number;
  signature: string;
  embedSnippetHtml: string;
}

export class PlatformElevatorEngine {
  // In-memory ledgers for merchants, referrals, and sourcing pools
  private static merchants = new Map<string, MerchantElevatorProfile>();
  private static referrals = new Map<string, RefereeEntry[]>(); // referrerCode -> referees
  private static sourcingPools = new Map<string, SourcingPool>();

  private static readonly TIER_DEFINITIONS: Record<GrowthTierLevel, {
    title: TierTitle;
    minGmvBdt: number;
    minMhi: number;
    privileges: UnlockedPrivilege[];
  }> = {
    1: {
      title: "Rookie Solopreneur",
      minGmvBdt: 0,
      minMhi: 0,
      privileges: [
        {
          id: "basic_chat",
          title: "Bilingual Chat Assistant",
          description: "Full access to Banglish conversational assistant and receipt parsing",
          category: "compliance",
        },
        {
          id: "manual_logistics",
          title: "Steadfast & Pathao Manual Booking",
          description: "1-tap consignment generation with manual dispatch confirmation",
          category: "logistics",
        },
        {
          id: "ai_calls_10",
          title: "10 AI Phone Verifications / mo",
          description: "Outbound COD confirmation IVR with standard Bengali dialect",
          category: "telephony",
        },
      ],
    },
    2: {
      title: "Rising OPC",
      minGmvBdt: 50000,
      minMhi: 65,
      privileges: [
        {
          id: "ai_calls_100",
          title: "100 AI Phone Verifications / mo",
          description: "Full multi-dialect synthesis (Dhakaiya, Sylheti, Chatgaya) with BTRC compliance",
          category: "telephony",
        },
        {
          id: "zero_fee_bkash_qr",
          title: "Zero-Fee Dynamic bKash/Nagad QR",
          description: "Automated customer payment links with instant order matching",
          category: "payments",
        },
        {
          id: "auto_courier_pickup",
          title: "Automated Steadfast Pickup Scheduling",
          description: "Rider dispatch dispatched automatically upon customer voice confirmation",
          category: "logistics",
        },
      ],
    },
    3: {
      title: "Power Merchant",
      minGmvBdt: 300000,
      minMhi: 80,
      privileges: [
        {
          id: "mushak_vat_auto",
          title: "Automated NBR Mushak-6.3 & 9.1 VAT Returns",
          description: "Statutory VAT invoices with 13-digit BIN cryptographic QR codes",
          category: "compliance",
        },
        {
          id: "multi_store_sync",
          title: "Multi-Store Real-Time Stock Matrix",
          description: "Instant inventory synchronization across Facebook Shop, Daraz, and Shopify",
          category: "sourcing",
        },
        {
          id: "steadfast_rebate",
          title: "৳5 / Parcel Steadfast VIP Rebate",
          description: "Discounted commercial courier rates with zero COD collection fees",
          category: "logistics",
        },
        {
          id: "ai_calls_500",
          title: "500 AI Phone Verifications / mo",
          description: "Priority telephony queuing with human escalation callbacks",
          category: "telephony",
        },
      ],
    },
    4: {
      title: "Enterprise Franchise",
      minGmvBdt: 1500000,
      minMhi: 90,
      privileges: [
        {
          id: "instant_micro_credit",
          title: "৳100k - ৳500k Working Capital Overdraft",
          description: "Instant bKash SME revolving credit with zero collateral requirements",
          category: "credit",
        },
        {
          id: "group_sourcing_master",
          title: "1688 Cross-Border Pool Master",
          description: "Initialize and lead sea/air cargo container import cohorts from China",
          category: "sourcing",
        },
        {
          id: "speculative_inference_node",
          title: "Dedicated Sub-50ms Speculative Node",
          description: "Zero-latency DeepSpec model mesh for instantaneous multi-turn voice",
          category: "telephony",
        },
        {
          id: "unlimited_telephony",
          title: "Unlimited AI Telephony & Multi-Branch Delegation",
          description: "Autonomous verification across unlimited branch franchise locations",
          category: "telephony",
        },
      ],
    },
  };

  static {
    // Seed standard demo merchant
    this.registerOrUpdateMerchant({
      merchantId: "merch_shothik_dhaka_01",
      merchantName: "Shothik Lifestyle & Electronics",
      monthlyGmvBdt: 385000,
      totalOrdersDispatched: 240,
      ordersDeliveredSuccessfully: 231,
      avgFulfillmentHours: 3.5,
      binVerified: true,
      nidVerified: true,
    });

    // Seed group sourcing pool
    this.createSourcingPool({
      productTitle: "Wireless ANC TWS Earbuds (1688 Direct)",
      hsCode: "8518.30.00",
      targetQuantity: 1000,
      initialQuantity: 350,
      unitPriceUsd: 4.80,
      estimatedFreightSavingsPct: 42,
      portOfEntry: "Chittagong Seaport (LCL)",
      poolMasterMerchantId: "merch_shothik_dhaka_01",
      poolMasterName: "Shothik Lifestyle & Electronics",
    });
  }

  /**
   * Calculates the composite Merchant Health Index (MHI)
   */
  public static calculateMhi(metrics: MerchantElevatorMetrics): {
    mhiScore: number;
    breakdown: {
      gmvScore: number;
      codDeliveryRateScore: number;
      fulfillmentSpeedScore: number;
      statutoryVerificationScore: number;
    };
  } {
    // 1. GMV Score (40%): Scale up to ৳500,000 for standard power merchant (100 pts)
    const gmvScore = Math.min(100, Math.round((metrics.monthlyGmvBdt / 500000) * 100));

    // 2. COD Delivery Success Rate (35%)
    const deliveryRatePct = metrics.totalOrdersDispatched > 0
      ? (metrics.ordersDeliveredSuccessfully / metrics.totalOrdersDispatched) * 100
      : 100;
    const codDeliveryRateScore = Math.min(100, Math.round(deliveryRatePct));

    // 3. Fulfillment Speed Score (15%): Max 100 points, decremented if > 24 hours
    const fulfillmentSpeedScore = Math.max(0, Math.min(100, Math.round(100 - (metrics.avgFulfillmentHours * 2))));

    // 4. Statutory Verification (10%): BIN (50 pts) + NID (50 pts) = 100 max
    let statutoryVerificationScore = 0;
    if (metrics.binVerified) statutoryVerificationScore += 50;
    if (metrics.nidVerified) statutoryVerificationScore += 50;

    const rawMhi = (0.40 * gmvScore) + (0.35 * codDeliveryRateScore) + (0.15 * fulfillmentSpeedScore) + (0.10 * statutoryVerificationScore);
    const mhiScore = Math.round(rawMhi * 10) / 10;

    return {
      mhiScore,
      breakdown: {
        gmvScore,
        codDeliveryRateScore,
        fulfillmentSpeedScore,
        statutoryVerificationScore,
      },
    };
  }

  /**
   * Registers or updates a merchant's elevator profile
   */
  public static registerOrUpdateMerchant(metrics: MerchantElevatorMetrics): MerchantElevatorProfile {
    const { mhiScore, breakdown } = this.calculateMhi(metrics);

    // Determine highest unlocked tier
    let currentTier: GrowthTierLevel = 1;
    if (metrics.monthlyGmvBdt >= this.TIER_DEFINITIONS[4].minGmvBdt && mhiScore >= this.TIER_DEFINITIONS[4].minMhi) {
      currentTier = 4;
    } else if (metrics.monthlyGmvBdt >= this.TIER_DEFINITIONS[3].minGmvBdt && mhiScore >= this.TIER_DEFINITIONS[3].minMhi) {
      currentTier = 3;
    } else if (metrics.monthlyGmvBdt >= this.TIER_DEFINITIONS[2].minGmvBdt && mhiScore >= this.TIER_DEFINITIONS[2].minMhi) {
      currentTier = 2;
    }

    // Cumulative privileges up to current tier
    const unlockedPrivileges: UnlockedPrivilege[] = [];
    for (let t = 1; t <= currentTier; t++) {
      unlockedPrivileges.push(...this.TIER_DEFINITIONS[t as GrowthTierLevel].privileges);
    }

    // Next tier requirements
    let nextTierRequirements: MerchantElevatorProfile["nextTierRequirements"] | undefined;
    if (currentTier < 4) {
      const nextTierLevel = (currentTier + 1) as GrowthTierLevel;
      const nextDef = this.TIER_DEFINITIONS[nextTierLevel];
      const gmvShortfallBdt = Math.max(0, nextDef.minGmvBdt - metrics.monthlyGmvBdt);
      const mhiShortfall = Math.max(0, Math.round((nextDef.minMhi - mhiScore) * 10) / 10);

      const recommendations: string[] = [];
      if (gmvShortfallBdt > 0) {
        recommendations.push(`Generate ৳${gmvShortfallBdt.toLocaleString()} more monthly GMV to reach ${nextDef.title}`);
      }
      if (metrics.totalOrdersDispatched > 0 && (metrics.ordersDeliveredSuccessfully / metrics.totalOrdersDispatched) < 0.95) {
        recommendations.push("Use AI Outbound Phone Verification (⌘O) to boost COD delivery success above 95%");
      }
      if (!metrics.binVerified) {
        recommendations.push("Verify your 13-digit NBR BIN in Mushak Studio to unlock 50 verification points");
      }
      if (metrics.avgFulfillmentHours > 12) {
        recommendations.push("Enable Automated Steadfast Pickup to reduce fulfillment dispatch time under 12 hours");
      }

      nextTierRequirements = {
        targetTier: nextTierLevel,
        targetTierTitle: nextDef.title,
        gmvShortfallBdt,
        mhiShortfall,
        actionableRecommendations: recommendations,
      };
    }

    const referralCode = `SHOTHIK-${metrics.merchantId.slice(-6).toUpperCase()}`;
    const refereeList = this.referrals.get(referralCode) || [];
    const totalReferees = refereeList.length;
    const activeReferees = refereeList.filter(r => r.deliveredCodOrdersCount >= 5).length;
    const pendingCashbackBdt = refereeList.filter(r => r.cashbackQualified && !r.cashbackPaid).length * 50;
    const paidCashbackBdt = refereeList.filter(r => r.cashbackPaid).length * 50;

    const deliverySuccessPct = metrics.totalOrdersDispatched > 0
      ? (metrics.ordersDeliveredSuccessfully / metrics.totalOrdersDispatched) * 100
      : 100;
    const verifiedTrustScore = Math.min(100, Math.round((deliverySuccessPct * 0.7) + (mhiScore * 0.3)));

    const profile: MerchantElevatorProfile = {
      merchantId: metrics.merchantId,
      merchantName: metrics.merchantName,
      currentTier,
      tierTitle: this.TIER_DEFINITIONS[currentTier].title,
      mhiScore,
      scoreBreakdown: breakdown,
      metrics,
      unlockedPrivileges,
      nextTierRequirements,
      referralCode,
      referralStats: {
        totalReferees,
        activeReferees,
        pendingCashbackBdt,
        paidCashbackBdt,
      },
      verifiedTrustScore,
    };

    this.merchants.set(metrics.merchantId, profile);
    logger.info({ merchantId: metrics.merchantId, tier: currentTier, mhi: mhiScore }, "[growth] Merchant elevator profile updated");
    return profile;
  }

  /**
   * Retrieves a merchant profile
   */
  public static getMerchantProfile(merchantId: string): MerchantElevatorProfile | undefined {
    return this.merchants.get(merchantId);
  }

  /**
   * Claims a referral code upon new merchant signup
   */
  public static claimReferral(params: {
    referrerCode: string;
    refereeId: string;
    refereeName: string;
  }): { success: boolean; bonusCallMinutes: number; message: string } {
    const { referrerCode, refereeId, refereeName } = params;

    const existingReferees = this.referrals.get(referrerCode) || [];
    if (existingReferees.some(r => r.refereeId === refereeId)) {
      return {
        success: false,
        bonusCallMinutes: 0,
        message: "Referral code already claimed for this merchant account",
      };
    }

    const newEntry: RefereeEntry = {
      refereeId,
      refereeName,
      referralCode: referrerCode,
      joinedAt: new Date().toISOString(),
      deliveredCodOrdersCount: 0,
      cashbackQualified: false,
      cashbackPaid: false,
      rewardBdt: 50,
    };

    existingReferees.push(newEntry);
    this.referrals.set(referrerCode, existingReferees);

    logger.info({ referrerCode, refereeId }, "[growth] Referral claimed successfully");
    return {
      success: true,
      bonusCallMinutes: 50,
      message: "Referral claimed! You received 50 Free AI Phone Verification Minutes.",
    };
  }

  /**
   * Increments referee COD delivery count and checks for ৳50 bKash cashback unlock
   */
  public static recordRefereeDelivery(params: {
    referrerCode: string;
    refereeId: string;
  }): { cashbackUnlocked: boolean; rewardBdt: number } {
    const list = this.referrals.get(params.referrerCode);
    if (!list) return { cashbackUnlocked: false, rewardBdt: 0 };

    const referee = list.find(r => r.refereeId === params.refereeId);
    if (!referee) return { cashbackUnlocked: false, rewardBdt: 0 };

    referee.deliveredCodOrdersCount += 1;
    if (referee.deliveredCodOrdersCount >= 5 && !referee.cashbackQualified) {
      referee.cashbackQualified = true;
      referee.cashbackPaid = true; // Simulating automatic bKash disbursement
      logger.info({ referrerCode: params.referrerCode, refereeId: params.refereeId }, "[growth] Referrer earned ৳50 bKash cashback");
      return { cashbackUnlocked: true, rewardBdt: 50 };
    }

    return { cashbackUnlocked: false, rewardBdt: 0 };
  }

  /**
   * Retrieves the referral ledger for a given referral code
   */
  public static getReferralLedger(referralCode: string): RefereeEntry[] {
    return this.referrals.get(referralCode) || [];
  }

  /**
   * Creates a 1688 Cross-Border Group Sourcing Pool
   */
  public static createSourcingPool(params: {
    productTitle: string;
    hsCode: string;
    targetQuantity: number;
    initialQuantity: number;
    unitPriceUsd: number;
    estimatedFreightSavingsPct?: number;
    portOfEntry?: string;
    poolMasterMerchantId: string;
    poolMasterName: string;
  }): SourcingPool {
    const poolId = `POOL_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const pool: SourcingPool = {
      poolId,
      productTitle: params.productTitle,
      hsCode: params.hsCode,
      targetQuantity: params.targetQuantity,
      committedQuantity: params.initialQuantity,
      unitPriceUsd: params.unitPriceUsd,
      estimatedFreightSavingsPct: params.estimatedFreightSavingsPct ?? 35,
      portOfEntry: params.portOfEntry ?? "Chittagong Seaport (LCL)",
      poolMasterMerchantId: params.poolMasterMerchantId,
      poolMasterName: params.poolMasterName,
      participants: [
        {
          merchantId: params.poolMasterMerchantId,
          merchantName: params.poolMasterName,
          quantity: params.initialQuantity,
          joinedAt: new Date().toISOString(),
        },
      ],
      status: "open",
      shareableInviteUrl: `https://shothik.app/import/pool/${poolId}?ref=${params.poolMasterMerchantId}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.sourcingPools.set(poolId, pool);
    logger.info({ poolId, targetQuantity: params.targetQuantity }, "[growth] Sourcing pool created");
    return pool;
  }

  /**
   * Joins an existing group sourcing pool
   */
  public static joinSourcingPool(params: {
    poolId: string;
    merchantId: string;
    merchantName: string;
    quantity: number;
  }): { success: boolean; pool?: SourcingPool; message: string } {
    const pool = this.sourcingPools.get(params.poolId);
    if (!pool) {
      return { success: false, message: `Sourcing pool ${params.poolId} not found` };
    }

    if (pool.status !== "open") {
      return { success: false, message: `Sourcing pool is ${pool.status} and cannot accept new orders` };
    }

    const existingPart = pool.participants.find(p => p.merchantId === params.merchantId);
    if (existingPart) {
      existingPart.quantity += params.quantity;
    } else {
      pool.participants.push({
        merchantId: params.merchantId,
        merchantName: params.merchantName,
        quantity: params.quantity,
        joinedAt: new Date().toISOString(),
      });
    }

    pool.committedQuantity += params.quantity;
    if (pool.committedQuantity >= pool.targetQuantity) {
      pool.status = "locked";
    }

    logger.info({ poolId: params.poolId, merchantId: params.merchantId, qty: params.quantity }, "[growth] Sourcing pool joined");
    return {
      success: true,
      pool,
      message: `Successfully joined group pool with ${params.quantity} units!`,
    };
  }

  /**
   * Lists all active group sourcing pools
   */
  public static listSourcingPools(): SourcingPool[] {
    return Array.from(this.sourcingPools.values());
  }

  /**
   * Generates verifiable COD Trust Badge metadata and HTML embed snippet
   */
  public static generateTrustBadge(merchantId: string): TrustBadgeMetadata | undefined {
    const profile = this.merchants.get(merchantId);
    if (!profile) return undefined;

    const deliveryRate = profile.metrics.totalOrdersDispatched > 0
      ? Math.round((profile.metrics.ordersDeliveredSuccessfully / profile.metrics.totalOrdersDispatched) * 1000) / 10
      : 100;

    const payload = `${merchantId}:${profile.merchantName}:${deliveryRate}:${profile.tierTitle}`;
    const signature = crypto.createHmac("sha256", "shothik_trust_cert_v2").update(payload).digest("hex").slice(0, 16);

    const embedSnippetHtml = `<div class="shothik-trust-badge" data-merchant="${merchantId}" data-sig="${signature}" style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;background:#0f172a;color:#fff;border-radius:8px;font-family:system-ui,-apple-system,sans-serif;font-size:12px;border:1px solid #10b981;">
  <span style="color:#10b981;font-weight:700;">🛡️ Verified Shothik OPC</span>
  <span style="opacity:0.8;">| ${deliveryRate}% COD Success (${profile.metrics.ordersDeliveredSuccessfully} Delivered)</span>
  <a href="https://shothik.app/trust/${merchantId}?sig=${signature}" target="_blank" style="color:#38bdf8;text-decoration:none;font-weight:600;">Verify</a>
</div>`;

    return {
      merchantId,
      merchantName: profile.merchantName,
      verifiedSince: "September 2026",
      tierTitle: profile.tierTitle,
      codDeliverySuccessRatePct: deliveryRate,
      totalOrdersDelivered: profile.metrics.ordersDeliveredSuccessfully,
      fastDispatchAvgHours: profile.metrics.avgFulfillmentHours,
      isBinVerified: profile.metrics.binVerified,
      trustScore: profile.verifiedTrustScore,
      signature,
      embedSnippetHtml,
    };
  }

  /**
   * Generates viral watermarked receipt payload
   */
  public static generateViralReceiptWatermark(params: {
    merchantId: string;
    invoiceNo: string;
    grandTotalBdt: number;
  }): { watermarkText: string; viralQrUrl: string; conversionCta: string } {
    const referralCode = `SHOTHIK-${params.merchantId.slice(-6).toUpperCase()}`;
    const viralQrUrl = `https://shothik.app/verify/${params.invoiceNo}?ref=${referralCode}&amt=${params.grandTotalBdt}`;
    return {
      watermarkText: "Verified Mushak 6.3 • Powered by ShothikGPT Agentic OS (Bangladesh)",
      viralQrUrl,
      conversionCta: "Launch your automated One-Person Company in 60 seconds (50 Free AI Calls)",
    };
  }
}
