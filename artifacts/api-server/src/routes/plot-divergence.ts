import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const plotDivergenceRouter = Router();

export interface DivergenceConsequence {
  category: "Character Fate" | "Plot Mystery" | "Thematic Resonance" | "Pacing Velocity";
  categoryBn: string;
  canonState: string;
  divergentState: string;
  impactSeverity: "Subtle Shift" | "Major Arc Reversal" | "Catastrophic Timeline Shatter";
}

export interface PlotBranchFork {
  id: string;
  branchName: string;
  branchNameBn: string;
  pivotChapter: number;
  pivotSceneTitle: string;
  whatIfPremise: string;
  whatIfPremiseBn: string;
  isCanon: boolean;
  parentBranchId: string | null;
  createdAt: string;
  consequences: DivergenceConsequence[];
  divergentProseSnippet: string;
  divergentProseSnippetBn: string;
}

export interface PlotDivergenceState {
  projectId: string;
  title: string;
  titleBn: string;
  activeBranchId: string;
  totalBranches: number;
  branches: PlotBranchFork[];
}

const divergenceStore = new Map<string, PlotDivergenceState>();

export function analyzePlotDivergence(manuscript: string, projectId: string): PlotDivergenceState {
  const isBengali = /[\u0980-\u09FF]/.test(manuscript);

  const canonBranch: PlotBranchFork = {
    id: "branch_canon_alpha",
    branchName: "Canon Timeline: Subterranean Vault Silence",
    branchNameBn: "মূল আখ্যান: পাতাল প্রকোষ্ঠের নীরবতা",
    pivotChapter: 1,
    pivotSceneTitle: "The Whispers of Buriganga",
    whatIfPremise: "Arafat conceals the brass dispatch tube without unsealing it, retreating into Old Dhaka alleys.",
    whatIfPremiseBn: "আরাফাত সিলগালা না ভেঙে পিতলের নলটি গোপনে ব্যাগে ঢুকিয়ে পুরান ঢাকার গলিতে আত্মগোপন করে।",
    isCanon: true,
    parentBranchId: null,
    createdAt: new Date().toISOString(),
    consequences: [
      {
        category: "Character Fate",
        categoryBn: "চরিত্রের পরিণতি",
        canonState: "Arafat survives the night undetected by the river cartel.",
        divergentState: "N/A (Standard Baseline)",
        impactSeverity: "Subtle Shift"
      },
      {
        category: "Plot Mystery",
        categoryBn: "রহস্যের বিস্তার",
        canonState: "The cipher inside remains encrypted until Chapter 4 lab scan.",
        divergentState: "N/A (Standard Baseline)",
        impactSeverity: "Subtle Shift"
      }
    ],
    divergentProseSnippet: "Arafat clasped the tarnished brass cylinder against his damp chest, stepping into the rain before the boatmen could turn around.",
    divergentProseSnippetBn: "মাঝিরা ঘুরে তাকানোর আগেই আরাফাত ভেজা বুকে পিতলের নলটি শক্ত করে চেপে ধরে অন্ধকারের বৃষ্টিতে মিলিয়ে গেল।"
  };

  const alternateBranch1: PlotBranchFork = {
    id: "branch_divergent_river_breach",
    branchName: "Divergence A: The Launch Terminal Exposure",
    branchNameBn: "বিকল্প ধারা ক: সদরঘাট টার্মিনালে প্রকাশ্য বিস্ফোরণ",
    pivotChapter: 1,
    pivotSceneTitle: "Sadarghat Pier Piercing",
    whatIfPremise: "What if Arafat broke the lead seal immediately on the open river launch in front of the dock syndicate?",
    whatIfPremiseBn: "আরাফাত যদি সদরঘাটের ট্রলারে সবার সামনে পিতলের সিলটি ভেঙে ফেলত?",
    isCanon: false,
    parentBranchId: "branch_canon_alpha",
    createdAt: new Date().toISOString(),
    consequences: [
      {
        category: "Character Fate",
        categoryBn: "চরিত্রের পরিণতি",
        canonState: "Arafat walks away clean and reaches the safehouse.",
        divergentState: "Syndicate thugs spot the Mughal seal; Arafat is shot in the shoulder and loses the key to the vault.",
        impactSeverity: "Major Arc Reversal"
      },
      {
        category: "Thematic Resonance",
        categoryBn: "থিমের রূপান্তর",
        canonState: "Slow-burn cerebral intellectual thriller.",
        divergentState: "High-octane urban fugitive chase film across the Buriganga launch docks.",
        impactSeverity: "Catastrophic Timeline Shatter"
      },
      {
        category: "Pacing Velocity",
        categoryBn: "আখ্যানের গতি",
        canonState: "Atmospheric, claustrophobic, and methodical pacing.",
        divergentState: "Adrenaline-fueled relentless sprint with escalating violence.",
        impactSeverity: "Major Arc Reversal"
      }
    ],
    divergentProseSnippet: "The lead seal cracked with the sharp snap of bone. The yellowed parchment fluttered open under the launch lamp—and across the deck, three men dropped their tea cups.",
    divergentProseSnippetBn: "হাড় ভাঙার মতো মটমট শব্দে সিলমোহরটি ভেঙে গেল। ট্রলারের হলুদ বাতির নিচে প্রাচীন কাগজটি খুলতেই ডেকে বসা তিনজন লোক একযোগে চায়ের ভাঁড় ফেলে উঠে দাঁড়াল।"
  };

  const alternateBranch2: PlotBranchFork = {
    id: "branch_divergent_1971_surrender",
    branchName: "Divergence B: The Archival Flame of 1971",
    branchNameBn: "বিকল্প ধারা খ: ১৯৭১ সালের অগ্নিদগ্ধ মহাফেজখানা",
    pivotChapter: 2,
    pivotSceneTitle: "Nilkhet Burning Archives",
    whatIfPremise: "What if Professor Mofizul failed to bury the cylinder and burned the records to prevent civilian torture?",
    whatIfPremiseBn: "অধ্যাপক মফিজুল যদি দলিলগুলো মাটিতে না পুঁতে শিক্ষার্থীদের বাঁচাতে আগুনে পুড়িয়ে দিতেন?",
    isCanon: false,
    parentBranchId: "branch_canon_alpha",
    createdAt: new Date().toISOString(),
    consequences: [
      {
        category: "Plot Mystery",
        categoryBn: "রহস্যের বিস্তার",
        canonState: "The document exists in 2026 for Arafat to uncover.",
        divergentState: "The document is ash; Arafat's modern search becomes an oral history quest with aging dementia survivors.",
        impactSeverity: "Catastrophic Timeline Shatter"
      },
      {
        category: "Character Fate",
        categoryBn: "চরিত্রের পরিণতি",
        canonState: "Grandfather is remembered as a heroic secretive archivist.",
        divergentState: "Grandfather is vilified by historians as having surrendered the registry.",
        impactSeverity: "Major Arc Reversal"
      }
    ],
    divergentProseSnippet: "The match flared in the cold library. Mofizul watched seventy years of calligraphy curl into grey embers, choosing the lives of living boys over dead parchment.",
    divergentProseSnippetBn: "অন্ধকার লাইব্রেরিতে দেশলাইয়ের কাঠি জ্বলে উঠল। সত্তর বছরের ইতিহাসকে ছাই হতে দেখে মফিজুল বিড়বিড় করলেন, কাগজের চেয়ে মানুষের প্রাণের দাম অনেক বেশি।"
  };

  const state: PlotDivergenceState = {
    projectId,
    title: isBengali ? "আখ্যান বিভাজন ও সেমান্টিক টাইম-ট্রাভেল রিপ্লে" : "Semantic Time-Travel & Plot Divergence Replay",
    titleBn: "আখ্যান বিভাজন ও সেমান্টিক টাইম-ট্রাভেল রিপ্লে",
    activeBranchId: "branch_canon_alpha",
    totalBranches: 3,
    branches: [canonBranch, alternateBranch1, alternateBranch2]
  };

  divergenceStore.set(projectId, state);
  return state;
}

const STATE_ROUTES = [
  "/v1/projects/:projectId/plot-divergence/state",
  "/api/v1/projects/:projectId/plot-divergence/state",
  "/v1/projects/:projectId/plot-divergence",
  "/api/v1/projects/:projectId/plot-divergence"
];

for (const routePath of STATE_ROUTES) {
  plotDivergenceRouter.get(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const existing = divergenceStore.get(projectId);
      if (existing) {
        return res.status(200).json(existing);
      }
      const defaultState = analyzePlotDivergence("", projectId);
      return res.status(200).json(defaultState);
    } catch (err: any) {
      logger.error("[PlotDivergence] Error getting state: " + err.message);
      return res.status(500).json({ error: "Failed to get divergence state", details: err.message });
    }
  });
}

const forkSchema = z.object({
  branchName: z.string().min(1),
  branchNameBn: z.string().optional(),
  pivotChapter: z.number().int().positive(),
  whatIfPremise: z.string().min(1),
  whatIfPremiseBn: z.string().optional(),
  parentBranchId: z.string().optional()
});

const FORK_ROUTES = [
  "/v1/projects/:projectId/plot-divergence/fork",
  "/api/v1/projects/:projectId/plot-divergence/fork"
];

for (const routePath of FORK_ROUTES) {
  plotDivergenceRouter.post(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const body = forkSchema.parse(req.body);
      let state = divergenceStore.get(projectId);
      if (!state) {
        state = analyzePlotDivergence("", projectId);
      }

      const newBranch: PlotBranchFork = {
        id: `branch_fork_${Date.now()}`,
        branchName: body.branchName,
        branchNameBn: body.branchNameBn || body.branchName,
        pivotChapter: body.pivotChapter,
        pivotSceneTitle: `Chapter ${body.pivotChapter} Divergence Point`,
        whatIfPremise: body.whatIfPremise,
        whatIfPremiseBn: body.whatIfPremiseBn || body.whatIfPremise,
        isCanon: false,
        parentBranchId: body.parentBranchId || state.activeBranchId,
        createdAt: new Date().toISOString(),
        consequences: [
          {
            category: "Character Fate",
            categoryBn: "চরিত্রের পরিণতি",
            canonState: "Standard canon progression",
            divergentState: "Immediate structural divergence in character trajectory",
            impactSeverity: "Major Arc Reversal"
          },
          {
            category: "Thematic Resonance",
            categoryBn: "থিমের রূপান্তর",
            canonState: "Original philosophical tone",
            divergentState: "Heightened tension and existential stakes",
            impactSeverity: "Catastrophic Timeline Shatter"
          }
        ],
        divergentProseSnippet: `The path fractured here. If ${body.whatIfPremise}, the subsequent chain of consequence changes the destiny of all characters.`,
        divergentProseSnippetBn: `এখানে আখ্যান মোড় নেয়। ${body.whatIfPremiseBn || body.whatIfPremise} ঘটলে পরবর্তী সমস্ত ঘটনা ও সম্পর্কের গতিপথ সম্পূর্ণ ভিন্ন রূপ ধারণ করে।`
      };

      state.branches.push(newBranch);
      state.totalBranches = state.branches.length;
      divergenceStore.set(projectId, state);

      return res.status(201).json({ branch: newBranch, totalBranches: state.totalBranches });
    } catch (err: any) {
      logger.error("[PlotDivergence] Fork error: " + err.message);
      return res.status(400).json({ error: "Failed to create divergence fork", details: err.message });
    }
  });
}

const replaySchema = z.object({
  branchId: z.string().min(1)
});

const REPLAY_ROUTES = [
  "/v1/projects/:projectId/plot-divergence/replay",
  "/api/v1/projects/:projectId/plot-divergence/replay"
];

for (const routePath of REPLAY_ROUTES) {
  plotDivergenceRouter.post(routePath, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const { branchId } = replaySchema.parse(req.body);
      let state = divergenceStore.get(projectId);
      if (!state) {
        state = analyzePlotDivergence("", projectId);
      }

      const targetBranch = state.branches.find((b) => b.id === branchId);
      if (!targetBranch) {
        return res.status(404).json({ error: "Branch not found" });
      }

      state.activeBranchId = branchId;
      divergenceStore.set(projectId, state);

      return res.status(200).json({
        success: true,
        activeBranchId: state.activeBranchId,
        branch: targetBranch
      });
    } catch (err: any) {
      logger.error("[PlotDivergence] Replay error: " + err.message);
      return res.status(400).json({ error: "Failed to switch active branch", details: err.message });
    }
  });
}
