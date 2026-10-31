import { Router, type Request, type Response } from "express";
import crypto from "crypto";
import { eq, desc, or } from "drizzle-orm";
import { db } from "@workspace/db";
import { projectsTable, writingAutosaveTable } from "@workspace/db";
import { logger } from "../lib/logger";
import { idempotencyMiddleware } from "../lib/idempotency/idempotency-service";
import { resolveUserId } from "../middleware/auth.js";
import { CrdtSyncProvider } from "../lib/realtime/crdt-sync-provider.js";
import { AuthorshipCertificateEngine } from "../lib/security/authorship-certificate-engine.js";

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
    const userId = resolveUserId(req);
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
    const userId = resolveUserId(req);
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
    const userId = resolveUserId(req);
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
    const userId = resolveUserId(req);
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
    const userId = resolveUserId(req);
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
    const userId = resolveUserId(req);
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
    const userId = resolveUserId(req);
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

// ---------------------------------------------------------------------------
// Figma/Miro-Style Room Links & "Git for Writers" Plot Branching
// ---------------------------------------------------------------------------

/**
 * POST /api/v1/projects/create-share-link
 * Generate or retrieve a shareable Figma/Miro-style room link.
 */
router.post("/v1/projects/create-share-link", async (req: Request, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const { projectId, accessMode = "link_edit", passcode } = req.body;

    if (!projectId) {
      res.status(400).json({ success: false, error: "projectId is required" });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    const shareToken = project.shareToken || `prj_sh_${crypto.randomBytes(4).toString("hex")}`;
    const passcodeHash = passcode ? crypto.createHash("sha256").update(passcode).digest("hex") : project.passcodeHash;

    const [updated] = await db
      .update(projectsTable)
      .set({
        shareToken,
        accessMode,
        passcodeHash,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, projectId))
      .returning();

    const shareUrl = `/studio?room=${shareToken}`;

    res.json({
      success: true,
      data: {
        projectId: updated.id,
        shareToken: updated.shareToken,
        accessMode: updated.accessMode,
        shareUrl,
      },
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to create share link");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/branches
 * Create a 'Git for Writers' alternative storyline branch.
 */
router.post("/v1/projects/branches", async (req: Request, res: Response) => {
  try {
    const userId = resolveUserId(req);
    const { parentProjectId, branchName } = req.body;

    if (!parentProjectId || !branchName) {
      res.status(400).json({ success: false, error: "parentProjectId and branchName are required" });
      return;
    }

    const [parent] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, parentProjectId));

    if (!parent) {
      res.status(404).json({ success: false, error: "Parent project not found" });
      return;
    }

    const lineageRootId = parent.lineageRootId || parent.id;
    const branchTitle = `${parent.title} (Branch: ${branchName})`;

    const [branch] = await db
      .insert(projectsTable)
      .values({
        userId,
        title: branchTitle,
        type: parent.type,
        template: parent.template,
        description: parent.description,
        content: parent.content,
        sections: parent.sections,
        settings: parent.settings,
        wordCount: parent.wordCount,
        progress: parent.progress,
        parentProjectId: parent.id,
        branchName,
        lineageRootId,
      })
      .returning();

    res.status(201).json({ success: true, data: branch });
  } catch (err: any) {
    logger.error({ err }, "Failed to create plot branch");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/v1/projects/:id/branches
 * List all branches across the lineage for a given project.
 */
router.get("/v1/projects/:id/branches", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);

    const [target] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!target) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    const rootId = target.lineageRootId || target.id;

    const branches = await db
      .select()
      .from(projectsTable)
      .where(or(eq(projectsTable.parentProjectId, rootId), eq(projectsTable.lineageRootId, rootId), eq(projectsTable.id, rootId)))
      .orderBy(desc(projectsTable.updatedAt));

    res.json({ success: true, data: branches });
  } catch (err: any) {
    logger.error({ err }, "Failed to list project branches");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/branches/:branchId/merge
 * Reconcile and merge an alternative plot branch back into the canonical draft.
 */
router.post("/v1/projects/:id/branches/:branchId/merge", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const branchId = String(req.params.branchId);

    const [target] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!target) {
      res.status(404).json({ success: false, error: "Canonical project not found" });
      return;
    }

    const [branch] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, branchId));

    if (!branch) {
      res.status(404).json({ success: false, error: "Branch project not found" });
      return;
    }

    const mergeResult = CrdtSyncProvider.mergeText(
      target.content || "",
      branch.content || ""
    );

    const [updated] = await db
      .update(projectsTable)
      .set({
        content: mergeResult.mergedText,
        wordCount: mergeResult.mergedText.trim() ? mergeResult.mergedText.trim().split(/\s+/).length : 0,
        updatedAt: new Date(),
      })
      .where(eq(projectsTable.id, target.id))
      .returning();

    res.json({
      success: true,
      data: {
        mergedProject: updated,
        branchId: branch.id,
        mergeResult,
      },
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to merge plot branch");
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/authorship-certificate
 * Issues an immutable, cryptographically signed Authorship Certificate anchored in audit history.
 */
router.post("/v1/projects/:id/authorship-certificate", async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = resolveUserId(req);

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    const certificate = AuthorshipCertificateEngine.createCertificate({
      projectId: project.id,
      title: project.title,
      authorId: userId,
      content: project.content || "",
      createdAt: project.createdAt ? new Date(project.createdAt) : undefined,
    });

    res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (err: any) {
    logger.error({ err }, "Failed to generate authorship certificate");
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
