import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * GET /api/v1/marketplace/agents
 * Returns agent catalog items
 */
router.get("/v1/marketplace/agents", (_req: Request, res: Response) => {
  const catalog = [
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

  return res.status(200).json({
    success: true,
    catalog,
  });
});

/**
 * POST /api/v1/marketplace/install
 * Install custom agent and calculate 80/20 creator revenue split
 */
router.post("/v1/marketplace/install", (req: Request, res: Response) => {
  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ success: false, error: "agentId is required" });
  }

  const priceBdt = 100;
  const creatorPayoutBdt = 80;
  const platformFeeBdt = 20;

  return res.status(200).json({
    success: true,
    agentId,
    creatorPayoutBdt,
    platformFeeBdt,
    timestamp: new Date().toISOString(),
  });
});

export default router;
