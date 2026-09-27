import { createHash, randomUUID } from "node:crypto";

export interface ChannelStockAllocation {
  daraz: number;
  shopify: number;
  woocommerce: number;
  whatsapp: number;
  darkHubReserve: number;
}

export interface InventoryItem {
  sku: string;
  name: string;
  category: string;
  unitCostBdt: number;
  sellingPriceBdt: number;
  totalStock: number;
  channels: ChannelStockAllocation;
  leadTimeDays: number;
  supplier: { name: string; phone: string; location: string };
  updatedAt: string;
}

export interface StockOutPrediction {
  sku: string;
  name: string;
  currentStock: number;
  dailySalesVelocity: number; // units/day
  daysRemaining: number;
  recommendedReorderQty: number;
  status: "HEALTHY" | "REORDER_SOON" | "CRITICAL_STOCKOUT";
  leadTimeDays: number;
}

export interface DarkHubStock {
  hubId: string;
  hubName: string;
  location: string;
  allocatedStock: number;
  dailyDemand: number;
  daysRemaining: number;
}

export interface HubTransferRecommendation {
  sourceHubId: string;
  sourceHubName: string;
  targetHubId: string;
  targetHubName: string;
  sku: string;
  transferQuantity: number;
  reason: string;
}

export interface PurchaseOrder {
  poNumber: string;
  supplier: { name: string; phone: string; location: string };
  buyer: { name: string; binNumber: string; deliveryHub: string };
  items: Array<{ sku: string; name: string; quantity: number; unitCostBdt: number; totalCostBdt: number }>;
  totalAmountBdt: number;
  advancePaymentBdt: number;
  signedHashSeal: string;
  createdAt: string;
}

export class InventoryMatrixEngine {
  private items = new Map<string, InventoryItem>();
  private purchaseOrders = new Map<string, PurchaseOrder>();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const defaultItems: InventoryItem[] = [
      {
        sku: "SHOTHIK-TSHIRT-BLK-M",
        name: "Premium Cotton Knitted T-Shirt (Black, M)",
        category: "Apparel",
        unitCostBdt: 280,
        sellingPriceBdt: 650,
        totalStock: 320,
        channels: { daraz: 100, shopify: 80, woocommerce: 40, whatsapp: 60, darkHubReserve: 40 },
        leadTimeDays: 7,
        supplier: { name: "Babu Bazar Knitwear Ltd", phone: "01711223344", location: "Babu Bazar, Dhaka" },
        updatedAt: new Date().toISOString(),
      },
      {
        sku: "SHOTHIK-BAG-LTH-01",
        name: "Artisan Leather Office Messenger Bag",
        category: "Leather Goods",
        unitCostBdt: 1850,
        sellingPriceBdt: 3800,
        totalStock: 45,
        channels: { daraz: 15, shopify: 12, woocommerce: 8, whatsapp: 5, darkHubReserve: 5 },
        leadTimeDays: 14,
        supplier: { name: "Hazaribagh Leather Craft", phone: "01822334455", location: "Hazaribagh, Dhaka" },
        updatedAt: new Date().toISOString(),
      },
      {
        sku: "SHOTHIK-SMART-CHG-65W",
        name: "GaN Fast Charger 65W Dual USB-C",
        category: "Electronics",
        unitCostBdt: 750,
        sellingPriceBdt: 1650,
        totalStock: 18,
        channels: { daraz: 8, shopify: 4, woocommerce: 2, whatsapp: 2, darkHubReserve: 2 },
        leadTimeDays: 10,
        supplier: { name: "Stadium Market Electronics", phone: "01933445566", location: "Baitul Mukarram, Dhaka" },
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const it of defaultItems) {
      this.items.set(it.sku, it);
    }
  }

  listItems(): InventoryItem[] {
    return Array.from(this.items.values());
  }

  getItem(sku: string): InventoryItem | null {
    return this.items.get(sku) || null;
  }

  updateChannelAllocation(sku: string, channels: ChannelStockAllocation): InventoryItem {
    const item = this.getItem(sku);
    if (!item) throw new Error("SKU not found");

    const sum = channels.daraz + channels.shopify + channels.woocommerce + channels.whatsapp + channels.darkHubReserve;
    item.channels = channels;
    item.totalStock = sum;
    item.updatedAt = new Date().toISOString();
    this.items.set(sku, item);
    return item;
  }

  predictStockOut(sku: string, past30DaysUnitsSold = 60): StockOutPrediction {
    const item = this.getItem(sku);
    if (!item) throw new Error("SKU not found");

    const velocity = Math.max(0.1, Math.round((past30DaysUnitsSold / 30) * 100) / 100);
    const daysRemaining = Math.round((item.totalStock / velocity) * 10) / 10;

    let status: StockOutPrediction["status"] = "HEALTHY";
    if (daysRemaining <= item.leadTimeDays) {
      status = "CRITICAL_STOCKOUT";
    } else if (daysRemaining <= item.leadTimeDays + 7) {
      status = "REORDER_SOON";
    }

    const targetStockDays = 30;
    const recommendedReorderQty = Math.max(0, Math.round((targetStockDays - daysRemaining) * velocity));

    return {
      sku: item.sku,
      name: item.name,
      currentStock: item.totalStock,
      dailySalesVelocity: velocity,
      daysRemaining,
      recommendedReorderQty,
      status,
      leadTimeDays: item.leadTimeDays,
    };
  }

  rebalanceDarkStores(sku: string): { hubs: DarkHubStock[]; recommendations: HubTransferRecommendation[] } {
    const item = this.getItem(sku);
    if (!item) throw new Error("SKU not found");

    const hubs: DarkHubStock[] = [
      { hubId: "HUB_TEJGAON", hubName: "Tejgaon Central Hub", location: "Tejgaon I/A", allocatedStock: Math.round(item.totalStock * 0.6), dailyDemand: 4.5, daysRemaining: 0 },
      { hubId: "HUB_DHANMONDI", hubName: "Dhanmondi Express Hub", location: "Dhanmondi 27", allocatedStock: Math.round(item.totalStock * 0.2), dailyDemand: 6.0, daysRemaining: 0 },
      { hubId: "HUB_BANANI", hubName: "Banani Boutique Hub", location: "Banani Road 11", allocatedStock: Math.round(item.totalStock * 0.1), dailyDemand: 2.0, daysRemaining: 0 },
      { hubId: "HUB_CTG_GEC", hubName: "Chittagong Regional Hub", location: "GEC Circle, CTG", allocatedStock: Math.round(item.totalStock * 0.1), dailyDemand: 1.5, daysRemaining: 0 },
    ];

    for (const h of hubs) {
      h.daysRemaining = Math.round((h.allocatedStock / h.dailyDemand) * 10) / 10;
    }

    const recommendations: HubTransferRecommendation[] = [];
    const dhanmondi = hubs.find((h) => h.hubId === "HUB_DHANMONDI");
    const tejgaon = hubs.find((h) => h.hubId === "HUB_TEJGAON");

    if (dhanmondi && tejgaon && dhanmondi.daysRemaining < 15 && tejgaon.allocatedStock > 50) {
      recommendations.push({
        sourceHubId: tejgaon.hubId,
        sourceHubName: tejgaon.hubName,
        targetHubId: dhanmondi.hubId,
        targetHubName: dhanmondi.hubName,
        sku: item.sku,
        transferQuantity: 25,
        reason: `Dhanmondi Hub stock is lower (${dhanmondi.daysRemaining} days remaining vs ${tejgaon.daysRemaining} days at Central). Transfer 25 units from Tejgaon Central.`,
      });
    }

    return { hubs, recommendations };
  }

  createPurchaseOrder(params: {
    sku: string;
    quantity: number;
    deliveryHub?: string;
    advancePercent?: number;
  }): PurchaseOrder {
    const item = this.getItem(params.sku);
    if (!item) throw new Error("SKU not found");

    const poNumber = `PO-${randomUUID().slice(0, 8).toUpperCase()}`;
    const totalCostBdt = params.quantity * item.unitCostBdt;
    const advancePaymentBdt = Math.round((totalCostBdt * (params.advancePercent || 30)) / 100);
    const createdAt = new Date().toISOString();

    const hashData = `${poNumber}:${item.sku}:${params.quantity}:${totalCostBdt}:${createdAt}`;
    const signedHashSeal = createHash("sha256").update(hashData).digest("hex");

    const po: PurchaseOrder = {
      poNumber,
      supplier: item.supplier,
      buyer: { name: "Shothik OPC Merchant", binNumber: "001234567-0101", deliveryHub: params.deliveryHub || "Tejgaon Central Hub" },
      items: [{ sku: item.sku, name: item.name, quantity: params.quantity, unitCostBdt: item.unitCostBdt, totalCostBdt }],
      totalAmountBdt: totalCostBdt,
      advancePaymentBdt,
      signedHashSeal,
      createdAt,
    };

    this.purchaseOrders.set(poNumber, po);
    return po;
  }

  getPurchaseOrder(poNumber: string): PurchaseOrder | null {
    return this.purchaseOrders.get(poNumber) || null;
  }
}

export const globalInventoryEngine = new InventoryMatrixEngine();
