import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const relationshipGraphRouter = Router();

export interface CharacterNode {
  id: string;
  name: string;
  role: "protagonist" | "deuteragonist" | "antagonist" | "mentor" | "catalyst";
  faction: string;
  color: string;
  centralityScore: number; // 0 - 100
  influenceRadius: number; // visual node size
  secretLore?: string;
}

export interface RelationshipEdge {
  id: string;
  sourceCharId: string;
  targetCharId: string;
  trustScore: number; // -100 to +100
  rivalryScore: number; // 0 to 100
  affinityScore: number; // -100 to +100
  leverageScore: number; // 0 to 100
  status: "stable" | "evolving" | "ruptured" | "reconciled";
  narrativeContext: string;
  lastChangedInChapter: number;
}

export interface RelationshipTimelineSnapshot {
  chapterNumber: number;
  chapterTitle: string;
  majorShiftEvent: string;
  edgeDeltas: Array<{
    sourceCharId: string;
    targetCharId: string;
    deltaTrust: number;
    deltaRivalry: number;
  }>;
}

export interface RelationshipGraphData {
  projectId: string;
  nodes: CharacterNode[];
  edges: RelationshipEdge[];
  snapshots: RelationshipTimelineSnapshot[];
  statistics: {
    totalCharacters: number;
    activeTensions: number;
    highestRivalryPair: string;
    highestTrustPair: string;
  };
}

/**
 * Calculates relationship vectors from dialogue and co-occurrence snippets
 */
export function calculateRelationshipDelta(text: string, char1: string, char2: string): {
  deltaTrust: number;
  deltaRivalry: number;
  status: RelationshipEdge["status"];
} {
  const lower = text.toLowerCase();
  let deltaTrust = 0;
  let deltaRivalry = 0;

  // Bengali and English conflict keywords
  if (/(খুন|মিথ্যা|প্রতারণা|বিশ্বাসঘাতক|পুলিশ|betrayal|lie|traitor|deceit)/i.test(lower)) {
    deltaTrust -= 35;
    deltaRivalry += 30;
  }
  if (!/বিশ্বাসঘাতক/i.test(lower) && /(বন্ধু|সাহায্য|বিশ্বাস|একসাথে|trust|help|together|protect)/i.test(lower)) {
    deltaTrust += 30;
    deltaRivalry -= 20;
  }
  if (/(ভয়|হুমকি|অস্ত্র|police|threat|weapon|danger)/i.test(lower)) {
    deltaRivalry += 25;
  }

  let status: RelationshipEdge["status"] = "stable";
  if (Math.abs(deltaTrust) > 20 || deltaRivalry > 20) {
    status = deltaTrust < -20 ? "ruptured" : "evolving";
  }

  return { deltaTrust, deltaRivalry, status };
}

export function generateRelationshipGraphData(projectId = "default"): RelationshipGraphData {
  const nodes: CharacterNode[] = [
    {
      id: "char_himu",
      name: "হিমু (Himu)",
      role: "protagonist",
      faction: "Yellow Robe Nomads (হলুদ পাঞ্জাবি পরিব্রাজক)",
      color: "#eab308", // amber/yellow
      centralityScore: 95,
      influenceRadius: 28,
      secretLore: "Holds knowledge of the victim's midnight letter to the Dhanmondi lake."
    },
    {
      id: "char_badal",
      name: "বাদল (Badal)",
      role: "deuteragonist",
      faction: "Himu Family & Cousin (পারিবারিক অনুসারী)",
      color: "#3b82f6", // blue
      centralityScore: 78,
      influenceRadius: 22,
      secretLore: "Terrified of police inquiries; secretly hid an envelope under the mattress."
    },
    {
      id: "char_oc",
      name: "ওসি মোবারক (Inspector Mobarak)",
      role: "antagonist",
      faction: "Dhanmondi Police Station (আইন প্রয়োগকারী)",
      color: "#ef4444", // red
      centralityScore: 82,
      influenceRadius: 24,
      secretLore: "Suspects Himu's supernatural claims are a deliberate facade concealing an alibi."
    },
    {
      id: "char_meera",
      name: "মীরা (Meera)",
      role: "catalyst",
      faction: "Gulshan Aristocracy (গুলশান শিল্পপতি পরিবার)",
      color: "#ec4899", // pink
      centralityScore: 65,
      influenceRadius: 20,
      secretLore: "Unresolved romantic fascination with Himu; financier behind the legal defense."
    },
    {
      id: "char_intruder",
      name: "রহস্যময় আগন্তুক (The Intruder)",
      role: "catalyst",
      faction: "Underworld Enforcers (পুরনো ঢাকার সিন্ডিকেট)",
      color: "#8b5cf6", // purple
      centralityScore: 60,
      influenceRadius: 18,
      secretLore: "Dispatched to recover a set of incriminating audio cassettes."
    }
  ];

  const edges: RelationshipEdge[] = [
    {
      id: "rel_himu_badal",
      sourceCharId: "char_himu",
      targetCharId: "char_badal",
      trustScore: 88,
      rivalryScore: 10,
      affinityScore: 92,
      leverageScore: 40,
      status: "stable",
      narrativeContext: "Unwavering fraternal loyalty; Badal relies on Himu's intuitive guidance.",
      lastChangedInChapter: 1
    },
    {
      id: "rel_himu_oc",
      sourceCharId: "char_himu",
      targetCharId: "char_oc",
      trustScore: -45,
      rivalryScore: 85,
      affinityScore: -30,
      leverageScore: 75,
      status: "evolving",
      narrativeContext: "Cat-and-mouse tension; OC Mobarak probes for contradictions in Himu's statements.",
      lastChangedInChapter: 2
    },
    {
      id: "rel_badal_oc",
      sourceCharId: "char_badal",
      targetCharId: "char_oc",
      trustScore: -70,
      rivalryScore: 65,
      affinityScore: -60,
      leverageScore: 80,
      status: "ruptured",
      narrativeContext: "Intense fear of police interrogation and legal culpability.",
      lastChangedInChapter: 2
    },
    {
      id: "rel_himu_meera",
      sourceCharId: "char_himu",
      targetCharId: "char_meera",
      trustScore: 60,
      rivalryScore: 25,
      affinityScore: 75,
      leverageScore: 50,
      status: "stable",
      narrativeContext: "Gentle romantic ambiguity and emotional longing across contrasting social worlds.",
      lastChangedInChapter: 1
    },
    {
      id: "rel_oc_intruder",
      sourceCharId: "char_oc",
      targetCharId: "char_intruder",
      trustScore: -90,
      rivalryScore: 95,
      affinityScore: -95,
      leverageScore: 60,
      status: "ruptured",
      narrativeContext: "Active warrant of arrest and criminal rivalry.",
      lastChangedInChapter: 2
    },
    {
      id: "rel_himu_intruder",
      sourceCharId: "char_himu",
      targetCharId: "char_intruder",
      trustScore: 15,
      rivalryScore: 70,
      affinityScore: 10,
      leverageScore: 85,
      status: "evolving",
      narrativeContext: "Unsettling midnight meeting; Himu holds leverage over the intruder's identity.",
      lastChangedInChapter: 3
    }
  ];

  const snapshots: RelationshipTimelineSnapshot[] = [
    {
      chapterNumber: 1,
      chapterTitle: "Chapter 1: The Quantum Horizon",
      majorShiftEvent: "Initial calm established in Dhanmondi; fraternal solidarity between Himu and Badal.",
      edgeDeltas: [
        { sourceCharId: "char_himu", targetCharId: "char_badal", deltaTrust: +10, deltaRivalry: -5 }
      ]
    },
    {
      chapterNumber: 2,
      chapterTitle: "Chapter 2: The Core Mechanism",
      majorShiftEvent: "Police confrontation; OC Mobarak challenges Badal and summons Himu for interrogation.",
      edgeDeltas: [
        { sourceCharId: "char_himu", targetCharId: "char_oc", deltaTrust: -25, deltaRivalry: +40 },
        { sourceCharId: "char_badal", targetCharId: "char_oc", deltaTrust: -40, deltaRivalry: +30 }
      ]
    },
    {
      chapterNumber: 3,
      chapterTitle: "Chapter 3: Scaling & Autonomous Resolution",
      majorShiftEvent: "Midnight knock on the door; mysterious intruder introduces high-stakes blackmail leverage.",
      edgeDeltas: [
        { sourceCharId: "char_himu", targetCharId: "char_intruder", deltaTrust: +15, deltaRivalry: +50 }
      ]
    }
  ];

  return {
    projectId,
    nodes,
    edges,
    snapshots,
    statistics: {
      totalCharacters: nodes.length,
      activeTensions: edges.filter(e => e.rivalryScore > 60).length,
      highestRivalryPair: "OC Mobarak ⚡ The Intruder (95% Hostility)",
      highestTrustPair: "হিমু (Himu) 🤝 বাদল (Badal) (88% Trust)"
    }
  };
}

// 1. GET /v1/projects/:id/relationship-graph
relationshipGraphRouter.get(
  ["/v1/projects/:id/relationship-graph", "/api/v1/projects/:id/relationship-graph"],
  async (req: Request, res: Response) => {
    try {
      const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const projectId = paramId || "default";

      const data = generateRelationshipGraphData(projectId);
      res.json({
        success: true,
        data
      });
    } catch (err: any) {
      logger.error({ err }, "Error in GET /relationship-graph");
      res.status(500).json({ success: false, error: err.message || "Failed to retrieve relationship graph" });
    }
  }
);

// 2. POST /v1/projects/:id/relationship-graph/audit
relationshipGraphRouter.post(
  ["/v1/projects/:id/relationship-graph/audit", "/api/v1/projects/:id/relationship-graph/audit"],
  async (req: Request, res: Response) => {
    try {
      const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const projectId = paramId || "default";
      const { textSample = "" } = req.body || {};

      const delta = calculateRelationshipDelta(String(textSample), "char_himu", "char_oc");
      const baseData = generateRelationshipGraphData(projectId);

      res.json({
        success: true,
        data: {
          ...baseData,
          auditAuditDelta: delta
        }
      });
    } catch (err: any) {
      logger.error({ err }, "Error in POST /relationship-graph/audit");
      res.status(500).json({ success: false, error: err.message || "Failed to audit relationships" });
    }
  }
);
