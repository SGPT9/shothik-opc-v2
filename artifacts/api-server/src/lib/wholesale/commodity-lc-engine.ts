import { createHash } from "node:crypto";

export interface CommodityTickerItem {
  commodityId: string;
  name: string;
  marketLocation: "Khatunganj (CTG)" | "Chawkbazar (DHK)" | "Narsingdi Hub" | "Nilkhet Press Hub";
  unit: string;
  currentPriceBDT: number;
  change24hPercent: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export interface InlandLCContract {
  lcNumber: string;
  applicantBuyerName: string;
  applicantBuyerPhone: string;
  beneficiarySellerName: string;
  beneficiarySellerPhone: string;
  commodityName: string;
  quantity: number;
  unitPriceBDT: number;
  totalEscrowAmountBDT: number;
  courierTrackingNumber?: string;
  escrowStatus: "funds_locked" | "goods_dispatched" | "delivered_and_released" | "dispute_hold";
  regulatoryCompliance: "Bangladesh Bank Guidelines on Inland Letter of Credit & Escrow";
  sha256LienSeal: string;
  createdAt: string;
}

export class CommodityLCEngine {
  private static readonly COMMODITY_TICKERS: CommodityTickerItem[] = [
    {
      commodityId: "COMM-YARN-30S",
      name: "100% Carded Cotton Yarn 30s",
      marketLocation: "Narsingdi Hub",
      unit: "Per Pound (lb)",
      currentPriceBDT: 345,
      change24hPercent: 1.8,
      trend: "up",
      lastUpdated: new Date().toISOString(),
    },
    {
      commodityId: "COMM-THERMAL-ROLL",
      name: "Thermal POS Paper Roll 80mm x 70m",
      marketLocation: "Nilkhet Press Hub",
      unit: "Carton (50 rolls)",
      currentPriceBDT: 2400,
      change24hPercent: -0.5,
      trend: "stable",
      lastUpdated: new Date().toISOString(),
    },
    {
      commodityId: "COMM-COURIER-FLYER",
      name: "Tamper-Evident Poly Courier Flyer (Large)",
      marketLocation: "Chawkbazar (DHK)",
      unit: "Pack (1,000 pcs)",
      currentPriceBDT: 3200,
      change24hPercent: -2.1,
      trend: "down",
      lastUpdated: new Date().toISOString(),
    },
    {
      commodityId: "COMM-FAST-CHARGER-20W",
      name: "PD 20W Fast Charger Wholesale Bundle",
      marketLocation: "Khatunganj (CTG)",
      unit: "Box (100 pcs)",
      currentPriceBDT: 22000,
      change24hPercent: 3.4,
      trend: "up",
      lastUpdated: new Date().toISOString(),
    },
  ];

  public static listCommodityTickers(): CommodityTickerItem[] {
    return this.COMMODITY_TICKERS;
  }

  public static issueInlandLC(params: {
    buyerName: string;
    buyerPhone: string;
    sellerName: string;
    sellerPhone: string;
    commodityName: string;
    quantity: number;
    unitPriceBDT: number;
  }): InlandLCContract {
    const lcNumber = `ILC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const totalAmount = Math.round(params.quantity * params.unitPriceBDT);

    const sealPayload = JSON.stringify({
      lcNumber,
      buyer: params.buyerPhone,
      seller: params.sellerPhone,
      totalAmount,
      timestamp: new Date().toISOString(),
    });

    const sha256LienSeal = createHash("sha256").update(sealPayload).digest("hex");

    return {
      lcNumber,
      applicantBuyerName: params.buyerName,
      applicantBuyerPhone: params.buyerPhone,
      beneficiarySellerName: params.sellerName,
      beneficiarySellerPhone: params.sellerPhone,
      commodityName: params.commodityName,
      quantity: params.quantity,
      unitPriceBDT: params.unitPriceBDT,
      totalEscrowAmountBDT: totalAmount,
      escrowStatus: "funds_locked",
      regulatoryCompliance: "Bangladesh Bank Guidelines on Inland Letter of Credit & Escrow",
      sha256LienSeal,
      createdAt: new Date().toISOString(),
    };
  }
}
