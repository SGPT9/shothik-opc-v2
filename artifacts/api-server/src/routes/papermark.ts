import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import {
  sqliteDb,
  ensureTablesInitialized,
  offlinePapermarkLinksTable,
  offlinePapermarkViewsTable,
  type OfflinePapermarkLink,
  type OfflinePapermarkView,
} from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// In-memory resilient fallback cache for ultra-low latency and testing
interface StoredView {
  id: string;
  linkId: string;
  visitorId: string;
  ipHash: string;
  country: string;
  city: string;
  device: string;
  durationSeconds: number;
  pagesViewedJson: string;
  completed: boolean;
  createdAt: number;
}

interface StoredLink {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  documentType: string;
  customSlug: string;
  passcode?: string | null;
  expiresAt?: number | null;
  allowDownload: boolean;
  totalViews: number;
  uniqueVisitors: number;
  avgDurationSec: number;
  completionRate: number;
  createdAt: number;
  updatedAt: number;
}

const memoryLinks = new Map<string, StoredLink>();
const memoryViews = new Map<string, StoredView[]>();

// Seed default sample link if empty for instant out-of-the-box demo
if (memoryLinks.size === 0) {
  const defaultSlug = "shothik-seed-series-a-deck";
  const defaultId = "pm_link_seed_101";
  memoryLinks.set(defaultId, {
    id: defaultId,
    userId: "usr_default",
    documentId: "doc_deck_series_a",
    title: "Shothik AI Series A Pitch Deck (Emerging Markets)",
    documentType: "pitch_deck",
    customSlug: defaultSlug,
    allowDownload: true,
    totalViews: 48,
    uniqueVisitors: 29,
    avgDurationSec: 185,
    completionRate: 86,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  });

  memoryViews.set(defaultId, [
    {
      id: "view_1",
      linkId: defaultId,
      visitorId: "vis_sequoia_sg",
      ipHash: "hash_sq_1",
      country: "Singapore",
      city: "Singapore",
      device: "desktop",
      durationSeconds: 240,
      pagesViewedJson: JSON.stringify([
        { page: 1, durationSec: 30 },
        { page: 2, durationSec: 45 },
        { page: 3, durationSec: 60 },
        { page: 4, durationSec: 55 },
        { page: 5, durationSec: 50 },
      ]),
      completed: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: "view_2",
      linkId: defaultId,
      visitorId: "vis_accelerating_asia",
      ipHash: "hash_aa_2",
      country: "Bangladesh",
      city: "Dhaka",
      device: "desktop",
      durationSeconds: 195,
      pagesViewedJson: JSON.stringify([
        { page: 1, durationSec: 25 },
        { page: 2, durationSec: 40 },
        { page: 3, durationSec: 50 },
        { page: 4, durationSec: 45 },
        { page: 5, durationSec: 35 },
      ]),
      completed: true,
      createdAt: Date.now() - 1000 * 60 * 60 * 12,
    },
    {
      id: "view_3",
      linkId: defaultId,
      visitorId: "vis_angel_investor_bd",
      ipHash: "hash_bd_3",
      country: "Bangladesh",
      city: "Dhaka",
      device: "mobile",
      durationSeconds: 120,
      pagesViewedJson: JSON.stringify([
        { page: 1, durationSec: 20 },
        { page: 2, durationSec: 35 },
        { page: 3, durationSec: 40 },
        { page: 4, durationSec: 25 },
      ]),
      completed: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
  ]);
}

/**
 * Helper to build full public share URL
 */
function buildShareUrl(slug: string): string {
  return `https://papermark.shothik.app/view/${slug}`;
}

/**
 * POST /api/v1/papermark/links
 * Create a new trackable pitch deck or document link
 */
router.post("/v1/papermark/links", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      userId = "usr_default",
      documentId = `doc_${Date.now()}`,
      title = "Untitled Trackable Presentation",
      documentType = "pitch_deck",
      customSlug,
      passcode,
      expiresAt,
      allowDownload = true,
    } = req.body;

    const finalSlug = (
      customSlug ||
      `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomBytes(3).toString("hex")}`
    )
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    const linkId = `pm_link_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const now = Date.now();

    const newLink: StoredLink = {
      id: linkId,
      userId,
      documentId,
      title,
      documentType,
      customSlug: finalSlug,
      passcode: passcode || null,
      expiresAt: expiresAt ? Number(expiresAt) : null,
      allowDownload: Boolean(allowDownload),
      totalViews: 0,
      uniqueVisitors: 0,
      avgDurationSec: 0,
      completionRate: 0,
      createdAt: now,
      updatedAt: now,
    };

    // Save to memory store
    memoryLinks.set(linkId, newLink);
    if (!memoryViews.has(linkId)) {
      memoryViews.set(linkId, []);
    }

    // Attempt persistent SQLite write
    try {
      await ensureTablesInitialized();
      await sqliteDb.insert(offlinePapermarkLinksTable).values({
        id: newLink.id,
        userId: newLink.userId,
        documentId: newLink.documentId,
        title: newLink.title,
        documentType: newLink.documentType,
        customSlug: newLink.customSlug,
        passcode: newLink.passcode,
        expiresAt: newLink.expiresAt,
        allowDownload: newLink.allowDownload,
        totalViews: newLink.totalViews,
        uniqueVisitors: newLink.uniqueVisitors,
        avgDurationSec: newLink.avgDurationSec,
        completionRate: newLink.completionRate,
        createdAt: newLink.createdAt,
        updatedAt: newLink.updatedAt,
      });
    } catch (dbErr) {
      logger.warn({ err: dbErr }, "[Papermark] SQLite write skipped, memory cache active");
    }

    res.status(201).json({
      success: true,
      data: {
        ...newLink,
        shareUrl: buildShareUrl(newLink.customSlug),
        previewUrl: `/p/${newLink.customSlug}`,
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, "[Papermark] Failed to create trackable link");
    res.status(500).json({ success: false, error: error.message || "Failed to create link" });
  }
});

/**
 * GET /api/v1/papermark/links
 * List all trackable links for a user with aggregated summary statistics
 */
router.get("/v1/papermark/links", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req.query.userId as string) || "usr_default";

    // Gather links from memory
    let links: StoredLink[] = Array.from(memoryLinks.values()).filter(
      (l) => l.userId === userId || userId === "all" || l.userId === "usr_default"
    );

    // Try reading from SQLite if empty or user matches
    try {
      await ensureTablesInitialized();
      const dbLinks = await sqliteDb
        .select()
        .from(offlinePapermarkLinksTable)
        .where(eq(offlinePapermarkLinksTable.userId, userId))
        .orderBy(desc(offlinePapermarkLinksTable.createdAt));

      if (dbLinks && dbLinks.length > 0) {
        dbLinks.forEach((dl) => {
          if (!memoryLinks.has(dl.id)) {
            memoryLinks.set(dl.id, dl as unknown as StoredLink);
          }
        });
        links = Array.from(memoryLinks.values()).filter(
          (l) => l.userId === userId || l.userId === "usr_default"
        );
      }
    } catch {
      // Memory fallback is primary
    }

    // Sort by latest
    links.sort((a, b) => b.createdAt - a.createdAt);

    // Calculate aggregated summary KPIs
    const totalLinks = links.length;
    const totalViews = links.reduce((acc, curr) => acc + (curr.totalViews || 0), 0);
    const totalUniqueVisitors = links.reduce((acc, curr) => acc + (curr.uniqueVisitors || 0), 0);
    const avgDurationSec =
      totalLinks > 0
        ? Math.round(links.reduce((acc, curr) => acc + (curr.avgDurationSec || 0), 0) / totalLinks)
        : 0;
    const avgCompletionRate =
      totalLinks > 0
        ? Math.round(links.reduce((acc, curr) => acc + (curr.completionRate || 0), 0) / totalLinks)
        : 0;

    const formattedLinks = links.map((l) => ({
      ...l,
      shareUrl: buildShareUrl(l.customSlug),
      previewUrl: `/p/${l.customSlug}`,
    }));

    res.status(200).json({
      success: true,
      data: {
        links: formattedLinks,
        summary: {
          totalLinks,
          totalViews,
          totalUniqueVisitors,
          avgDurationSec,
          avgCompletionRate,
          engagementScore: Math.min(100, Math.round(avgCompletionRate * 0.6 + (avgDurationSec / 120) * 40)),
        },
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, "[Papermark] Failed to fetch trackable links");
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/papermark/record-view
 * Public webhook to record viewer telemetry (pages viewed, duration, completion)
 */
router.post("/v1/papermark/record-view", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      slug,
      linkId,
      visitorId = `vis_${crypto.randomBytes(4).toString("hex")}`,
      country = "Bangladesh",
      city = "Dhaka",
      device = "desktop",
      durationSeconds = 60,
      pagesViewed = [],
      completed = false,
    } = req.body;

    // Find link by slug or linkId
    let link: StoredLink | undefined;
    if (slug) {
      link = Array.from(memoryLinks.values()).find((l) => l.customSlug === slug);
    } else if (linkId) {
      link = memoryLinks.get(linkId);
    }

    if (!link) {
      res.status(404).json({ success: false, error: "Trackable share link not found" });
      return;
    }

    const viewId = `view_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
    const ipHash = crypto.createHash("sha256").update(visitorId + country).digest("hex").slice(0, 16);
    const pagesViewedJson = JSON.stringify(pagesViewed);

    const newView: StoredView = {
      id: viewId,
      linkId: link.id,
      visitorId,
      ipHash,
      country,
      city,
      device,
      durationSeconds: Number(durationSeconds),
      pagesViewedJson,
      completed: Boolean(completed),
      createdAt: Date.now(),
    };

    // Store view
    const views = memoryViews.get(link.id) || [];
    views.push(newView);
    memoryViews.set(link.id, views);

    // Recompute link analytics
    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map((v) => v.visitorId)).size;
    const avgDurationSec = Math.round(
      views.reduce((acc, v) => acc + (v.durationSeconds || 0), 0) / totalViews
    );
    const completedCount = views.filter((v) => v.completed).length;
    const completionRate = Math.round((completedCount / totalViews) * 100);

    link.totalViews = totalViews;
    link.uniqueVisitors = uniqueVisitors;
    link.avgDurationSec = avgDurationSec;
    link.completionRate = completionRate;
    link.updatedAt = Date.now();

    // Persist to SQLite
    try {
      await ensureTablesInitialized();
      await sqliteDb.insert(offlinePapermarkViewsTable).values({
        id: newView.id,
        linkId: newView.linkId,
        visitorId: newView.visitorId,
        ipHash: newView.ipHash,
        country: newView.country,
        city: newView.city,
        device: newView.device,
        durationSeconds: newView.durationSeconds,
        pagesViewedJson: newView.pagesViewedJson,
        completed: newView.completed,
        createdAt: newView.createdAt,
      });

      await sqliteDb
        .update(offlinePapermarkLinksTable)
        .set({
          totalViews,
          uniqueVisitors,
          avgDurationSec,
          completionRate,
          updatedAt: link.updatedAt,
        })
        .where(eq(offlinePapermarkLinksTable.id, link.id));
    } catch {
      // Memory persistence active
    }

    res.status(200).json({
      success: true,
      data: {
        ...link,
        recordedViewId: viewId,
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, "[Papermark] Failed to record view telemetry");
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/papermark/links/:id/analytics
 * Get detailed page heatmap and visitor analytics for a specific link
 */
router.get("/v1/papermark/links/:id/analytics", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const link = memoryLinks.get(id);

    if (!link) {
      res.status(404).json({ success: false, error: "Link not found or has been revoked" });
      return;
    }

    const views = memoryViews.get(id) || [];

    // Aggregate page heatmap
    const pageStats = new Map<number, { page: number; totalViews: number; totalDurationSec: number }>();

    views.forEach((v) => {
      try {
        const pages: Array<{ page: number; durationSec: number }> = JSON.parse(v.pagesViewedJson || "[]");
        pages.forEach((p) => {
          const current = pageStats.get(p.page) || { page: p.page, totalViews: 0, totalDurationSec: 0 };
          current.totalViews += 1;
          current.totalDurationSec += p.durationSec || 0;
          pageStats.set(p.page, current);
        });
      } catch {
        // Fallback for malformed JSON
      }
    });

    const pageHeatmap = Array.from(pageStats.values())
      .sort((a, b) => a.page - b.page)
      .map((ps) => ({
        page: ps.page,
        totalViews: ps.totalViews,
        avgDurationSec: ps.totalViews > 0 ? Math.round(ps.totalDurationSec / ps.totalViews) : 0,
        attentionIndex: Math.min(100, Math.round(((ps.totalDurationSec / ps.totalViews || 0) / 60) * 100)),
      }));

    // Device breakdown
    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0 };
    views.forEach((v) => {
      const d = (v.device || "desktop").toLowerCase();
      if (d in deviceCounts) {
        (deviceCounts as any)[d] += 1;
      } else {
        deviceCounts.desktop += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        link: {
          ...link,
          shareUrl: buildShareUrl(link.customSlug),
        },
        pageHeatmap,
        deviceBreakdown: deviceCounts,
        visitors: views.map((v) => ({
          id: v.id,
          visitorId: v.visitorId,
          country: v.country,
          city: v.city,
          device: v.device,
          durationSeconds: v.durationSeconds,
          completed: v.completed,
          createdAt: v.createdAt,
        })),
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, "[Papermark] Failed to fetch link analytics");
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/v1/papermark/links/:id
 * Revoke or delete a trackable link
 */
router.delete("/v1/papermark/links/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const exists = memoryLinks.has(id);

    if (!exists) {
      res.status(404).json({ success: false, error: "Link not found" });
      return;
    }

    memoryLinks.delete(id);
    memoryViews.delete(id);

    try {
      await ensureTablesInitialized();
      await sqliteDb.delete(offlinePapermarkLinksTable).where(eq(offlinePapermarkLinksTable.id, id));
      await sqliteDb.delete(offlinePapermarkViewsTable).where(eq(offlinePapermarkViewsTable.linkId, id));
    } catch {
      // Memory deletion succeeded
    }

    res.status(200).json({
      success: true,
      message: "Trackable share link revoked successfully",
    });
  } catch (error: any) {
    logger.error({ err: error }, "[Papermark] Failed to delete link");
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
