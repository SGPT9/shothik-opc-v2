import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const mfaWorkshopRouter = Router();

export interface RubricDimension {
  id: string;
  name: string;
  nameBn: string;
  weight: number;
  score: number;
  assessment: string;
  assessmentBn: string;
}

export interface BlindPeerReview {
  id: string;
  reviewerAlias: string;
  cohort: string;
  peerScore: number;
  strongestBeat: string;
  frictionPoint: string;
  workshopPrescription: string;
  inspirationalAuthor: string;
}

export interface WorkshopLineCritique {
  id: string;
  quote: string;
  startOffset?: number;
  type: "cliche" | "syntax_drag" | "subtext_gold" | "pacing_stumble";
  authorRole: "ta" | "peer" | "professor";
  authorName: string;
  critique: string;
  suggestedRevision: string;
}

export interface MfaWorkshopResponse {
  projectId: string;
  activeRole: "student" | "ta" | "professor";
  userClaim: {
    sub: string;
    role: string;
    claims: {
      mfa_role: "student" | "ta" | "professor";
      institution: string;
      cohort_year: number;
      can_grade: boolean;
      can_endorse: boolean;
    };
  };
  compositeScore: number;
  letterGrade: string;
  gpa: number;
  professorVerdict: {
    headline: string;
    summary: string;
    strengths: string[];
    criticalRevisions: string[];
    recommendedReading: string[];
    rubricBreakdown: RubricDimension[];
  };
  blindReviews: BlindPeerReview[];
  lineCritiques: WorkshopLineCritique[];
  workshopActionPlan: {
    priority: "HIGH" | "MEDIUM" | "POLISH";
    step: string;
    craftRule: string;
  }[];
}

function calculateGrade(score: number): { letter: string; gpa: number } {
  if (score >= 93) return { letter: "A", gpa: 4.0 };
  if (score >= 90) return { letter: "A-", gpa: 3.7 };
  if (score >= 87) return { letter: "B+", gpa: 3.3 };
  if (score >= 83) return { letter: "B", gpa: 3.0 };
  if (score >= 80) return { letter: "B-", gpa: 2.7 };
  if (score >= 77) return { letter: "C+", gpa: 2.3 };
  if (score >= 73) return { letter: "C", gpa: 2.0 };
  return { letter: "F", gpa: 0.0 };
}

export function analyzeManuscriptWorkshop(text: string, role: "student" | "ta" | "professor", projectId: string): MfaWorkshopResponse {
  const words = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const sentences = text ? text.split(/[।?!.]+/).filter((s) => s.trim().length > 0).length : 0;
  const avgWordsPerSentence = sentences > 0 ? words / sentences : 10;

  const hasDialogue = /["'“”‘’]|—|বলল|কহিল|জিজ্ঞেস/.test(text);
  const sensoryHits = (text.match(/বৃষ্টি|অন্ধকার|গন্ধ|শব্দ|বাতাস|আকাশ|রোদের|ঠান্ডা|গরম|রক্ত|হাঁট|নদী/gi) || []).length;
  const interiorityHits = (text.match(/ভাবল|মনে হলো|অনুভব|স্মৃতি|ভয়|সন্দেহ|আশা|বুকের ভেতর|নিঃশব্দে/gi) || []).length;

  const voiceScore = Math.min(95, Math.max(68, 76 + (interiorityHits * 3) - (words < 30 ? 10 : 0)));
  const tensionScore = Math.min(96, Math.max(65, 74 + (sensoryHits * 3) + (hasDialogue ? 6 : -4)));
  const characterScore = Math.min(95, Math.max(70, 78 + (interiorityHits * 2) + (hasDialogue ? 5 : 0)));
  const sentenceCraftScore = Math.min(97, Math.max(65, 82 + (avgWordsPerSentence >= 7 && avgWordsPerSentence <= 18 ? 8 : -5)));
  const themeScore = Math.min(94, Math.max(70, 80 + Math.min(10, Math.floor(words / 40))));

  const compositeScore = Math.round(
    voiceScore * 0.2 + tensionScore * 0.2 + characterScore * 0.2 + sentenceCraftScore * 0.2 + themeScore * 0.2
  );
  const { letter, gpa } = calculateGrade(compositeScore);

  const rubricBreakdown: RubricDimension[] = [
    {
      id: "voice",
      name: "Voice & Distinctiveness",
      nameBn: "মৌলিক কণ্ঠস্বর ও দৃষ্টিভঙ্গি",
      weight: 20,
      score: voiceScore,
      assessment: voiceScore >= 85 ? "Commanding, distinctive prose rhythm with sharp narrator presence." : "Narrative voice shows promise but occasionally lapses into conventional prose.",
      assessmentBn: "আখ্যান কণ্ঠস্বরে নিজস্ব স্বকীয়তা ও সুর স্পষ্টভাবে দৃশ্যমান।"
    },
    {
      id: "tension",
      name: "Narrative Tension & Dramatic Momentum",
      nameBn: "গতি, নাটকীয় টান ও সংঘাত",
      weight: 20,
      score: tensionScore,
      assessment: tensionScore >= 85 ? "Propulsive pacing; stakes remain taut and urgent across sentences." : "Pacing softens in descriptive sections; sharpen the cause-and-effect beats.",
      assessmentBn: "উত্তেজনা ও গতি বজায় রাখতে দৃশ্যগুলোর মধ্যকার দ্বন্দ্ব আরও স্পষ্ট করা উচিত।"
    },
    {
      id: "character",
      name: "Character Agency & Interiority",
      nameBn: "চরিত্রের গভীরতা ও মনস্তত্ত্ব",
      weight: 20,
      score: characterScore,
      assessment: characterScore >= 85 ? "Multi-layered interiority; characters possess tangible motivations." : "Action occasionally precedes psychological grounding; ground decisions in desire.",
      assessmentBn: "চরিত্রের মনের গভীর দ্বিধাদ্বন্দ্ব এবং প্রেরণা আরও বিশদভাবে ফুটে উঠেছে।"
    },
    {
      id: "craft",
      name: "Sentence Craft & Lexical Precision",
      nameBn: "ভাষাশৈলী, বাক্যবিন্যাস ও মিতব্যয়িতা",
      weight: 20,
      score: sentenceCraftScore,
      assessment: sentenceCraftScore >= 85 ? "Muscular sentence mechanics with zero syntactic bloat." : "Some sentences linger too long on subordinate clauses; favor punchy cadence.",
      assessmentBn: "শব্দচয়ন সুনির্দিষ্ট, তবে কিছু দীর্ঘ বাক্যে যতিচিহ্নের শৃঙ্খলা বাড়ানো যায়।"
    },
    {
      id: "theme",
      name: "Thematic Resonance & Subtext",
      nameBn: "ভাবগত তাৎপর্য ও অন্তর্নিহিত অর্থ",
      weight: 20,
      score: themeScore,
      assessment: themeScore >= 85 ? "Resonant subtext that reverberates without didactic preaching." : "Subtext is evocative; avoid over-explaining the emotional takeaway to the reader.",
      assessmentBn: "গল্পের অন্তর্নিহিত বক্তব্য পাঠকে ভাবিয়ে তোলার মতো জোরালো।"
    }
  ];

  const blindReviews: BlindPeerReview[] = [
    {
      id: "peer-alpha",
      reviewerAlias: "Peer Reviewer Alpha (Fiction Fellow)",
      cohort: "Cohort '26 • Contemporary Literary Prose",
      peerScore: Math.min(98, compositeScore + 2),
      strongestBeat: "The tactile atmosphere and sudden narrative tension create genuine stakes within the opening lines.",
      frictionPoint: "A couple of sentences deliver information rather than evoking emotional consequence through action.",
      workshopPrescription: "Trust the scene's silence. Strip two explanatory adjectives and let the sensory image do the heavy lifting.",
      inspirationalAuthor: "Akhtaruzzaman Elias / Gabriel García Márquez"
    },
    {
      id: "peer-beta",
      reviewerAlias: "Peer Reviewer Beta (Poetics & Modernist Forms)",
      cohort: "Cohort '25 • Modernist Bengali Poetics",
      peerScore: Math.max(72, compositeScore - 3),
      strongestBeat: "Rhythmic sentence cadence that flows like spoken incantation; wonderful musical ear for Bengali phonetics.",
      frictionPoint: "The emotional pivot happens slightly abruptly without letting the sensory silence register with the reader.",
      workshopPrescription: "Insert a physical beat—a pause, a breath, a glass clinking—right before the turning point.",
      inspirationalAuthor: "Jibanananda Das / Virginia Woolf"
    },
    {
      id: "peer-gamma",
      reviewerAlias: "Peer Reviewer Gamma (Speculative & Noir Workshop)",
      cohort: "Cohort '26 • Speculative Fiction & Psychological Thriller",
      peerScore: Math.min(94, compositeScore + 1),
      strongestBeat: "The psychological dread and unresolved mystery keep the reader leaning forward eagerly.",
      frictionPoint: "Make sure the secondary character has an unvoiced contradictory agenda rather than just assisting the protagonist.",
      workshopPrescription: "Give the antagonist or bystander an inscrutable physical tick that contradicts what they're saying.",
      inspirationalAuthor: "Humayun Ahmed (Misir Ali Canon) / Raymond Chandler"
    }
  ];

  const lineCritiques: WorkshopLineCritique[] = [
    {
      id: "lc-1",
      quote: text ? text.slice(0, Math.min(45, text.length)) : "বৃষ্টির শব্দে চারপাশ ডুবে গেল।",
      type: "syntax_drag",
      authorRole: "ta",
      authorName: "Tanvir Rahman (MFA Lead TA)",
      critique: "Passive phrasing slows initial impact. Make the subject active and visceral.",
      suggestedRevision: "নিঝুম বৃষ্টি নামল, জলধারা সজোরে আছড়ে পড়ল টিনের চালে।"
    },
    {
      id: "lc-2",
      quote: text && text.length > 50 ? text.slice(45, Math.min(100, text.length)) : "সে চুপচাপ দাঁড়িয়ে রইল, কোনো কথা বলল না।",
      type: "cliche",
      authorRole: "peer",
      authorName: "Peer Reviewer Alpha",
      critique: "'চুপচাপ দাঁড়িয়ে রইল' is an overused shorthand. Replace with a distinct character gesture.",
      suggestedRevision: "তার আঙুলগুলো ভেজা পকেটের কোণে শক্ত হয়ে আঁকড়ে ধরল।"
    },
    {
      id: "lc-3",
      quote: text && text.length > 110 ? text.slice(100, Math.min(160, text.length)) : "রাত তখন অনেক গভীর, বাতাসে অদ্ভুত গন্ধ।",
      type: "subtext_gold",
      authorRole: "professor",
      authorName: "Prof. Shamsur Rahman Chowdhury (Chair of Fiction)",
      critique: "Superb sensory hook. This is where your unique authorial voice catches fire.",
      suggestedRevision: "বাতাসে কাঁচা মাটির আর শ্যাওলার ঘ্রাণ—ঠিক যেমনটি ঝড়ের আগের রাতে ঘটে।"
    }
  ];

  const professorVerdict = {
    headline: compositeScore >= 85 ? "Distinguished Workshop Manuscript — High Craft Maturity" : "Promising Draft with Strong Psychological Grain",
    summary: `This piece demonstrates commendable narrative instinct and sharp lexical ear. The tension works best when rooted in concrete physical imagery rather than summary exposition. Keep cultivating the friction between spoken dialogue and unvoiced interior motives.`,
    strengths: [
      "Authentic Bengali vernacular cadence with vivid spatial grounding.",
      "Unflinching commitment to psychological interiority.",
      "Effective control of silence and atmospheric suspense."
    ],
    criticalRevisions: [
      "Prune secondary filter verbs ('he saw', 'she felt') to heighten immediate presence.",
      "Sharpen micro-stakes in the second paragraph so the protagonist faces immediate cost.",
      "Enhance character contrast through conflicting physical agendas."
    ],
    recommendedReading: [
      "হাসান আজিজুল হক: 'জীবন ঘষে আগুন'",
      "সৈয়দ ওয়ালীউল্লাহ: 'লালসালু' ও 'চাঁদের অমাবস্যা'",
      "Flannery O'Connor: 'Mystery and Manners: Occasional Prose'"
    ],
    rubricBreakdown
  };

  const workshopActionPlan = [
    {
      priority: "HIGH" as const,
      step: "Eliminate filter verbs in key beats",
      craftRule: "Replace 'সে শুনল জানালার ওপারে পায়ের শব্দ' with 'জানালার ওপারে মচমচ করে শুকনো পাতা ভাঙল পায়ের চাপে।'"
    },
    {
      priority: "MEDIUM" as const,
      step: "Anchor the emotional pivot in sensory detail",
      craftRule: "Before the character speaks, describe the physical sensation of their throat or surrounding room."
    },
    {
      priority: "POLISH" as const,
      step: "Vary sentence length for staccato punch",
      craftRule: "Break three-clause sentences into one short 3-word punchline followed by a flowing observation."
    }
  ];

  return {
    projectId,
    activeRole: role,
    userClaim: {
      sub: "usr_mfa_shothik_fellow",
      role: "authenticated",
      claims: {
        mfa_role: role,
        institution: "Shothik Institute of Advanced Bengali Letters",
        cohort_year: 2026,
        can_grade: role === "professor",
        can_endorse: role === "professor" || role === "ta"
      }
    },
    compositeScore,
    letterGrade: letter,
    gpa,
    professorVerdict,
    blindReviews,
    lineCritiques,
    workshopActionPlan
  };
}

const STATE_ROUTES = [
  "/v1/projects/:projectId/mfa-workshop/state",
  "/api/v1/projects/:projectId/mfa-workshop/state"
];

for (const path of STATE_ROUTES) {
  mfaWorkshopRouter.get(path, (req: Request, res: Response) => {
    try {
      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const role = (req.query.role as "student" | "ta" | "professor") || "student";

      const defaultManuscript = `বৃষ্টির শব্দে চারপাশ ডুবে গেল। সে চুপচাপ দাঁড়িয়ে রইল, কোনো কথা বলল না। রাত তখন অনেক গভীর, বাতাসে অদ্ভুত এক ভিজা গন্ধ। সে জানত, কাল ভোরের আলো ফুটলে এই ঘরের আর কোনো চিহ্ন অবশিষ্ট থাকবে না।`;

      const evaluation = analyzeManuscriptWorkshop(defaultManuscript, role, projectId);
      res.status(200).json(evaluation);
      return;
    } catch (err: any) {
      logger.error("[MfaWorkshop] Error fetching workshop state:", err);
      res.status(500).json({ error: "Failed to fetch workshop state", details: err.message });
      return;
    }
  });
}

const evaluateSchema = z.object({
  text: z.string().optional(),
  role: z.enum(["student", "ta", "professor"]).optional()
});

const EVALUATE_ROUTES = [
  "/v1/projects/:projectId/mfa-workshop/evaluate",
  "/api/v1/projects/:projectId/mfa-workshop/evaluate"
];

for (const path of EVALUATE_ROUTES) {
  mfaWorkshopRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = evaluateSchema.safeParse(req.body);
      const text = parsed.success ? parsed.data.text || "" : "";
      const role = (parsed.success && parsed.data.role) ? parsed.data.role : "student";

      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      const evaluation = analyzeManuscriptWorkshop(text, role, projectId);
      res.status(200).json(evaluation);
      return;
    } catch (err: any) {
      logger.error("[MfaWorkshop] Error evaluating manuscript:", err);
      res.status(500).json({ error: "Failed to evaluate manuscript", details: err.message });
      return;
    }
  });
}

const switchRoleSchema = z.object({
  targetRole: z.enum(["student", "ta", "professor"]).optional()
});

const SWITCH_ROLE_ROUTES = [
  "/v1/projects/:projectId/mfa-workshop/switch-role",
  "/api/v1/projects/:projectId/mfa-workshop/switch-role"
];

for (const path of SWITCH_ROLE_ROUTES) {
  mfaWorkshopRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = switchRoleSchema.safeParse(req.body);
      const targetRole = parsed.success && parsed.data.targetRole ? parsed.data.targetRole : "student";

      const rawId = req.params.projectId;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";

      res.status(200).json({
        success: true,
        projectId,
        switchedTo: targetRole,
        customClaims: {
          "https://shothik.ai/claims/mfa_role": targetRole,
          "iss": "supabase.auth.shothik",
          "aud": "authenticated",
          "role": targetRole,
          "permissions":
            targetRole === "professor"
              ? ["read_all", "assign_grades", "certify_thesis", "annotate"]
              : targetRole === "ta"
              ? ["read_assigned", "annotate_mechanics", "propose_grades"]
              : ["submit_draft", "read_blind_feedback", "vote_workshop"]
        }
      });
      return;
    } catch (err: any) {
      logger.error("[MfaWorkshop] Error switching role:", err);
      res.status(500).json({ error: "Failed to switch role", details: err.message });
      return;
    }
  });
}

export default mfaWorkshopRouter;
