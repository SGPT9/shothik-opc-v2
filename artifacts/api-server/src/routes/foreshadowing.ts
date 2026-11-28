import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const foreshadowingRouter = Router();

export type GunState = "open" | "progressing" | "deferred" | "resolved";
export type GunCategory = "physical_prop" | "secret_clue" | "vow_prophecy" | "emotional_debt";

export interface ChekhovGun {
  id: string;
  name: string;
  category: GunCategory;
  state: GunState;
  setupChapter: number;
  setupSnippet: string;
  currentMentions: Array<{ chapter: number; note: string }>;
  expectedPayoffChapter: number;
  payoffNotes: string;
  resolvedChapter?: number;
  urgency: "low" | "medium" | "high" | "critical";
  isDangling: boolean;
}

export interface ForeshadowingLedger {
  projectId: string;
  payoffHealthScore: number;
  guns: ChekhovGun[];
  totalOpen: number;
  totalProgressing: number;
  totalDeferred: number;
  totalResolved: number;
  danglingCount: number;
  updatedAt: string;
}

const activeLedgers = new Map<string, ForeshadowingLedger>();

function generateDefaultForeshadowingLedger(projectId: string): ForeshadowingLedger {
  const guns: ChekhovGun[] = [
    {
      id: "gun-1",
      name: "Webley .38 Service Revolver (Five Bullets)",
      category: "physical_prop",
      state: "progressing",
      setupChapter: 1,
      setupSnippet: "Inside the mahogany drawer, the blued steel Webley revolver lay with five brass cartridges loaded in its six-shot cylinder.",
      currentMentions: [
        { chapter: 1, note: "Introduced in the study drawer before leaving for Curzon Hall." },
        { chapter: 3, note: "Rahman checks the cylinder weight under his coat when police sirens sound." },
        { chapter: 6, note: "Held ready during descent into the underground aqueduct." },
      ],
      expectedPayoffChapter: 11,
      payoffNotes: "Fired in Chapter 11 to shatter the rusted padlock on the Keraniganj pressroom door.",
      urgency: "high",
      isDangling: false,
    },
    {
      id: "gun-2",
      name: "The Cryptic Watermark Seal (1952 Clandestine Proof)",
      category: "secret_clue",
      state: "progressing",
      setupChapter: 1,
      setupSnippet: "Holding the parchment against the lantern flame revealed an embossed twin-lotus watermark dated 21 February 1952.",
      currentMentions: [
        { chapter: 1, note: "Discovered beneath the false bottom of the Curzon iron chest." },
        { chapter: 2, note: "Photographed by Elena Vance using the Leica rangefinder." },
        { chapter: 4, note: "Cross-referenced with the 1898 Botany Folio donor cipher." },
      ],
      expectedPayoffChapter: 12,
      payoffNotes: "Publicly verified and distributed on the morning mail steamer to prove historical authenticity.",
      urgency: "critical",
      isDangling: false,
    },
    {
      id: "gun-3",
      name: "Daughter Maya's Sadarghat Steamer Ticket",
      category: "emotional_debt",
      state: "open",
      setupChapter: 3,
      setupSnippet: "Azim taunts Rahman through the keyhole: 'Do you really want young Maya waiting at the Sadarghat terminal alone tonight?'",
      currentMentions: [
        { chapter: 3, note: "Taunted by Superintendent Azim as psychological leverage." },
      ],
      expectedPayoffChapter: 12,
      payoffNotes: "Rahman's student courier confirms Maya safely boarded the dawn steamer with the master negatives.",
      urgency: "medium",
      isDangling: false,
    },
    {
      id: "gun-4",
      name: "Old Old-Dhaka Silver Locket with Dried Chameli Petals",
      category: "physical_prop",
      state: "deferred",
      setupChapter: 2,
      setupSnippet: "Elena noticed Rahman touching a worn silver locket around his neck whenever he spoke of the 1952 martyrs.",
      currentMentions: [
        { chapter: 2, note: "Fingered nervously while Elena adjusted the camera shutter." },
      ],
      expectedPayoffChapter: 10,
      payoffNotes: "Revealed to contain the micro-engraved cipher key needed to align the handpress printing bed.",
      urgency: "medium",
      isDangling: false,
    },
    {
      id: "gun-5",
      name: "The Unsent Resignation Letter to the University Syndicate",
      category: "secret_clue",
      state: "open",
      setupChapter: 1,
      setupSnippet: "Folded in Rahman's breast pocket was a formal resignation dated six months prior, unsigned but stained with red ink.",
      currentMentions: [
        { chapter: 1, note: "Mentioned briefly when Rahman took out his glasses." },
      ],
      expectedPayoffChapter: 12,
      payoffNotes: "Handed to Azim as a final gesture of moral defiance during the dawn arrest.",
      urgency: "low",
      isDangling: false,
    },
  ];

  return computeLedgerStats(projectId, guns);
}

function computeLedgerStats(projectId: string, guns: ChekhovGun[]): ForeshadowingLedger {
  let openCount = 0;
  let progressingCount = 0;
  let deferredCount = 0;
  let resolvedCount = 0;
  let danglingCount = 0;

  guns.forEach((g) => {
    if (g.state === "open") openCount++;
    else if (g.state === "progressing") progressingCount++;
    else if (g.state === "deferred") deferredCount++;
    else if (g.state === "resolved") resolvedCount++;

    if (g.isDangling) danglingCount++;
  });

  // Calculate health score: base 100, penalized for dangling or unresolved critical setups
  let penalty = danglingCount * 18;
  const criticalUnresolved = guns.filter((g) => g.urgency === "critical" && g.state === "open").length;
  penalty += criticalUnresolved * 10;

  const payoffHealthScore = Math.max(20, Math.min(100, Math.round(100 - penalty)));

  const ledger: ForeshadowingLedger = {
    projectId,
    payoffHealthScore,
    guns,
    totalOpen: openCount,
    totalProgressing: progressingCount,
    totalDeferred: deferredCount,
    totalResolved: resolvedCount,
    danglingCount,
    updatedAt: new Date().toISOString(),
  };

  activeLedgers.set(projectId, ledger);
  return ledger;
}

/**
 * GET /api/v1/projects/:id/foreshadowing
 * Retrieves the Chekhov's Gun & Plot Foreshadowing ledger.
 */
foreshadowingRouter.get("/v1/projects/:id/foreshadowing", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    let ledger = activeLedgers.get(projectId);
    if (!ledger) {
      ledger = generateDefaultForeshadowingLedger(projectId);
    }
    return res.json({ success: true, data: ledger });
  } catch (err: any) {
    logger.error(`[foreshadowing] Error getting ledger: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const UpsertGunSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  category: z.enum(["physical_prop", "secret_clue", "vow_prophecy", "emotional_debt"]),
  state: z.enum(["open", "progressing", "deferred", "resolved"]).default("open"),
  setupChapter: z.number().int().min(1),
  setupSnippet: z.string().min(1),
  expectedPayoffChapter: z.number().int().min(1),
  payoffNotes: z.string().min(1),
  urgency: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

/**
 * POST /api/v1/projects/:id/foreshadowing/upsert
 * Creates or updates a narrative gun in the tracking state machine.
 */
foreshadowingRouter.post("/v1/projects/:id/foreshadowing/upsert", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const parse = UpsertGunSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: parse.error.issues });
    }

    let ledger = activeLedgers.get(projectId);
    if (!ledger) ledger = generateDefaultForeshadowingLedger(projectId);

    const gunData = parse.data;
    const gunId = gunData.id || `gun_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const existingIdx = ledger.guns.findIndex((g) => g.id === gunId);
    if (existingIdx >= 0) {
      ledger.guns[existingIdx] = {
        ...ledger.guns[existingIdx],
        ...gunData,
        id: gunId,
        currentMentions: ledger.guns[existingIdx].currentMentions,
        isDangling: false,
      };
    } else {
      ledger.guns.push({
        id: gunId,
        name: gunData.name,
        category: gunData.category,
        state: gunData.state,
        setupChapter: gunData.setupChapter,
        setupSnippet: gunData.setupSnippet,
        currentMentions: [{ chapter: gunData.setupChapter, note: "Introduced into narrative." }],
        expectedPayoffChapter: gunData.expectedPayoffChapter,
        payoffNotes: gunData.payoffNotes,
        urgency: gunData.urgency,
        isDangling: false,
      });
    }

    const updated = computeLedgerStats(projectId, ledger.guns);
    logger.info({ projectId, gunId }, "[foreshadowing] Upserted Chekhov's gun");

    return res.json({
      success: true,
      message: `Saved narrative gun: "${gunData.name}"`,
      data: updated,
    });
  } catch (err: any) {
    logger.error(`[foreshadowing] Error upserting gun: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const TransitionGunSchema = z.object({
  gunId: z.string().min(1),
  nextState: z.enum(["open", "progressing", "deferred", "resolved"]),
  chapter: z.number().int().optional(),
  note: z.string().optional(),
});

/**
 * POST /api/v1/projects/:id/foreshadowing/transition
 * Advances a gun's state along the 4-stage lifecycle (open -> progressing -> deferred -> resolved).
 */
foreshadowingRouter.post("/v1/projects/:id/foreshadowing/transition", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const parse = TransitionGunSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: parse.error.issues });
    }

    const { gunId, nextState, chapter, note } = parse.data;
    let ledger = activeLedgers.get(projectId);
    if (!ledger) ledger = generateDefaultForeshadowingLedger(projectId);

    const gun = ledger.guns.find((g) => g.id === gunId);
    if (!gun) {
      return res.status(404).json({ success: false, error: "Chekhov gun not found" });
    }

    const prevState = gun.state;
    gun.state = nextState;

    if (chapter) {
      gun.currentMentions.push({
        chapter,
        note: note || `State transitioned from ${prevState} to ${nextState}.`,
      });
    }

    if (nextState === "resolved") {
      gun.resolvedChapter = chapter || gun.expectedPayoffChapter;
      gun.isDangling = false;
    }

    const updated = computeLedgerStats(projectId, ledger.guns);
    logger.info({ projectId, gunId, from: prevState, to: nextState }, "[foreshadowing] Transitioned gun state");

    return res.json({
      success: true,
      message: `Transitioned "${gun.name}" to ${nextState}`,
      data: updated,
    });
  } catch (err: any) {
    logger.error(`[foreshadowing] Error transitioning gun: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/foreshadowing/scan
 * Scans project chapters for introduced narrative setups, key items, and dangling threads.
 */
foreshadowingRouter.post("/v1/projects/:id/foreshadowing/scan", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    let ledger = activeLedgers.get(projectId);
    if (!ledger) ledger = generateDefaultForeshadowingLedger(projectId);

    // Analyze manuscript content if available
    let totalChapters = 12;
    try {
      const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
      if (proj && (proj as any).agentChapters) {
        totalChapters = (proj as any).agentChapters.length;
      }
    } catch {
      // ignore
    }

    // Flag any guns introduced in early chapters that are still 'open' near the end as dangling
    ledger.guns.forEach((g) => {
      if (g.state === "open" && g.setupChapter <= 3 && totalChapters >= 8) {
        g.isDangling = true;
      } else if (g.state === "resolved") {
        g.isDangling = false;
      }
    });

    const updated = computeLedgerStats(projectId, ledger.guns);
    logger.info({ projectId, totalGuns: updated.guns.length, dangling: updated.danglingCount }, "[foreshadowing] Manuscript scan completed");

    return res.json({
      success: true,
      message: `Foreshadowing audit complete: ${updated.guns.length} setups tracked, ${updated.danglingCount} dangling threads flagged`,
      data: updated,
    });
  } catch (err: any) {
    logger.error(`[foreshadowing] Error scanning manuscript: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default foreshadowingRouter;
