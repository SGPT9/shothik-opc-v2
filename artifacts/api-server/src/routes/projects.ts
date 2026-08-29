import { Router, type Request, type Response } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import { projectsTable, writingAutosaveTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { idempotencyMiddleware } from "../lib/idempotency/idempotency-service";

const router = Router();

// ---------------------------------------------------------------------------
// Projects CRUD
// ---------------------------------------------------------------------------

/**
 * GET /api/v1/projects
 * List all projects for the authenticated user.
 * Falls back to guest identity from x-user-id header.
 */
router.get("/v1/projects", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "guest";
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId))
      .orderBy(desc(projectsTable.updatedAt))
      .catch(() => []);

    res.json({ success: true, data: projects || [] });
  } catch (err: any) {
    logger.error({ err }, "Failed to list projects");
    res.json({ success: true, data: [] });
  }
});

/**
 * GET /api/v1/projects/:id
 * Get a single project by ID.
 */
router.get("/v1/projects/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    res.json({ success: true, data: project });
  } catch (err: any) {
    logger.error({ err }, "Failed to get project");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects
 * Create a new project.
 * Guarded by IETF Idempotency-Key.
 */
router.post("/v1/projects", idempotencyMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "guest";
    const { title, type, template, description, sections, settings } = req.body;

    if (!title || !type) {
      res.status(400).json({ success: false, error: "title and type are required" });
      return;
    }

    const [project] = await db
      .insert(projectsTable)
      .values({
        userId,
        title,
        type,
        template: template || null,
        description: description || "",
        sections: sections || [],
        settings: settings || {},
      })
      .returning();

    res.status(201).json({ success: true, data: project });
  } catch (err: any) {
    logger.error({ err }, "Failed to create project");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/v1/projects/:id
 * Update a project by ID.
 */
router.patch("/v1/projects/:id", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "guest";
    const id = String(req.params.id);
    const updates: Record<string, unknown> = {};

    // Only apply fields that are explicitly sent
    const allowedFields = [
      "title", "description", "content", "wordCount",
      "progress", "starred", "sections", "settings",
    ] as const;

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(projectsTable)
      .set(updates)
      .where(eq(projectsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    res.json({ success: true, data: updated });
  } catch (err: any) {
    logger.error({ err }, "Failed to update project");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/v1/projects/:id
 * Delete a project by ID.
 */
router.delete("/v1/projects/:id", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const [deleted] = await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    res.json({ success: true, data: { id: deleted.id } });
  } catch (err: any) {
    logger.error({ err }, "Failed to delete project");
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Writing Autosave
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/writing/autosave
 * Upsert an autosave snapshot for a given localProjectId.
 */
router.post("/v1/writing/autosave", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "guest";
    const { localProjectId, content, wordCount } = req.body;

    if (!localProjectId) {
      res.status(400).json({ success: false, error: "localProjectId is required" });
      return;
    }

    // Upsert: insert or update on conflict (userId + localProjectId unique index)
    const [saved] = await db
      .insert(writingAutosaveTable)
      .values({
        userId,
        localProjectId,
        content: content || "",
        wordCount: wordCount || 0,
      })
      .onConflictDoUpdate({
        target: [writingAutosaveTable.userId, writingAutosaveTable.localProjectId],
        set: {
          content: content || "",
          wordCount: wordCount || 0,
          savedAt: new Date(),
        },
      })
      .returning();

    res.json({ success: true, data: saved });
  } catch (err: any) {
    logger.error({ err }, "Failed to autosave writing");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/writing/autosave/:localProjectId
 * Retrieve the latest autosave for a given project.
 */
router.get("/v1/writing/autosave/:localProjectId", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "guest";
    const localProjectId = String(req.params.localProjectId);

    const rows = await db
      .select()
      .from(writingAutosaveTable)
      .where(eq(writingAutosaveTable.localProjectId, localProjectId));

    const match = rows.find((r) => r.userId === userId);
    res.json({ success: true, data: match || null });
  } catch (err: any) {
    logger.error({ err }, "Failed to get autosave");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/writing/sections
 * Save sections for a project (used during localStorage → Postgres migration).
 */
router.post("/v1/writing/sections", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "guest";
    const { localProjectId, sections } = req.body;

    if (!localProjectId) {
      res.status(400).json({ success: false, error: "localProjectId is required" });
      return;
    }

    // Store sections as autosave content with metadata
    const [saved] = await db
      .insert(writingAutosaveTable)
      .values({
        userId,
        localProjectId,
        content: JSON.stringify({ sections }),
        wordCount: 0,
      })
      .onConflictDoUpdate({
        target: [writingAutosaveTable.userId, writingAutosaveTable.localProjectId],
        set: {
          content: JSON.stringify({ sections }),
          savedAt: new Date(),
        },
      })
      .returning();

    res.json({ success: true, data: saved });
  } catch (err: any) {
    logger.error({ err }, "Failed to save sections");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/writing/sections/:localProjectId
 * Retrieve saved sections for a project.
 */
router.get("/v1/writing/sections/:localProjectId", async (req: Request, res: Response) => {
  try {
    const userId = (req.headers["x-user-id"] as string) || "guest";
    const localProjectId = String(req.params.localProjectId);

    const rows = await db
      .select()
      .from(writingAutosaveTable)
      .where(eq(writingAutosaveTable.localProjectId, localProjectId));

    const match = rows.find((r) => r.userId === userId);
    if (!match) {
      res.json({ success: true, data: null });
      return;
    }

    try {
      const parsed = JSON.parse(match.content);
      res.json({ success: true, data: parsed.sections || parsed });
    } catch {
      res.json({ success: true, data: null });
    }
  } catch (err: any) {
    logger.error({ err }, "Failed to get sections");
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
