import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const multiverseRouter = Router();

export type TimelineMode = "canon" | "au" | "ooc" | "relationship";

export interface RippleEffect {
  axis: "character_arc" | "clues_mystery" | "world_state" | "thematic_tone";
  description: string;
  severity: "subtle" | "moderate" | "seismic";
}

export interface TimelineBranch {
  id: string;
  name: string;
  mode: TimelineMode;
  divergenceChapter: number;
  divergencePremise: string;
  summary: string;
  rippleEffects: RippleEffect[];
  sampleSceneProse: string;
  isCanon: boolean;
  parentBranchId?: string;
  createdAt: string;
}

export interface MultiverseLedger {
  projectId: string;
  activeTimelineId: string;
  timelines: TimelineBranch[];
  updatedAt: string;
}

const activeMultiverseLedgers = new Map<string, MultiverseLedger>();

export function generateDefaultMultiverseLedger(projectId: string): MultiverseLedger {
  const canonBranch: TimelineBranch = {
    id: "tl_canon_prime",
    name: "Prime Timeline (Canon)",
    mode: "canon",
    divergenceChapter: 1,
    divergencePremise: "Original manuscript events as authored.",
    summary: "The main continuity line. The detective investigates the mysterious crime scene while grappling with personal guilt.",
    rippleEffects: [
      {
        axis: "character_arc",
        description: "Protagonist stays within established psychological boundaries.",
        severity: "subtle"
      }
    ],
    sampleSceneProse: "বৃষ্টির রাতে হিমু হলুদ পাঞ্জাবি পরে ঘর থেকে বের হলো। শহরের জলমগ্ন রাস্তায় সে একা হাঁটে, কারো অপেক্ষায় নয়।",
    isCanon: true,
    createdAt: new Date().toISOString()
  };

  const auBranch: TimelineBranch = {
    id: "tl_au_witness_alive",
    name: "AU: The Witness Never Speaks",
    mode: "au",
    divergenceChapter: 2,
    divergencePremise: "What if the sole key witness fled to Chittagong instead of testifying?",
    summary: "Without direct testimony, the investigation turns into an underground cat-and-mouse hunt across the river delta.",
    rippleEffects: [
      {
        axis: "clues_mystery",
        description: "The murder weapon remains unverified; forensic paper trail takes precedence.",
        severity: "seismic"
      },
      {
        axis: "world_state",
        description: "Police corruption deepens in the jurisdiction due to lack of prosecution.",
        severity: "moderate"
      }
    ],
    sampleSceneProse: "সদরঘাট টার্মিনালে শেষ লঞ্চটি যখন ভোঁ বাজাল, তখন ভিড়ের ভেতর সেই ছায়ামূর্তিটি হারিয়ে গেল। কোনো জবানবন্দি লেখা হলো না, কোনো স্বাক্ষর থাকল না ফাইলের কোনায়।",
    isCanon: false,
    parentBranchId: "tl_canon_prime",
    createdAt: new Date().toISOString()
  };

  const oocBranch: TimelineBranch = {
    id: "tl_ooc_cynic",
    name: "OOC: The Machiavellian Reformer",
    mode: "ooc",
    divergenceChapter: 1,
    divergencePremise: "What if the protagonist abandons whimsical detachment and weaponizes every secret for political power?",
    summary: "The eccentric wanderer becomes a cold, calculating power broker exploiting high society's darkest sins.",
    rippleEffects: [
      {
        axis: "character_arc",
        description: "Complete moral inversion: empathy replaced by tactical leverage.",
        severity: "seismic"
      },
      {
        axis: "thematic_tone",
        description: "Shifts from nostalgic atmospheric slice-of-life to ruthless psychological thriller.",
        severity: "seismic"
      }
    ],
    sampleSceneProse: "হিমু মুচকি হাসল না। চায়ের কাপটা টেবিলে রেখে সে মন্ত্রীর চোখের দিকে চাইল। 'আপনার ছেলের ড্রাইভের সব ফাইল এখন আমার জিম্মায়। পরবর্তী পদক্ষেপ কী হবে, তা আমি ঠিক করব।'",
    isCanon: false,
    parentBranchId: "tl_canon_prime",
    createdAt: new Date().toISOString()
  };

  const relationshipBranch: TimelineBranch = {
    id: "tl_rel_nemesis_alliance",
    name: "Dynamic Rel: Blood Brothers in Secret",
    mode: "relationship",
    divergenceChapter: 3,
    divergencePremise: "What if the inspector and the syndicate kingpin are secretly sworn brothers protecting the same orphan?",
    summary: "Public antagonism masks an intricate joint conspiracy to dismantle the corrupt ministry from both sides of the law.",
    rippleEffects: [
      {
        axis: "character_arc",
        description: "Public raids and interrogations are scripted theatre for surveillance.",
        severity: "seismic"
      },
      {
        axis: "clues_mystery",
        description: "All leaked evidence has double-coded meanings known only to the two.",
        severity: "moderate"
      }
    ],
    sampleSceneProse: "অন্ধকার গুদামের ভেতর হ্যান্ডকাফ পরানোর ভঙ্গি করে ইন্সপেক্টর নিচু স্বরে বলল, 'কাল ভোরের আগেই মেয়েকে সীমান্ত পার করে দাও।' ওপাশ থেকে অপরাধী কেবল একটা দীর্ঘশ্বাস ফেলে মাথা নাড়ল।",
    isCanon: false,
    parentBranchId: "tl_canon_prime",
    createdAt: new Date().toISOString()
  };

  const ledger: MultiverseLedger = {
    projectId,
    activeTimelineId: canonBranch.id,
    timelines: [canonBranch, auBranch, oocBranch, relationshipBranch],
    updatedAt: new Date().toISOString()
  };

  activeMultiverseLedgers.set(projectId, ledger);
  return ledger;
}

// ======================== ROUTES ========================

// 1. GET /v1/projects/:id/multiverse & /api/v1/projects/:id/multiverse
multiverseRouter.get(
  ["/v1/projects/:id/multiverse", "/api/v1/projects/:id/multiverse"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      let ledger = activeMultiverseLedgers.get(projectId);
      if (!ledger) {
        ledger = generateDefaultMultiverseLedger(projectId);
      }
      return res.json({ success: true, data: ledger });
    } catch (err: any) {
      logger.error({ err, projectId }, "[Multiverse] Error fetching multiverse ledger");
      const fallback = generateDefaultMultiverseLedger(projectId);
      return res.json({ success: true, data: fallback });
    }
  }
);

// 2. POST /v1/projects/:id/multiverse/branch & /api/v1/projects/:id/multiverse/branch
const createBranchSchema = z.object({
  name: z.string().min(1),
  mode: z.enum(["canon", "au", "ooc", "relationship"]),
  divergenceChapter: z.number().int().min(1),
  divergencePremise: z.string().min(1),
  parentBranchId: z.string().optional()
});

multiverseRouter.post(
  ["/v1/projects/:id/multiverse/branch", "/api/v1/projects/:id/multiverse/branch"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = createBranchSchema.parse(req.body);
      let ledger = activeMultiverseLedgers.get(projectId);
      if (!ledger) {
        ledger = generateDefaultMultiverseLedger(projectId);
      }

      const branchId = `tl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Generate dynamic ripple effects based on divergence premise
      const rippleEffects: RippleEffect[] = [
        {
          axis: body.mode === "ooc" ? "character_arc" : body.mode === "relationship" ? "character_arc" : "clues_mystery",
          description: `Immediate disruption starting at Chapter ${body.divergenceChapter}: ${body.divergencePremise}`,
          severity: "seismic"
        },
        {
          axis: "world_state",
          description: "All downstream character motivations and chapter resolutions adapt to the new timeline state.",
          severity: "moderate"
        }
      ];

      const sampleProse = `[Timeline: ${body.name} (Ch ${body.divergenceChapter})]\nঘটনাটি অন্যভাবে মোড় নিল। ${body.divergencePremise}। চারপাশের পরিবেশ আকস্মিক এক নতুন বাস্তবতার সম্মুখীন হলো।`;

      const newBranch: TimelineBranch = {
        id: branchId,
        name: body.name,
        mode: body.mode,
        divergenceChapter: body.divergenceChapter,
        divergencePremise: body.divergencePremise,
        summary: `Branch spawned from Chapter ${body.divergenceChapter} under ${body.mode.toUpperCase()} parameters: ${body.divergencePremise}`,
        rippleEffects,
        sampleSceneProse: sampleProse,
        isCanon: false,
        parentBranchId: body.parentBranchId || ledger.activeTimelineId,
        createdAt: new Date().toISOString()
      };

      ledger.timelines.push(newBranch);
      ledger.activeTimelineId = branchId;
      ledger.updatedAt = new Date().toISOString();
      activeMultiverseLedgers.set(projectId, ledger);

      logger.info({ projectId, branchId, name: body.name }, "[Multiverse] Spawned new timeline branch");

      return res.json({
        success: true,
        data: {
          ledger,
          createdBranch: newBranch
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[Multiverse] Failed to create timeline branch");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 3. POST /v1/projects/:id/multiverse/simulate & /api/v1/projects/:id/multiverse/simulate
const simulateSchema = z.object({
  timelineId: z.string().min(1),
  sceneBeatPrompt: z.string().optional()
});

multiverseRouter.post(
  ["/v1/projects/:id/multiverse/simulate", "/api/v1/projects/:id/multiverse/simulate"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const { timelineId, sceneBeatPrompt } = simulateSchema.parse(req.body);
      let ledger = activeMultiverseLedgers.get(projectId);
      if (!ledger) {
        ledger = generateDefaultMultiverseLedger(projectId);
      }

      const branch = ledger.timelines.find(t => t.id === timelineId);
      if (!branch) {
        return res.status(404).json({ success: false, error: "Timeline branch not found" });
      }

      const isBengali = /[\u0980-\u09FF]/.test(branch.divergencePremise + (sceneBeatPrompt || ""));

      let simulatedScene = "";
      if (branch.mode === "au") {
        simulatedScene = isBengali
          ? `বৃষ্টির ধারা তখন আরও তীব্র হয়েছে। বুড়িগঙ্গার তীরে নোঙর করা সেই পুরোনো বজরাটার ভেতর হারিকেনের আলো টিমটিম করছিল।\n"তুমি জানো তুমি কার বিরুদ্ধে যাচ্ছ?" মাঝিটা ফিসফিস করে বলল।\nহিমু কোনো উত্তর দিল না। বুকপকেট থেকে জলভেজা চিঠিটা বের করে সে নদীর স্রোতে ভাসিয়ে দিল। আজ রাতে কোনো সূত্র অবশিষ্ট থাকবে না।`
          : `The rain battered against the corrugated tin of the dockhouse. \n"You understand who you're defying?" the ferryman whispered into the gale.\nHe didn't reply. Pulling the sodden confession from his trench coat, he released it into the dark water. By morning, no evidence would remain.`;
      } else if (branch.mode === "ooc") {
        simulatedScene = isBengali
          ? `ঘরের নিস্তব্ধতা ভেঙে হিমু টেবিলের ওপর রিভলভারটি রাখল। তার চোখে কোনো মায়া বা ভাবালুতা নেই।\n"খেলার নিয়ম বদলে গেছে, বাদল," তার কণ্ঠস্বর বরফের মতো শীতল। "তুমি হয় আমার সাথে আছ, নয়তো আমার প্রতিপক্ষ।"\nবাদল স্তম্ভিত চোখে তাকিয়ে রইল। এই মানুষকে সে কখনো দেখেনি।`
          : `Setting the heavy steel revolver on the mahogany desk, he didn't blink.\n"The parameters have shifted," his voice rang with metallic precision. "You are either with my syndicate, or an obstacle to be cleared."\nHis associate could only stare in paralyzed silence.`;
      } else if (branch.mode === "relationship") {
        simulatedScene = isBengali
          ? `রাত তিনটায় নির্জন ব্রিজের ওপর দুটি গাড়ি পাশাপাশি দাঁড়াল। জানালা নামিয়ে একজন অন্যজনের দিকে একটা ফাইল এগিয়ে দিল।\n"কাল সংবাদ সম্মেলনে তোমার লোকদের নাম যেন না আসে," কমিশনার বলল।\n"আমাদের চুক্তি অটুট থাকবে, ভাই," অপরাধ জগতের রাজা ম্লান হাসল।`
          : `Two unmarked sedans pulled bumper to bumper across the abandoned overpass at 3 AM.\n"Make sure your lieutenants aren't named at tomorrow's press briefing," the commissioner warned.\n"Our pact stands," the crime lord replied with a nod.`;
      } else {
        simulatedScene = isBengali
          ? `হিমু আবার রাস্তায় নেমে এলো। বাতাসটা ঠান্ডা আর চেনা। সে জানে, এই শহরের রহস্যগুলো হয়তো সমাধান হবে না, কিন্তু রহস্যের মাঝেই পথ চলার আনন্দ।`
          : `He walked back out into the mist. Some mysteries were never meant to be closed, but the chase was the only truth left.`;
      }

      branch.sampleSceneProse = simulatedScene;
      ledger.updatedAt = new Date().toISOString();
      activeMultiverseLedgers.set(projectId, ledger);

      return res.json({
        success: true,
        data: {
          timelineId,
          timelineName: branch.name,
          mode: branch.mode,
          simulatedScene
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[Multiverse] Simulation failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 4. POST /v1/projects/:id/multiverse/promote & /api/v1/projects/:id/multiverse/promote
const promoteSchema = z.object({
  timelineId: z.string().min(1)
});

multiverseRouter.post(
  ["/v1/projects/:id/multiverse/promote", "/api/v1/projects/:id/multiverse/promote"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const { timelineId } = promoteSchema.parse(req.body);
      let ledger = activeMultiverseLedgers.get(projectId);
      if (!ledger) {
        ledger = generateDefaultMultiverseLedger(projectId);
      }

      const target = ledger.timelines.find(t => t.id === timelineId);
      if (!target) {
        return res.status(404).json({ success: false, error: "Timeline not found" });
      }

      // Demote previous canon
      ledger.timelines.forEach(t => {
        if (t.isCanon) {
          t.isCanon = false;
          t.name = t.name.replace(" (Canon)", " (Archived Canon)");
        }
      });

      // Promote new timeline
      target.isCanon = true;
      target.name = target.name.replace(" (Archived Canon)", "") + " (Canon)";
      ledger.activeTimelineId = target.id;
      ledger.updatedAt = new Date().toISOString();
      activeMultiverseLedgers.set(projectId, ledger);

      logger.info({ projectId, timelineId, name: target.name }, "[Multiverse] Promoted timeline to Canon");

      return res.json({
        success: true,
        data: ledger,
        message: `Successfully promoted '${target.name}' to Canon continuity.`
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[Multiverse] Promotion failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);
