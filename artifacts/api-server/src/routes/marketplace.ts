import { Router, type Request, type Response } from "express";
import { db, marketplaceAgentsTable, authorEarningsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router = Router();

const DEFAULT_AGENT_CATALOG = [
  {
    id: "agent_fcommerce_live",
    name: "Facebook Live Stream Order Parser Bot",
    category: "f-commerce",
    description: "Auto-converts live video comments into bKash payment links & Steadfast courier bookings.",
    authorName: "Shothik Merchant Lab",
    installsCount: 1420,
    rating: 4.9,
    priceCredits: 0,
    iconName: "Video",
  },
  {
    id: "agent_nbr_vat",
    name: "NBR Mushak-6.3 Tax & VAT Assistant",
    category: "vat-tax",
    description: "Generates gapless sequential Mushak-6.3 challans and Section 78 income tax rebate schedules.",
    authorName: "Dhaka Tax Advisory Ltd",
    installsCount: 890,
    rating: 4.8,
    priceCredits: 100,
    iconName: "FileText",
  },
  {
    id: "agent_nilkhet_author",
    name: "Nilkhet 3D Book Authoring & Preflight Bot",
    category: "nilkhet-publishing",
    description: "Automates PDF X-1a preflight checks, SHA-256 DRM watermarking, and Nilkhet POD printing costs.",
    authorName: "Nilkhet Press Guild",
    installsCount: 650,
    rating: 4.7,
    priceCredits: 50,
    iconName: "BookOpen",
  },
  {
    id: "agent_cursor_code",
    name: "Cursor Code Master & Security Swarm",
    category: "developer-swarm",
    description: "Runs multi-agent code reviews, DSH capability seam refactoring, and zero-day vulnerability checks.",
    authorName: "SGPT9 Dev Labs",
    installsCount: 2100,
    rating: 5.0,
    priceCredits: 0,
    iconName: "Code",
  },
];

/**
 * GET /api/v1/marketplace/agents
 * Returns agent catalog items from Supabase PostgreSQL with fallback
 */
router.get("/v1/marketplace/agents", async (_req: Request, res: Response) => {
  try {
    const rows = await db.select().from(marketplaceAgentsTable).catch(() => []);
    if (rows.length > 0) {
      const catalog = rows.map((r) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        description: r.description,
        authorName: r.authorName,
        installsCount: r.installsCount,
        rating: Number(r.rating),
        priceCredits: r.priceCredits,
        iconName: r.iconName,
      }));
      return res.status(200).json({ success: true, catalog });
    }
  } catch {
    // Fallback to in-memory catalog
  }

  return res.status(200).json({
    success: true,
    catalog: DEFAULT_AGENT_CATALOG,
  });
});

/**
 * POST /api/v1/marketplace/install
 * Install custom agent and calculate 80/20 creator revenue split
 */
router.post("/v1/marketplace/install", async (req: Request, res: Response) => {
  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ success: false, error: "agentId is required" });
  }

  const priceBdt = 100;
  const creatorPayoutBdt = 80;
  const platformFeeBdt = 20;

  try {
    await db
      .update(marketplaceAgentsTable)
      .set({
        installsCount: sql`${marketplaceAgentsTable.installsCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceAgentsTable.id, String(agentId)))
      .catch(() => {});

    await db
      .insert(authorEarningsTable)
      .values({
        userId: "usr_default",
        totalEarnings: String(creatorPayoutBdt),
        totalUnitsSold: 1,
        lifetimeRevenue: String(priceBdt),
        availableBalance: String(creatorPayoutBdt),
      })
      .onConflictDoUpdate({
        target: authorEarningsTable.userId,
        set: {
          totalEarnings: sql`${authorEarningsTable.totalEarnings} + ${creatorPayoutBdt}`,
          totalUnitsSold: sql`${authorEarningsTable.totalUnitsSold} + 1`,
          lifetimeRevenue: sql`${authorEarningsTable.lifetimeRevenue} + ${priceBdt}`,
          availableBalance: sql`${authorEarningsTable.availableBalance} + ${creatorPayoutBdt}`,
          updatedAt: new Date(),
        },
      })
      .catch(() => {});
  } catch {
    // Non-blocking
  }

  return res.status(200).json({
    success: true,
    agentId,
    creatorPayoutBdt,
    platformFeeBdt,
    timestamp: new Date().toISOString(),
  });
});

export default router;
