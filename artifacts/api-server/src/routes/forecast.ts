import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const forecastRouter = Router();

// In-memory forecast store (keyed by projectId) with persistence hooks
interface StoredForecast {
  forecastId: string;
  projectId: string;
  createdAt: string;
  horizon: number;
  status: "active" | "stale";
  selectedBranchId: string | null;
  selectedPlan: any | null;
  branches: Array<{
    branchId: string;
    title: string;
    premise: string;
    pacingScore: number;
    intentMatch: string;
    beats: Array<{ chapter: number; summary: string }>;
    characterDecisions: Array<{ character: string; decision: string }>;
    projectedChanges: {
      characters: string[];
      relationships: string[];
      world: string[];
      hooks: string[];
    };
    risks: Array<{ kind: string; description: string }>;
    uncertainties: string[];
    intentRationale: string;
  }>;
}

const activeForecasts = new Map<string, StoredForecast>();

const ForecastInputSchema = z.object({
  divergence: z.string().optional(),
  horizon: z.number().int().min(1).max(10).optional().default(3),
  branchesCount: z.number().int().min(2).max(5).optional().default(3),
  authorIntent: z.string().optional(),
  currentFocus: z.string().optional(),
});

function generateMockForecast(projectId: string, projectTitle: string, divergence?: string, horizon = 3): StoredForecast {
  const forecastId = `fc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const branches = [
    {
      branchId: "branch-1",
      title: "Trajectory A: The Cold Ideological Fracture",
      premise: divergence || "The protagonist uncovers proof of internal betrayal among the academic council, sparking a battle of intellect and legal maneuvering.",
      pacingScore: 0.94,
      intentMatch: "96% Intent Match",
      beats: [
        { chapter: 4, summary: "Discovery of encoded marginalia inside the ancient 1952 Language Movement manuscript." },
        { chapter: 5, summary: "Clash at the University Syndicate hall; secret loyalties are publicly tested under pressure." },
        { chapter: 6, summary: "A decisive sacrifice forces an underground alliance across rival linguistic factions." }
      ],
      characterDecisions: [
        { character: "Professor Rahman", decision: "Refuses to surrender the cryptographic manuscript to state censors." },
        { character: "Dr. Elena Vance", decision: "Leaks the encrypted translation key to international human rights observers." }
      ],
      projectedChanges: {
        characters: ["Rahman gains fugitive status", "Elena becomes prime mediator"],
        relationships: ["Syndicate trust severed", "Underground student alliance solidified"],
        world: ["Dhaka University enters state-monitored lockdown", "Underground press activated"],
        hooks: ["The true identity of the 1952 typist remains unmasked"]
      },
      risks: [
        { kind: "pacing_tension", description: "Chapter 5 debate risks slowing physical action; offset with ticking clock ultimatum." }
      ],
      uncertainties: ["Will the council chairman side with the ministry or academic autonomy?"],
      intentRationale: "Aligns tightly with the author's primary theme of cultural resistance through intellectual perseverance."
    },
    {
      branchId: "branch-2",
      title: "Trajectory B: The Diplomatic Covert Alliance",
      premise: "Rather than an open split, characters feign compliance while secretly weaponizing the publication's release date as leverage.",
      pacingScore: 0.88,
      intentMatch: "89% Intent Match",
      beats: [
        { chapter: 4, summary: "A backchannel negotiation in Old Dhaka over smuggled printing plates." },
        { chapter: 5, summary: "A covert dual-language broadcast exposes the tampering of historical archives." },
        { chapter: 6, summary: "The publishing chief issues a midnight printing order under police radar." }
      ],
      characterDecisions: [
        { character: "Publisher Chief", decision: "Authorizes emergency clandestine print run of 5,000 unredacted copies." },
        { character: "Marcus Sterling", decision: "Feigns cooperation with inspectors to delay confiscation orders." }
      ],
      projectedChanges: {
        characters: ["Marcus operates as double agent", "Publisher chief assumes personal criminal liability"],
        relationships: ["Fragile pact formed with independent newspaper union"],
        world: ["Midnight black-market distribution network activated across Sadarghat"],
        hooks: ["A courier carrying Master Plate #3 fails to reach the designated press"]
      },
      risks: [
        { kind: "moral_ambiguity", description: "Protagonist deception could alienate purist readers; emphasize defensive necessity." }
      ],
      uncertainties: ["Can the printing presses complete the run before dawn curfews?"],
      intentRationale: "Maximizes psychological cat-and-mouse tension while preserving institutional survival."
    },
    {
      branchId: "branch-3",
      title: "Trajectory C: The Radical Public Manifesto",
      premise: "An explosive, uncalculated leak triggers immediate civil reaction, forcing the protagonists onto the public frontline.",
      pacingScore: 0.96,
      intentMatch: "91% Intent Match",
      beats: [
        { chapter: 4, summary: "Uncontrolled viral leak of the suppressed chapter onto independent web forums." },
        { chapter: 5, summary: "Mass public assembly outside the National Archives demanding transparency." },
        { chapter: 6, summary: "The state prosecutor issues warrants, igniting a high-profile constitutional standoff." }
      ],
      characterDecisions: [
        { character: "Aria Chen", decision: "Streams the live deciphering of the watermark certificate to 200,000 viewers." },
        { character: "Professor Rahman", decision: "Surrenders voluntarily to draw media spotlights away from his students." }
      ],
      projectedChanges: {
        characters: ["Aria becomes the public face of the resistance", "Rahman imprisoned as moral martyr"],
        relationships: ["Student core galvanized into rapid defensive action"],
        world: ["National television forced to broadcast the unredacted manuscript text"],
        hooks: ["Rahman conceals the master cipher key in his prison cell bible"]
      },
      risks: [
        { kind: "velocity_danger", description: "Narrative velocity accelerates rapidly; leaves less room for intimate character moments." }
      ],
      uncertainties: ["How will international academic guilds react to Rahman's arrest?"],
      intentRationale: "Provides explosive mid-book climax with maximum public stakes and high cinematic momentum."
    }
  ];

  return {
    forecastId,
    projectId,
    createdAt: new Date().toISOString(),
    horizon,
    status: "active",
    selectedBranchId: null,
    selectedPlan: null,
    branches
  };
}

/**
 * GET /api/v1/projects/:id/forecast
 * Retrieves active narrative forecast branches.
 */
forecastRouter.get("/v1/projects/:id/forecast", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    let forecast = activeForecasts.get(projectId);

    if (!forecast) {
      let title = "Bengali Literary Manuscript";
      if (db) {
        try {
          const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
          if (proj?.title) title = proj.title;
        } catch {
          // ignore
        }
      }
      forecast = generateMockForecast(projectId, title);
      activeForecasts.set(projectId, forecast);
    }

    return res.json({
      success: true,
      data: forecast
    });
  } catch (err: any) {
    logger.error(`[forecast] Error retrieving forecast: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/forecast
 * Simulates a fresh multi-branch narrative forecast.
 */
forecastRouter.post("/v1/projects/:id/forecast", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const parsed = ForecastInputSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues });
    }

    let title = "Bengali Literary Manuscript";
    if (db) {
      try {
        const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
        if (proj?.title) title = proj.title;
      } catch {
        // ignore
      }
    }

    const { divergence, horizon } = parsed.data;
    const forecast = generateMockForecast(projectId, title, divergence, horizon);
    activeForecasts.set(projectId, forecast);

    logger.info({ projectId, forecastId: forecast.forecastId, branches: forecast.branches.length }, "[forecast] Generated new narrative forecast branches");

    return res.json({
      success: true,
      message: "Narrative forecast generated with zero canonical state mutation",
      data: forecast
    });
  } catch (err: any) {
    logger.error(`[forecast] Error generating forecast: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/forecast/select
 * Adopts a forecasted branch as the candidate working plan without corrupting canonical history.
 */
forecastRouter.post("/v1/projects/:id/forecast/select", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const { forecastId, branchId } = req.body;

    if (!forecastId || !branchId) {
      return res.status(400).json({ success: false, error: "forecastId and branchId are required" });
    }

    const forecast = activeForecasts.get(projectId);
    if (!forecast || forecast.forecastId !== forecastId) {
      return res.status(404).json({ success: false, error: "Active forecast not found or expired" });
    }

    const branch = forecast.branches.find(b => b.branchId === branchId);
    if (!branch) {
      return res.status(404).json({ success: false, error: `Branch ${branchId} does not exist in this forecast` });
    }

    forecast.selectedBranchId = branchId;
    forecast.selectedPlan = {
      adoptedAt: new Date().toISOString(),
      branchId: branch.branchId,
      title: branch.title,
      premise: branch.premise,
      beats: branch.beats,
      characterDecisions: branch.characterDecisions,
      intentRationale: branch.intentRationale,
      targetFile: "story/runtime/selected-branch-plan.md"
    };

    logger.info({ projectId, branchId, branchTitle: branch.title }, "[forecast] Selected candidate branch plan staged");

    return res.json({
      success: true,
      message: `Adopted "${branch.title}" as working candidate plan (canonical chapter state preserved)`,
      data: {
        forecastId,
        selectedBranch: branch,
        stagedPlanFile: "selected-branch-plan.md"
      }
    });
  } catch (err: any) {
    logger.error(`[forecast] Error selecting branch plan: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});
