import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const tabletopRouter = Router();

export interface TabletopCharacter {
  id: string;
  name: string;
  role: string;
  agenda: string;
  mood: string;
  trustScore: number; // 0 to 100
  inventory: string[];
}

export interface TabletopClue {
  id: string;
  name: string;
  status: "hidden" | "discovered" | "analyzed" | "compromised";
  location: string;
  significance: string;
  discoveredAtTurn?: number;
}

export interface TabletopTurn {
  turnNumber: number;
  actor: string;
  inputAction: string;
  sceneNarration: string;
  dialogueLines: Array<{
    speaker: string;
    text: string;
    emotion: string;
    gesture?: string;
  }>;
  worldEvents: string[];
  suggestedActions: string[];
  stateDeltas: {
    cluesUpdated?: string[];
    inventoryChanges?: string[];
    tensionDelta?: number;
  };
  timestamp: string;
}

export interface TabletopSession {
  sessionId: string;
  projectId: string;
  title: string;
  premise: string;
  mode: "open" | "guided";
  worldContract: {
    setting: string;
    timePeriod: string;
    physicalLaws: string;
    dangerLevel: "low" | "medium" | "high" | "critical";
    tensionMeter: number; // 0 to 100
    alertSirensInTurns?: number;
  };
  visualContract: {
    lighting: string;
    weather: string;
    soundscape: string;
    sensoryDetails: string[];
  };
  characters: TabletopCharacter[];
  clues: TabletopClue[];
  partyInventory: string[];
  turnHistory: TabletopTurn[];
  status: "in_progress" | "climax_reached" | "concluded";
  createdAt: string;
  updatedAt: string;
}

const activeTabletops = new Map<string, TabletopSession>();

function createDefaultTabletopSession(projectId: string, projectTitle?: string): TabletopSession {
  const sessionId = `tt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    sessionId,
    projectId,
    title: projectTitle || "Curzon Hall: The Midnight Interrogation",
    premise: "Heavy monsoon rain traps Professor Rahman and Elena Vance inside the sealed Curzon Hall archive vault as curfew sirens echo from Sadarghat.",
    mode: "guided",
    worldContract: {
      setting: "Curzon Hall Archives, High-Ceiling Gothic Vault, Dhaka University",
      timePeriod: "Late Monsoon Midnight, 1952",
      physicalLaws: "No modern digital electronics. Gunfire or broken glass alerts the external police brigade within 2 turns.",
      dangerLevel: "high",
      tensionMeter: 45,
      alertSirensInTurns: 4,
    },
    visualContract: {
      lighting: "Flickering amber glow from two storm lanterns on a wet oak bench",
      weather: "Torrential downpour lashing arched stained-glass windows",
      soundscape: "Gutter gurgle, distant siren wails, rhythmic clicking of ceiling fan blades",
      sensoryDetails: [
        "Smell of old parchment, damp jute bags, and copper solvent",
        "Cold puddle seeping under the heavy cast-iron door",
      ],
    },
    characters: [
      {
        id: "char-1",
        name: "Professor Rahman",
        role: "Senior Scholar & Resistance Archivist",
        agenda: "Preserve the 1952 underground printing plates at all costs without letting Elena get captured.",
        mood: "Hyper-vigilant, stoic under pressure",
        trustScore: 85,
        inventory: ["Pocket notebook", "Heavy brass vault key", "Fountain pen"],
      },
      {
        id: "char-2",
        name: "Dr. Elena Vance",
        role: "Foreign Forensic Investigator",
        agenda: "Photograph and document the watermark proof before the ministry seizes the archives.",
        mood: "Analytical, adrenaline-fueled",
        trustScore: 70,
        inventory: ["Leica rangefinder camera", "Spare film roll", "Pocket flashlight"],
      },
      {
        id: "char-3",
        name: "Superintendent Azim (Approaching)",
        role: "State Censor & Police Chief",
        agenda: "Breach the archive, confiscate all printing plates, and arrest all occupants before dawn.",
        mood: "Calculating, unforgiving",
        trustScore: 10,
        inventory: ["Police whistle", "Webley .38 Service Revolver", "Warrant dossier"],
      },
    ],
    clues: [
      {
        id: "clue-1",
        name: "1952 Master Printing Plate",
        status: "discovered",
        location: "Inside the locked steel strongbox beneath table 4",
        significance: "Conclusive physical proof that the state altered historical university registers.",
        discoveredAtTurn: 0,
      },
      {
        id: "clue-2",
        name: "Coded Ledger with Foreign Watermarks",
        status: "hidden",
        location: "Concealed behind the binding of an 1898 Botany folio",
        significance: "Lists backchannel financiers funding the clandestine midnight press.",
      },
      {
        id: "clue-3",
        name: "Shattered Lantern Oil Trail",
        status: "discovered",
        location: "Archway threshold",
        significance: "Creates an immediate fire hazard if gunfire or open flame touches the floor.",
        discoveredAtTurn: 0,
      },
    ],
    partyInventory: [
      "1952 Master Printing Plate (Heavy Zinc)",
      "Brass Vault Key",
      "Leica Camera (3 exposures remaining)",
      "Storm Lantern (1 hour kerosene remaining)",
    ],
    turnHistory: [
      {
        turnNumber: 0,
        actor: "Director (Tabletop Setup)",
        inputAction: "Scene initialized at the stroke of midnight.",
        sceneNarration:
          "The iron bolt thuds into place. Outside, the downpour drums violently against the red brick exterior. Elena wipes rainwater from her camera lens while Rahman leans his weight against the inner oak door.",
        dialogueLines: [
          {
            speaker: "Professor Rahman",
            text: "Listen to me, Elena. The patrol has already cordoned off Curzon Gate. We have less than twenty minutes before Azim's men try the crowbars.",
            emotion: "urgent",
            gesture: "points lantern toward the basement hatch",
          },
          {
            speaker: "Dr. Elena Vance",
            text: "I just need three clean exposures of the signature plate. Once the film is in the canister, they can tear this hall to splinters.",
            emotion: "resolute",
            gesture: "cocks the camera shutter with a metallic click",
          },
        ],
        worldEvents: ["Curfew siren sounds in the distance (4 turns until arrival)."],
        suggestedActions: [
          "Examine the Botany folio behind the reference desk for the secret ledger",
          "Barricade the inner vault door with the heavy teak card catalog",
          "Set up the tripod to photograph the master zinc plate under the storm lantern",
          "Open the underground drainage chute to scout an escape route to the Buriganga canal",
        ],
        stateDeltas: {
          tensionDelta: 0,
        },
        timestamp: new Date().toISOString(),
      },
    ],
    status: "in_progress",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * GET /api/v1/projects/:id/tabletop
 * Retrieves active tabletop session or initializes default scenario.
 */
tabletopRouter.get("/v1/projects/:id/tabletop", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    let session = activeTabletops.get(projectId);

    if (!session) {
      let title = "Curzon Hall: The Midnight Interrogation";
      if (db) {
        try {
          const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
          if (proj?.title) title = proj.title;
        } catch {
          // ignore
        }
      }
      session = createDefaultTabletopSession(projectId, title);
      activeTabletops.set(projectId, session);
    }

    return res.json({ success: true, data: session });
  } catch (err: any) {
    logger.error(`[tabletop] Error getting session: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const StartTabletopSchema = z.object({
  title: z.string().optional(),
  premise: z.string().optional(),
  mode: z.enum(["open", "guided"]).optional().default("guided"),
  setting: z.string().optional(),
  characterNames: z.array(z.string()).optional(),
});

/**
 * POST /api/v1/projects/:id/tabletop/start
 * Initializes or re-seeds a tabletop scene session.
 */
tabletopRouter.post("/v1/projects/:id/tabletop/start", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const parse = StartTabletopSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: parse.error.issues });
    }

    const { title, premise, mode, setting } = parse.data;
    const session = createDefaultTabletopSession(projectId, title);

    if (premise) session.premise = premise;
    if (mode) session.mode = mode;
    if (setting) session.worldContract.setting = setting;

    activeTabletops.set(projectId, session);
    logger.info({ projectId, sessionId: session.sessionId }, "[tabletop] Started new tabletop scene session");

    return res.json({
      success: true,
      message: "Director's Tabletop scene session initialized",
      data: session,
    });
  } catch (err: any) {
    logger.error(`[tabletop] Error starting session: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

const StepTabletopSchema = z.object({
  action: z.string().min(1),
  actor: z.string().optional().default("Director"),
});

/**
 * POST /api/v1/projects/:id/tabletop/step
 * Advances the tabletop scene by one turn with character improvisation and world simulation.
 */
tabletopRouter.post("/v1/projects/:id/tabletop/step", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const parse = StepTabletopSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ success: false, error: parse.error.issues });
    }

    const { action, actor } = parse.data;
    let session = activeTabletops.get(projectId);
    if (!session) {
      session = createDefaultTabletopSession(projectId);
      activeTabletops.set(projectId, session);
    }

    const turnNum = session.turnHistory.length;
    let tensionDelta = 10;
    const worldEvents: string[] = [];
    const dialogueLines: TabletopTurn["dialogueLines"] = [];
    let sceneNarration = "";
    const stateDeltas: TabletopTurn["stateDeltas"] = {
      cluesUpdated: [],
      inventoryChanges: [],
      tensionDelta: 10,
    };

    // Decrement alert sirens
    if (session.worldContract.alertSirensInTurns !== undefined) {
      session.worldContract.alertSirensInTurns = Math.max(0, session.worldContract.alertSirensInTurns - 1);
      if (session.worldContract.alertSirensInTurns === 0) {
        worldEvents.push("🚨 Superintendent Azim's patrol arrives outside the door! Boots strike the stone corridor.");
        session.worldContract.dangerLevel = "critical";
        tensionDelta += 20;
      } else {
        worldEvents.push(`Curfew patrol ETA: ${session.worldContract.alertSirensInTurns} turns remaining.`);
      }
    }

    // Dynamic resolution based on director action
    const lower = action.toLowerCase();

    if (lower.includes("barricade") || lower.includes("door") || lower.includes("catalog")) {
      sceneNarration =
        "Rahman drops the brass key into his coat and grabs the corner of the mahogany card catalog. Together with Elena, they drag the five-hundred-pound cabinet across the flagstones, wedging it firmly against the iron door just as a heavy fist pounds from the outside.";
      dialogueLines.push(
        {
          speaker: "Professor Rahman",
          text: "That will hold for maybe three minutes. Don't look back—photograph the signatures now!",
          emotion: "strained",
          gesture: "wipes perspiration with his sleeve",
        },
        {
          speaker: "Superintendent Azim (Outside Door)",
          text: "Professor Rahman! Open in the name of the Provincial Directorate! Every minute you delay is another treason charge on your docket!",
          emotion: "menacing",
          gesture: "heavy boot kicks the iron plate",
        }
      );
      stateDeltas.inventoryChanges?.push("Card Catalog wedged against entrance door (+3 turns defense)");
      if (session.worldContract.alertSirensInTurns !== undefined) {
        session.worldContract.alertSirensInTurns += 2; // Gained time
      }
    } else if (lower.includes("photograph") || lower.includes("camera") || lower.includes("exposure") || lower.includes("zinc")) {
      sceneNarration =
        "Elena stabilizes the Leica on the rim of the storm lantern. The sharp white glare of the kerosene mantle illuminates the etched Bengali typography: 'রাষ্ট্রভাষা বাংলা চাই - নিখিল বঙ্গ পরিষদ ১৯৫২'. The shutter snaps with crisp mechanical finality.";
      dialogueLines.push(
        {
          speaker: "Dr. Elena Vance",
          text: "Exposure one locked. The silver emulsion caught the exact ministry seal and Rahman's handwritten correction.",
          emotion: "triumphant",
          gesture: "winds the advance lever with a swift thumb flick",
        },
        {
          speaker: "Professor Rahman",
          text: "Take the second one angled at forty-five degrees. The watermark is stamped into the zinc bevel.",
          emotion: "concentrated",
          gesture: "shields the flame from draft drafts",
        }
      );
      stateDeltas.inventoryChanges?.push("Leica Camera: 2 exposures remaining (Negative Canister Stored)");
    } else if (lower.includes("folio") || lower.includes("botany") || lower.includes("ledger") || lower.includes("secret")) {
      const clue2 = session.clues.find((c) => c.id === "clue-2");
      if (clue2 && clue2.status === "hidden") {
        clue2.status = "discovered";
        clue2.discoveredAtTurn = turnNum;
        stateDeltas.cluesUpdated?.push("Discovered: Coded Ledger with Foreign Watermarks");
      }
      sceneNarration =
        "Rahman’s fingers run along the dust-laden shelf until they find the oversized 1898 Botany folio. He pulls the frayed leather spine. Tucked neatly inside the hollowed binding is a slim notebook bound in black calfskin, filled with dates, shipping manifests, and bank routing stamps from Calcutta and London.";
      dialogueLines.push(
        {
          speaker: "Professor Rahman",
          text: "Here it is. Every rupee, every pound, every ream of newsprint that slipped past the colonial censors in February.",
          emotion: "reverent",
          gesture: "presses the notebook against his heart",
        },
        {
          speaker: "Dr. Elena Vance",
          text: "This isn't just an archive, Rahman. It's an entire network of living conspirators.",
          emotion: "awed",
          gesture: "shines the pocket flashlight over the cipher lines",
        }
      );
      session.partyInventory.push("1952 Clandestine Financial Ledger (Black Calfskin)");
    } else if (lower.includes("drainage") || lower.includes("chute") || lower.includes("escape") || lower.includes("canal")) {
      sceneNarration =
        "Elena kicks aside two damp jute sacks to reveal a rusty round cast-iron grating. Cold river wind and the unmistakable stench of the Buriganga surge up through the iron rungs. A narrow brick drainage culvert angles southward beneath the university grounds.";
      dialogueLines.push(
        {
          speaker: "Dr. Elena Vance",
          text: "The drop is twelve feet into knee-deep mud, but it leads straight to the water gate behind Shahid Minar.",
          emotion: "decisive",
          gesture: "tests the iron rung with her boot heel",
        },
        {
          speaker: "Professor Rahman",
          text: "You go first with the film canisters, Elena. If the zinc plate won't fit through the grating, I will smash it against the cornerstone before they lay a hand on it.",
          emotion: "fierce",
          gesture: "grips the heavy zinc plate with white knuckles",
        }
      );
      worldEvents.push("Underground escape route unlocked via southern storm drainage conduit.");
    } else {
      // General improvisation response
      sceneNarration = `Elena and Rahman react swiftly to the director's directive: "${action}". The archive echoes with rapid footsteps as the storm intensifies overhead.`;
      dialogueLines.push(
        {
          speaker: "Professor Rahman",
          text: "Move with purpose. Whatever we do, we do not let Azim recover both the plate and the witness register.",
          emotion: "resolute",
          gesture: "checks the corridor sightline through the brass keyhole",
        },
        {
          speaker: "Dr. Elena Vance",
          text: "Agreed. I am ready on your mark.",
          emotion: "focused",
          gesture: "adjusts the camera strap across her chest",
        }
      );
    }

    session.worldContract.tensionMeter = Math.min(100, session.worldContract.tensionMeter + tensionDelta);
    if (session.worldContract.tensionMeter >= 90) {
      session.status = "climax_reached";
    }

    // Contextual suggested actions for next turn
    const suggestedActions = [
      "Smuggle the film and ledger down the southern drainage chute toward the river",
      "Confront Superintendent Azim through the reinforced grille to stall for time",
      "Shatter the storm lantern onto the oil trail to trigger a defensive fire barrier",
      "Deliver the zinc plate to the student underground courier waiting at the north fence",
    ];

    const turn: TabletopTurn = {
      turnNumber: turnNum,
      actor,
      inputAction: action,
      sceneNarration,
      dialogueLines,
      worldEvents,
      suggestedActions,
      stateDeltas,
      timestamp: new Date().toISOString(),
    };

    session.turnHistory.push(turn);
    session.updatedAt = new Date().toISOString();

    logger.info(
      { projectId, turnNumber: turnNum, tension: session.worldContract.tensionMeter },
      "[tabletop] Turn advanced in director's tabletop simulator"
    );

    return res.json({
      success: true,
      message: `Tabletop turn ${turnNum} resolved`,
      data: {
        session,
        latestTurn: turn,
      },
    });
  } catch (err: any) {
    logger.error(`[tabletop] Error stepping session: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/tabletop/revise
 * Rolls back the last tabletop turn.
 */
tabletopRouter.post("/v1/projects/:id/tabletop/revise", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const session = activeTabletops.get(projectId);
    if (!session || session.turnHistory.length <= 1) {
      return res.status(400).json({ success: false, error: "No turns available to roll back" });
    }

    const removed = session.turnHistory.pop();
    session.worldContract.tensionMeter = Math.max(20, session.worldContract.tensionMeter - 10);
    session.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: `Rolled back turn ${removed?.turnNumber}`,
      data: session,
    });
  } catch (err: any) {
    logger.error(`[tabletop] Error rolling back: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/tabletop/export-prose
 * Compiles the entire tabletop session history into full narrative manuscript chapter prose.
 */
tabletopRouter.post("/v1/projects/:id/tabletop/export-prose", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const session = activeTabletops.get(projectId);
    if (!session) {
      return res.status(404).json({ success: false, error: "Active tabletop session not found" });
    }

    const paragraphs: string[] = [];
    paragraphs.push(`## ${session.title}`);
    paragraphs.push(`*${session.premise}*\n`);

    session.turnHistory.forEach((turn) => {
      if (turn.sceneNarration) {
        paragraphs.push(turn.sceneNarration);
      }
      turn.dialogueLines.forEach((d) => {
        const gestureSuffix = d.gesture ? ` ${d.speaker} ${d.gesture}.` : "";
        paragraphs.push(`"${d.text}" said ${d.speaker}.${gestureSuffix}`);
      });
      if (turn.worldEvents.length > 0) {
        paragraphs.push(`*(${turn.worldEvents.join(" ")})*`);
      }
      paragraphs.push("");
    });

    const compiledProse = paragraphs.join("\n\n");

    return res.json({
      success: true,
      data: {
        title: session.title,
        wordCount: compiledProse.split(/\s+/).length,
        prose: compiledProse,
      },
    });
  } catch (err: any) {
    logger.error(`[tabletop] Error exporting prose: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default tabletopRouter;
