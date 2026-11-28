import { Router, type Request, type Response } from "express";
import { CreatorGuildsEngine } from "../lib/community/creator-guilds-engine";
import { resolveUserId } from "../middleware/auth.js";

export const creatorGuildsRouter = Router();

creatorGuildsRouter.get("/community/guilds", (_req: Request, res: Response) => {
  const guilds = CreatorGuildsEngine.listGuilds();
  res.json({ success: true, count: guilds.length, guilds });
});

creatorGuildsRouter.post("/community/guilds", async (req: Request, res: Response) => {
  const userId = resolveUserId(req, "usr_default");
  const { name, category, region, initialVolumeBDT, topSuppliers } = req.body;

  if (!name || !category || !region) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: 'name', 'category', and 'region' are mandatory.",
    });
  }

  const validCategories = ["apparel_textile", "electronics_gadgets", "authors_publishing", "agro_commodities"];
  const validRegions = ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "National"];

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
    });
  }

  if (!validRegions.includes(region)) {
    return res.status(400).json({
      success: false,
      error: `Invalid region. Must be one of: ${validRegions.join(", ")}`,
    });
  }

  const newGuild = await CreatorGuildsEngine.createGuild({
    name,
    category,
    region,
    creatorId: userId,
    initialVolumeBDT: initialVolumeBDT ? Number(initialVolumeBDT) : 50000,
    topSuppliers,
  });

  return res.status(201).json({
    success: true,
    guild: newGuild,
  });
});

creatorGuildsRouter.post("/community/guilds/:id/join", (req: Request, res: Response) => {
  const userId = resolveUserId(req, "usr_default");
  const guildId = String(req.params.id ?? "");

  const updated = CreatorGuildsEngine.joinGuild(guildId, userId);
  if (!updated) {
    return res.status(404).json({ success: false, error: `Guild '${guildId}' not found.` });
  }

  return res.status(200).json({
    success: true,
    message: `Successfully joined guild '${updated.name}'.`,
    guild: updated,
  });
});

creatorGuildsRouter.get("/community/suppliers/verified", (_req: Request, res: Response) => {
  const suppliers = CreatorGuildsEngine.listVerifiedSuppliers();
  res.json({ success: true, count: suppliers.length, suppliers });
});
