/**
 * 🌐 Autonomous Browser Tracking & Zero-Return Rescue Engine
 * 
 * Inspired by Gobii Web Task Scraper & BrowserOS Session Runner
 * 
 * Features:
 * 1. Headless DOM Parser for Steadfast & Pathao Tracking Portals
 * 2. Real-Time Delivery Milestone Classification
 * 3. Automated "Zero Return Rate" Banglish WhatsApp Customer Interventions
 * 4. Automatic Merchant Cash-on-Delivery (COD) Reconciliation Ledger
 */

export type CourierProvider = "steadfast" | "pathao" | "redx";

export type DeliveryMilestone = 
  | "ORDER_CREATED"
  | "PICKED_UP"
  | "IN_TRANSIT_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED_CASH_COLLECTED"
  | "DELIVERY_FAILED_UNREACHABLE"
  | "RETURNED_TO_HUB";

export interface ParsedTrackingStatus {
  trackingCode: string;
  carrier: CourierProvider;
  milestone: DeliveryMilestone;
  hubLocation?: string;
  codAmount: number;
  riderNote?: string;
  lastUpdated: string;
  requiresCustomerRescue: boolean;
  rescueMessage?: string;
}

export interface CodSettlementReconciliation {
  trackingCode: string;
  grossCodCollected: number;
  courierDeliveryCharge: number;
  codSurchargeAmount: number; // 1% for outside Dhaka or 0.5% Pathao
  netMerchantPayable: number;
  settlementStatus: "READY_FOR_DISBURSEMENT" | "PENDING_DELIVERY";
}

export class BrowserTrackingSyncEngine {
  /**
   * 1. Parses raw HTML / DOM elements scraped from public tracking URLs
   */
  public static parseTrackingDom(
    rawTextContent: string,
    trackingCode: string,
    carrier: CourierProvider = "steadfast",
    codAmount: number = 1850,
    customerName: string = "Customer"
  ): ParsedTrackingStatus {
    const text = (rawTextContent || "").toLowerCase();

    let milestone: DeliveryMilestone = "IN_TRANSIT_HUB";
    let riderNote = "In transit to destination hub";

    if (text.includes("delivered") || text.includes("cash received") || text.includes("ডেলিভারি সম্পন্ন")) {
      milestone = "DELIVERED_CASH_COLLECTED";
      riderNote = "Delivered to recipient and COD cash collected.";
    } else if (text.includes("unreachable") || text.includes("not answering") || text.includes("phone off") || text.includes("ফোন রিসিভ করেননি")) {
      milestone = "DELIVERY_FAILED_UNREACHABLE";
      riderNote = "Delivery attempt failed: Customer phone unreachable / switched off.";
    } else if (text.includes("out for delivery") || text.includes("ডেলিভারির জন্য বের হয়েছে")) {
      milestone = "OUT_FOR_DELIVERY";
      riderNote = "Rider dispatched with parcel for doorstep delivery.";
    } else if (text.includes("picked up") || text.includes("পিকআপ সম্পন্ন")) {
      milestone = "PICKED_UP";
      riderNote = "Parcel collected from merchant warehouse.";
    }

    const requiresRescue = milestone === "DELIVERY_FAILED_UNREACHABLE";
    const rescueMessage = requiresRescue
      ? `Assalamu Alaikum ${customerName}! Apnar parcel (${trackingCode}) niye ${carrier.toUpperCase()} rider delivery korte eshechilo kintu phone-e reach korte pareni. Rider abar ashbe. Apnar alternate kono number ba shomoy thakle janan please!`
      : undefined;

    return {
      trackingCode,
      carrier,
      milestone,
      hubLocation: "Tejgaon Central Sorting Hub, Dhaka",
      codAmount,
      riderNote,
      lastUpdated: new Date().toISOString(),
      requiresCustomerRescue: requiresRescue,
      rescueMessage,
    };
  }

  /**
   * 2. Calculates Exact Merchant COD Payout (Accounting reconciliation)
   */
  public static reconcileCodSettlement(
    status: ParsedTrackingStatus,
    isOutsideDhaka: boolean = true
  ): CodSettlementReconciliation {
    const deliveryCharge = isOutsideDhaka ? 120 : 60;
    const codPercent = status.carrier === "pathao" ? 0.5 : isOutsideDhaka ? 1.0 : 0;
    const codSurchargeAmount = Math.round((status.codAmount * codPercent) / 100);
    const netMerchantPayable = Math.max(0, status.codAmount - (deliveryCharge + codSurchargeAmount));

    const isDelivered = status.milestone === "DELIVERED_CASH_COLLECTED";

    return {
      trackingCode: status.trackingCode,
      grossCodCollected: status.codAmount,
      courierDeliveryCharge: deliveryCharge,
      codSurchargeAmount,
      netMerchantPayable,
      settlementStatus: isDelivered ? "READY_FOR_DISBURSEMENT" : "PENDING_DELIVERY",
    };
  }
}
