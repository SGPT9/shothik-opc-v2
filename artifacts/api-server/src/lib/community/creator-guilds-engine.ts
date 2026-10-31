import { db, creatorGuildsTable } from "@workspace/db";
import { logger } from "../logger";

export interface CreatorGuild {
  guildId: string;
  name: string;
  category: "apparel_textile" | "electronics_gadgets" | "authors_publishing" | "agro_commodities";
  region: "Dhaka" | "Chittagong" | "Sylhet" | "Rajshahi" | "National";
  memberCount: number;
  activePoolOrders: number;
  totalVolumePooledBDT: number;
  topSuppliers: string[];
  createdAt?: string;
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
      createdAt: "2026-01-01T00:00:00Z",
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
      createdAt: "2026-01-10T00:00:00Z",
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
      createdAt: "2026-02-01T00:00:00Z",
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
    return [...this.GUILDS];
  }

  public static listVerifiedSuppliers(): VerifiedSupplierBadge[] {
    return [...this.SUPPLIERS];
  }

  public static async createGuild(params: {
    name: string;
    category: CreatorGuild["category"];
    region: CreatorGuild["region"];
    creatorId?: string;
    initialVolumeBDT?: number;
    topSuppliers?: string[];
  }): Promise<CreatorGuild> {
    const rawTag = params.name
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase();
    const tag = rawTag || "COMMUNITY";
    const guildId = `GUILD-${params.region.toUpperCase()}-${tag}-${Math.floor(100 + Math.random() * 900)}`;

    const newGuild: CreatorGuild = {
      guildId,
      name: params.name,
      category: params.category,
      region: params.region,
      memberCount: 1,
      activePoolOrders: 1,
      totalVolumePooledBDT: params.initialVolumeBDT ?? 50000,
      topSuppliers: params.topSuppliers && params.topSuppliers.length > 0
        ? params.topSuppliers
        : ["Local Verified Artisan Network"],
      createdAt: new Date().toISOString(),
    };

    // Try persisting to PostgreSQL
    try {
      if (db) {
        await db.insert(creatorGuildsTable).values({
          guildId,
          guildName: newGuild.name,
          vertical: newGuild.category,
          regionalHub: newGuild.region,
          memberCount: newGuild.memberCount,
          collectivePoolValueBDT: String(newGuild.totalVolumePooledBDT),
          escrowBadge: "VERIFIED_ESCROW_TIER_1",
          createdAt: new Date(),
        });
      }
    } catch (err: any) {
      logger.warn(`[guilds] DB persist fallback: ${err.message}`);
    }

    this.GUILDS.unshift(newGuild);
    logger.info(`[guilds] Formed new creator guild: ${newGuild.name} (${guildId})`);
    return newGuild;
  }

  public static joinGuild(guildId: string, userId: string): CreatorGuild | null {
    const guild = this.GUILDS.find((g) => g.guildId === guildId);
    if (!guild) return null;

    guild.memberCount += 1;
    logger.info(`[guilds] User ${userId} joined guild ${guildId}. Total members: ${guild.memberCount}`);
    return guild;
  }
}
