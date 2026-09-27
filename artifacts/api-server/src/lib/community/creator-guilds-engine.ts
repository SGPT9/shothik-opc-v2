export interface CreatorGuild {
  guildId: string;
  name: string;
  category: "apparel_textile" | "electronics_gadgets" | "authors_publishing" | "agro_commodities";
  region: "Dhaka" | "Chittagong" | "Sylhet" | "Rajshahi" | "National";
  memberCount: number;
  activePoolOrders: number;
  totalVolumePooledBDT: number;
  topSuppliers: string[];
}

export interface VerifiedSupplierBadge {
  supplierId: string;
  name: string;
  location: string;
  trustScore: number; // 0-100
  tier: "PLATINUM_VERIFIED" | "GOLD_VERIFIED" | "COMMUNITY_ENDORSED";
  historicalFulfillmentRate: number; // e.g. 98.5%
  totalSettledThroughEscrowBDT: number;
  badgeIssuedAt: string;
}

export class CreatorGuildsEngine {
  private static readonly GUILDS: CreatorGuild[] = [
    {
      guildId: "GUILD-DHK-GARMENTS",
      name: "Dhaka Ready-Made Garments & Panjabi Guild",
      category: "apparel_textile",
      region: "Dhaka",
      memberCount: 420,
      activePoolOrders: 8,
      totalVolumePooledBDT: 4500000,
      topSuppliers: ["Narsingdi Weaving Mill", "Islam Garments Syndicate"],
    },
    {
      guildId: "GUILD-CTG-ELECTRONICS",
      name: "Chittagong Gadget & Mobile Accessory Guild",
      category: "electronics_gadgets",
      region: "Chittagong",
      memberCount: 310,
      activePoolOrders: 5,
      totalVolumePooledBDT: 6200000,
      topSuppliers: ["Agrabad Electronics Hub", "Khatunganj Importers"],
    },
    {
      guildId: "GUILD-BOIMELA-AUTHORS",
      name: "BoiMela Novelists & Academic Writers Guild",
      category: "authors_publishing",
      region: "National",
      memberCount: 185,
      activePoolOrders: 12,
      totalVolumePooledBDT: 1850000,
      topSuppliers: ["Nilkhet Offset Press Syndicate", "Bangla Academy Press"],
    },
  ];

  private static readonly SUPPLIERS: VerifiedSupplierBadge[] = [
    {
      supplierId: "SUPP-NARSINGDI-TEXTILE",
      name: "Narsingdi Heritage Weaving Mills Ltd",
      location: "Narsingdi Textile Hub",
      trustScore: 98,
      tier: "PLATINUM_VERIFIED",
      historicalFulfillmentRate: 99.2,
      totalSettledThroughEscrowBDT: 12500000,
      badgeIssuedAt: "2026-01-15T00:00:00Z",
    },
    {
      supplierId: "SUPP-CHAWKBAZAR-POLY",
      name: "Chawkbazar Master Packaging Syndicate",
      location: "Old Dhaka",
      trustScore: 94,
      tier: "GOLD_VERIFIED",
      historicalFulfillmentRate: 97.5,
      totalSettledThroughEscrowBDT: 8400000,
      badgeIssuedAt: "2026-02-10T00:00:00Z",
    },
  ];

  public static listGuilds(): CreatorGuild[] {
    return this.GUILDS;
  }

  public static listVerifiedSuppliers(): VerifiedSupplierBadge[] {
    return this.SUPPLIERS;
  }
}
