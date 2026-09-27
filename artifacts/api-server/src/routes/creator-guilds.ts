import { Router } from "express";
import { CreatorGuildsEngine } from "../lib/community/creator-guilds-engine";

export const creatorGuildsRouter = Router();

creatorGuildsRouter.get("/community/guilds", (_req, res) => {
  const guilds = CreatorGuildsEngine.listGuilds();
  res.json({ success: true, count: guilds.length, guilds });
});

creatorGuildsRouter.get("/community/suppliers/verified", (_req, res) => {
  const suppliers = CreatorGuildsEngine.listVerifiedSuppliers();
  res.json({ success: true, count: suppliers.length, suppliers });
});
