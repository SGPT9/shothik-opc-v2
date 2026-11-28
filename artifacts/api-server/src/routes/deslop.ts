import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const deslopRouter = Router();

export type DeslopRuleId =
  | "emotion_labeling"
  | "unsupported_conclusions"
  | "formulaic_triads"
  | "generic_transitions"
  | "decorative_purple_prose"
  | "cliche_metaphors"
  | "bengali_idiom_dilution";

export interface DeslopFinding {
  id: string;
  ruleId: DeslopRuleId;
  ruleName: string;
  severity: "critical" | "warning" | "suggestion";
  originalText: string;
  suggestedRevision: string;
  startOffset: number;
  endOffset: number;
  line: number;
  explanation: string;
  vernacularTip?: string;
}

export interface DeslopAuditResult {
  projectId: string;
  cleanlinessScore: number;
  slopDensityPer1kWords: number;
  wordCount: number;
  issueCount: number;
  rubricSummary: Record<
    DeslopRuleId,
    {
      name: string;
      count: number;
      description: string;
    }
  >;
  findings: DeslopFinding[];
  analyzedAt: string;
}

// In-memory cache of latest audits per project
const deslopAuditCache = new Map<string, DeslopAuditResult>();

interface SlopRuleMatcher {
  id: DeslopRuleId;
  name: string;
  description: string;
  severity: "critical" | "warning" | "suggestion";
  patterns: Array<{
    regex: RegExp;
    suggest: (match: string) => string;
    explanation: string;
    vernacularTip?: string;
  }>;
}

export const SLOP_RULES: SlopRuleMatcher[] = [
  {
    id: "emotion_labeling",
    name: "Emotion Labeling (Telling vs. Showing)",
    description: "Asserting emotional states explicitly rather than grounding feelings in visceral physical reactions and sensory evidence.",
    severity: "critical",
    patterns: [
      {
        regex: /(felt|feeling|feels)\s+(an?\s+)?(overwhelming|profound|deep|sudden|immense|wave\s+of)\s+(sense\s+of\s+)?(melancholy|sorrow|despair|dread|joy|nostalgia|grief|sadness|fear|anger)/gi,
        suggest: (match) => {
          if (/melancholy|sorrow|grief|sadness/i.test(match)) return "a knot tightened in his throat; his gaze fixed on the cracked wooden floor";
          if (/dread|fear/i.test(match)) return "his pulse hammered against his temples; sweat cold on the back of his neck";
          if (/anger/i.test(match)) return "his knuckles turned bone-white against the table edge";
          return "his breath hitched as his shoulders went taut";
        },
        explanation: "Replace emotional abstraction with physical, physiological actions.",
      },
      {
        regex: /(was|were)\s+filled\s+with\s+(immense|deep|uncontrollable|overwhelming)\s+(sorrow|joy|rage|dread|regret)/gi,
        suggest: () => "swallowed dryly, hands trembling against the damp coat",
        explanation: "Cut passive emotional declaration. Anchor the character's reaction to their physical posture.",
      },
      {
        regex: /his\s+heart\s+(was\s+heavy\s+with|swelled\s+with|ached\s+with)\s+(despair|pride|grief|sorrow)/gi,
        suggest: () => "his chest tightened until drawing breath sounded like crushed gravel",
        explanation: "Overused cardiovascular metaphor for emotion.",
      },
      {
        regex: /(তার|তাহার)\s+(মনে|হৃদয়ে)\s+(গভীর|তীব্র|অসীম|এক)\s+(ভীতি|শোক|দুঃখ|বেদনা|আনন্দ|হতাশা)র?\s+(সঞ্চার\s+হলো|সৃষ্টি\s+হলো|আবির্ভাব\s+ঘটল)/gi,
        suggest: () => "বুকের ভেতর ছ্যাঁত করে উঠল; চোখের পাতা কেঁপে উঠল অজান্তেই",
        explanation: "নিষ্ক্রিয় আবেগ ঘোষণা পরিহার করে শারীরিক প্রতিক্রিয়া বর্ণনা করুন।",
        vernacularTip: "বাংলা খাঁটি বাগধারা: 'বুকের ভেতর ছ্যাঁত করে উঠল' বা 'গা ছমছম করে উঠল'।",
      },
      {
        regex: /(তিনি|সে)\s+এক\s+(অদ্ভুত|গভীর|তীব্র)\s+(বিষাদ|ভয়|আনন্দ)\s+অনুভব\s+(করলেন|করল)/gi,
        suggest: () => "চোয়ালের পেশি শক্ত হয়ে এলো, নিঃশ্বাস আটকে গেল গলায়",
        explanation: "আবেগ অনুভূতির সরাসরি বিবরণ লেখার মান শিথিল করে।",
      },
    ],
  },
  {
    id: "unsupported_conclusions",
    name: "Unsupported Thematic Conclusions",
    description: "Melodramatic declarations asserting momentous philosophical weight that the scene's stakes have not yet earned.",
    severity: "warning",
    patterns: [
      {
        regex: /(this|that|it)\s+(would\s+change|changed)\s+(everything|their\s+lives)\s+(forever|in\s+ways\s+they\s+could\s+not\s+imagine)/gi,
        suggest: () => "neither spoke; the ink on the torn ledger was still wet",
        explanation: "Allow the reader to deduce consequence from concrete action rather than announcing it.",
      },
      {
        regex: /(it\s+was\s+a\s+moment\s+that\s+defied|a\s+moment\s+destined\s+to|a\s+silent\s+testament\s+to\s+the\s+human\s+spirit)/gi,
        suggest: () => "the ticking clock on the mantelpiece filled the silence",
        explanation: "Classic AI grandiose conclusion cliché.",
      },
      {
        regex: /(little\s+did\s+(he|she|they)\s+know\s+(that|,)|the\s+universe\s+seemed\s+to\s+hold\s+its\s+breath)/gi,
        suggest: () => "outside, the curfew patrol boots struck the cobblestones",
        explanation: "Remove false omniscient foreboding. Cut straight to the immediate sensory pressure.",
      },
      {
        regex: /(এই\s+ঘটনাটি\s+তাদের\s+জীবনকে\s+চিরতরে\s+বদলে\s+দিল|তারা\s+জানত\s+না\s+যে\s+ভবিষ্যতে\s+কি\s+অপেক্ষা\s+করছে)/gi,
        suggest: () => "ঘরের ভেতরে টেবিলের টিমটিমে প্রদীপের শিখাটা কেঁপে কেঁপে উঠল",
        explanation: "অনর্থক গুরুগম্ভীর ঘোষণা পরিহার করে দৃশ্যের সত্যকে বাস্তব বস্তুর মাধ্যমে প্রকাশ করুন।",
      },
      {
        regex: /(মহাবিশ্ব\s+যেন\s+মুহূর্তের\s+জন্য\s+থেমে\s+গেল|এটি\s+ছিল\s+মানব\s+ইতিহাসের\s+এক\s+চিরন্তন\s+দলিল)/gi,
        suggest: () => "বাইরে কার্জন হলের ঘড়িতে ঢং ঢং করে রাত বারোটা বাজল",
        explanation: "অতি-নাটকীয় কৃত্রিম দার্শনিকতা বর্জন করুন।",
      },
    ],
  },
  {
    id: "formulaic_triads",
    name: "Formulaic Triads (Rule of Three Cliché)",
    description: "Symmetrical three-part lists of adjectives or nouns overused by LLMs to create false rhythmic polish.",
    severity: "warning",
    patterns: [
      {
        regex: /([A-Za-z]+),\s+([A-Za-z]+),\s+and\s+([A-Za-z]+)\s+(in\s+the\s+(?:\w+\s+)?air|within|hung|lingered|echoed)/gi,
        suggest: (_m) => "raw kerosene and damp lime clung to the stale air",
        explanation: "AI often generates rhythmic 3-noun lists ('hope, fear, and sorrow'). Anchor to one or two concrete tactile nouns.",
      },
      {
        regex: /(a\s+tapestry\s+of|a\s+blend\s+of|a\s+mixture\s+of)\s+([A-Za-z]+),\s+([A-Za-z]+),\s+and\s+([A-Za-z]+)/gi,
        suggest: () => "the pungent smell of burning mustard oil",
        explanation: "Replace three abstract feelings with a single pungent sensory detail.",
      },
      {
        regex: /([^\s,]+),\s+([^\s,]+)\s+এবং\s+([^\s,]+)\s+(একসাথে|মিশে|জড়িয়ে|বাতাসে)/gi,
        suggest: () => "পোড়া বারুদের চড়া গন্ধ বাতাসে ভারী হয়ে ঝুলছিল",
        explanation: "কৃত্রিম ত্রিপদী পদবিন্যাস পরিহার করে প্রত্যক্ষ ইন্দ্রিয়গ্রাহ্য বিবরণ দিন।",
      },
    ],
  },
  {
    id: "generic_transitions",
    name: "Generic AI Transitions",
    description: "Formulaic transitional signposts that telegraph plot progression instead of letting momentum drive the cut.",
    severity: "suggestion",
    patterns: [
      {
        regex: /(in\s+the\s+blink\s+of\s+an\s+eye|as\s+fate\s+would\s+have\s+it|with\s+a\s+heavy\s+heart|as\s+the\s+dust\s+settled|meanwhile,\s+across\s+the\s+city)/gi,
        suggest: (match) => {
          if (/blink/i.test(match)) return "before the teacup hit the floor";
          if (/fate/i.test(match)) return "by four that morning";
          if (/dust/i.test(match)) return "when the street cleared";
          return "down at Sadarghat ghat";
        },
        explanation: "Replace filler transitional clichés with precise chronological or spatial scene anchors.",
      },
      {
        regex: /a\s+palpable\s+silence\s+(fell|settled|descended)\s+(over\s+the\s+room|upon\s+them)/gi,
        suggest: () => "the ceiling fan clicked against its rusty casing; no one spoke",
        explanation: "'Palpable silence' is one of the highest-frequency synthetic AI tropes in creative writing.",
      },
      {
        regex: /(পলকের\s+মধ্যে|এদিকে\s+অন্যদিকে|ভারাক্রান্ত\s+হৃদয়ে|ভাগ্যের\s+নির্মম\s+পরিহাসে|বলা\s+বাহুল্য)/gi,
        suggest: () => "হাতের চায়ের কাপটা টেবিলে নামিয়ে রাখার আগেই",
        explanation: "সেকেলে কিংবা কৃত্রিম ট্রানজিশনাল ফ্রেজ বাদ দিয়ে সরাসরি ঘটনায় প্রবেশ করুন।",
      },
    ],
  },
  {
    id: "decorative_purple_prose",
    name: "Decorative Purple Prose & Adjective Stacking",
    description: "Hollow modifier soup and decorative syrupy rhetoric that slows narrative pacing without providing tactile world detail.",
    severity: "warning",
    patterns: [
      {
        regex: /(luminous\s+tapestry|kaleidoscope\s+of\s+emotions|cacophony\s+of\s+sounds|ethereal\s+whispered\s+shadows|verdant\s+emerald\s+expanse|crystalline\s+shards\s+of\s+silence)/gi,
        suggest: (match) => {
          if (/cacophony/i.test(match)) return "screeching rickshaw bells and diesel engines";
          if (/luminous|ethereal/i.test(match)) return "the sharp yellow glare of kerosene lamps";
          return "the muddy banks of the Buriganga";
        },
        explanation: "Replace purple adjective pairings with specific nouns that possess natural sensory weight.",
      },
      {
        regex: /(অনাবিল\s+সৌন্দর্যের\s+আলোকচ্ছটা|অনুভূতির\s+রঙিন\s+ক্যানভাস|শব্দের\s+মহামিলনমেলা|নৈশব্দের\s+স্ফটিক\s+টুকরো|আলো-আঁধারির\s+রহস্যময়\s+নাচ)/gi,
        suggest: () => "ল্যাম্পপোস্টের হলুদ বাতির নিচে ভনভন করা পতঙ্গের ঝাঁক",
        explanation: "মেকি কাব্যিক মিষ্টি অলঙ্কার পরিহার করে শক্ত মাটি-স্পর্শী রূপক ব্যবহার করুন।",
      },
    ],
  },
  {
    id: "cliche_metaphors",
    name: "Dead & Predictable Metaphors",
    description: "Overused figurative language that has lost its vivid evocative spark through sheer repetition.",
    severity: "warning",
    patterns: [
      {
        regex: /(heart\s+beat\s+like\s+a\s+drum|eyes\s+like\s+daggers|cold\s+as\s+ice|like\s+a\s+moth\s+to\s+a\s+flame|double-edged\s+sword|at\s+the\s+eleventh\s+hour|chill\s+down\s+his\s+spine|bated\s+breath)/gi,
        suggest: (match) => {
          if (/heart/i.test(match)) return "his pulse knocked against his collarbone";
          if (/daggers/i.test(match)) return "her pupils narrowed into sharp black slits";
          if (/ice/i.test(match)) return "colder than wet zinc";
          return "with held breath and parted lips";
        },
        explanation: "Revitalize dead metaphors by choosing imagery rooted in the physical setting.",
      },
      {
        regex: /(বুকের\s+ভেতর\s+ঢিপঢিপ\s+করতে\s+লাগল|চোখ\s+দুটো\s+ছুরির\s+মতো|বরফের\s+মতো\s+ঠান্ডা|আগুনে\s+পতঙ্গের\s+মতো|দোধার\s+তলোয়ার|রক্ত\s+হিম\s+হয়ে\s+গেল)/gi,
        suggest: (match) => {
          if (/ঢিপঢিপ/i.test(match)) return "গলার কাছে শিরাগুলো দপদপ করতে লাগল";
          if (/ছুরির/i.test(match)) return "চোখের চাউনি নিরেট কাঁসার মতো কঠিন";
          return "শিরদাঁড়া বেয়ে যেন ঠান্ডা নোনা জল গড়িয়ে পড়ল";
        },
        explanation: "ক্লান্ত জীর্ণ উপমা পরিহার করে মৌলিক দেশজ দৃশ্যকল্প প্রয়োগ করুন।",
      },
    ],
  },
  {
    id: "bengali_idiom_dilution",
    name: "Bengali Idiom Dilution (Synthetic Translation Trap)",
    description: "Replacing rich authentic Bengali vernacular idioms with mechanical literal translations from English LLM training data.",
    severity: "critical",
    patterns: [
      {
        regex: /(তার\s+মনে\s+গভীর\s+আশঙ্কার\s+সৃষ্টি\s+হলো|সে\s+ভীষণ\s+উদ্বিগ্ন\s+হয়ে\s+পড়ল)/gi,
        suggest: () => "বুকের ভেতর ছ্যাঁত করে উঠল",
        explanation: "যান্ত্রিক অনুবাদের বদলে নিখাদ বঙ্গীয় অনুভূতিবাচক বাগধারা প্রয়োগ করুন।",
        vernacularTip: "খাঁটি দেশজ idiom: 'বুকের ভেতর ছ্যাঁত করে উঠল' / 'গা ছমছম করে উঠল'।",
      },
      {
        regex: /(সে\s+অত্যন্ত\s+বিস্মিত\s+ও\s+হতচকিত\s+হলো|সে\s+আকস্মিকভাবে\s+হতভম্ব\s+হয়ে\s+গেল)/gi,
        suggest: () => "মাথায় যেন আকাশ ভেঙে পড়ল",
        explanation: "রোবোটিক অনুবাদ দূর করে শক্তিশালী দেশি প্রবাদ প্রয়োগ করুন।",
        vernacularTip: "খাঁটি বাংলা প্রবাদ: 'মাথায় যেন আকাশ ভেঙে পড়ল' / 'চোখে সরষে ফুল দেখল'।",
      },
      {
        regex: /(তিনি\s+অত্যন্ত\s+ক্রুদ্ধ\s+ও\s+ক্ষিপ্ত\s+হলেন|তার\s+রাগ\s+উদ্বেলিত\s+হলো)/gi,
        suggest: () => "রাগে গা রি রি করে উঠল",
        explanation: "বাংলা ভাষার ক্রোধ প্রকাশের অনন্য ধ্বনিব্যঞ্জক বাগধারা ফিরিয়ে আনুন।",
        vernacularTip: "ধ্বনিব্যঞ্জনা: 'রাগে গা রি রি করে উঠল' / 'চোখ রক্তবর্ণ ধারণ করল'।",
      },
      {
        regex: /(পরিস্থিতি\s+অত্যন্ত\s+জটিল\s+হয়ে\s+গেল|পরিস্থিতি\s+নিয়ন্ত্রণের\s+বাইরে\s+চলে\s+গেল)/gi,
        suggest: () => "সবকিছু যেন লেজেগোবরে হয়ে দাঁড়াল",
        explanation: "আড়ষ্ট আধুনিক অনুবাদ বর্জন করে প্রচলিত জীবন্ত বাগধারা ব্যবহার করুন।",
        vernacularTip: "প্রচলিত রূপক: 'লেজেগোবরে অবস্থা' / 'একুল ওকুল দুকুল গেল'।",
      },
      {
        regex: /(গোপন\s+তথ্য\s+প্রকাশিত\s+হতে\s+লাগল|রহস্যের\s+জট\s+খুলতে\s+লাগল)/gi,
        suggest: () => "কেঁচো খুঁড়তে সাপ বেরিয়ে এলো",
        explanation: "রসালো দেশজ উপমা কাহিনীর স্থানীয় স্বাদ অক্ষুণ্ণ রাখে।",
        vernacularTip: "বাংলা লোকজ বাগধারা: 'কেঁচো খুঁড়তে সাপ' / 'থলের বিড়াল বেরিয়ে পড়া'।",
      },
      {
        regex: /(তিনি\s+সাহসের\s+সাথে\s+পরিস্থিতি\s+মোকাবেলা\s+করলেন|তিনি\s+কঠিন\s+প্রতিজ্ঞা\s+নিলেন)/gi,
        suggest: () => "কোমরে দড়ি বেঁধে ময়দানে নামলেন",
        explanation: "কৃত্রিম বিবৃতিকে কর্মমুখী দেশজ ভঙ্গিমায় রূপান্তর করুন।",
        vernacularTip: "দেশজ বাগধারা: 'কোমরে দড়ি বাঁধা' / 'বুকের পাটা দেখানো'।",
      },
    ],
  },
];

function analyzeTextForSlop(text: string, projectId: string, intensity: "gentle" | "standard" | "ruthless" = "standard"): DeslopAuditResult {
  const lines = text.split("\n");
  const findings: DeslopFinding[] = [];
  const rubricCounts: Record<DeslopRuleId, number> = {
    emotion_labeling: 0,
    unsupported_conclusions: 0,
    formulaic_triads: 0,
    generic_transitions: 0,
    decorative_purple_prose: 0,
    cliche_metaphors: 0,
    bengali_idiom_dilution: 0,
  };

  let globalOffset = 0;
  lines.forEach((lineText, lineIdx) => {
    SLOP_RULES.forEach((rule) => {
      // In gentle mode, skip suggestions
      if (intensity === "gentle" && rule.severity === "suggestion") return;

      rule.patterns.forEach((pattern) => {
        // Reset lastIndex for regex with global flag
        pattern.regex.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.regex.exec(lineText)) !== null) {
          const matchedText = match[0];
          const startOffset = globalOffset + match.index;
          const endOffset = startOffset + matchedText.length;
          const findingId = `slop_${rule.id}_${lineIdx}_${match.index}_${Math.random().toString(36).substring(2, 6)}`;

          rubricCounts[rule.id]++;

          findings.push({
            id: findingId,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            originalText: matchedText,
            suggestedRevision: pattern.suggest(matchedText),
            startOffset,
            endOffset,
            line: lineIdx + 1,
            explanation: pattern.explanation,
            vernacularTip: pattern.vernacularTip,
          });

          // Prevent infinite loop on zero-length matches
          if (pattern.regex.lastIndex === match.index) {
            pattern.regex.lastIndex++;
          }
        }
      });
    });
    globalOffset += lineText.length + 1; // +1 for \n
  });

  const wordCount = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
  const slopDensityPer1kWords = wordCount > 0 ? Number(((findings.length / wordCount) * 1000).toFixed(1)) : 0;

  // Calculate Cleanliness Score: base 100, penalized by findings weighted by severity
  let penalty = 0;
  findings.forEach((f) => {
    if (f.severity === "critical") penalty += 6;
    else if (f.severity === "warning") penalty += 3.5;
    else penalty += 1.5;
  });

  const cleanlinessScore = Math.max(12, Math.min(100, Math.round(100 - penalty)));

  const rubricSummary: Record<DeslopRuleId, { name: string; count: number; description: string }> = {} as any;
  SLOP_RULES.forEach((r) => {
    rubricSummary[r.id] = {
      name: r.name,
      count: rubricCounts[r.id] || 0,
      description: r.description,
    };
  });

  const result: DeslopAuditResult = {
    projectId,
    cleanlinessScore,
    slopDensityPer1kWords,
    wordCount,
    issueCount: findings.length,
    rubricSummary,
    findings,
    analyzedAt: new Date().toISOString(),
  };

  deslopAuditCache.set(projectId, result);
  return result;
}

const AuditRequestSchema = z.object({
  text: z.string().optional(),
  intensity: z.enum(["gentle", "standard", "ruthless"]).optional().default("standard"),
  preserveVernacular: z.boolean().optional().default(true),
});

const RewriteRequestSchema = z.object({
  text: z.string(),
  findingIds: z.array(z.string()).optional(),
  intensity: z.enum(["gentle", "standard", "ruthless"]).optional().default("standard"),
  preserveVernacular: z.boolean().optional().default(true),
});

/**
 * GET /api/v1/projects/:id/deslop
 * Returns the cached audit or runs a fresh audit on default sample manuscript.
 */
deslopRouter.get("/v1/projects/:id/deslop", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const cached = deslopAuditCache.get(projectId);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    // Default sample prose exhibiting common AI formulaic patterns for instant audit demo
    const defaultSample = `Heavy rain struck the red brick arches of Curzon Hall. Inside the archives, Professor Rahman felt an overwhelming sense of melancholy as he opened the iron chest. This changed everything forever in ways they could not imagine. He was surrounded by pain, hope, and longing in the stale air. A palpable silence fell over the room as Dr. Elena looked up. Meanwhile, across the city, the censors were quietly assembling. তার মনে গভীর আশঙ্কার সৃষ্টি হলো যখন সে শুনল টেলিফোনটি বাজছে। পরিস্থিতি অত্যন্ত জটিল হয়ে গেল এবং সে আকস্মিকভাবে হতভম্ব হয়ে গেল।`;

    const audit = analyzeTextForSlop(defaultSample, projectId, "standard");
    return res.json({ success: true, data: audit });
  } catch (err: any) {
    logger.error(`[deslop] Error getting audit: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/deslop/audit
 * Audits text against the 7-point functional semantic de-slop rubric.
 */
deslopRouter.post("/v1/projects/:id/deslop/audit", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const parseResult = AuditRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: parseResult.error.issues });
    }

    const { text, intensity } = parseResult.data;
    let targetText = text;

    if (!targetText || targetText.trim().length === 0) {
      // Look up project content from db if available
      try {
        const [proj] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId)).limit(1);
        if (proj && (proj as any).content) {
          targetText = (proj as any).content;
        }
      } catch {
        // Fall back to sample
      }
    }

    if (!targetText || targetText.trim().length === 0) {
      targetText = `Heavy rain struck Curzon Hall. Inside the archives, Professor Rahman felt a profound sense of despair. This changed everything forever. Little did he know that fate was waiting. It was a mixture of fear, anticipation, and resolve. In the blink of an eye, the sirens began. তার মনে গভীর ভীতির সঞ্চার হলো এবং সে অত্যন্ত হতভম্ব হয়ে গেল।`;
    }

    const audit = analyzeTextForSlop(targetText, projectId, intensity);
    logger.info({ projectId, score: audit.cleanlinessScore, issues: audit.issueCount }, "[deslop] Audit completed");

    return res.json({
      success: true,
      message: "Prose audit completed against 7-point anti-slop rubric",
      data: audit,
    });
  } catch (err: any) {
    logger.error(`[deslop] Error running audit: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v1/projects/:id/deslop/rewrite
 * De-slops and rewrites the prose by applying anti-AI formulaic replacements.
 */
deslopRouter.post("/v1/projects/:id/deslop/rewrite", async (req: Request, res: Response) => {
  try {
    const projectId = String(req.params.id);
    const parseResult = RewriteRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: parseResult.error.issues });
    }

    const { text, findingIds, intensity } = parseResult.data;
    // Run an audit first to find all target replacement matches
    const audit = analyzeTextForSlop(text, projectId, intensity);

    const targetFindings = findingIds && findingIds.length > 0
      ? audit.findings.filter((f) => findingIds.includes(f.id))
      : audit.findings;

    let rewritten = text;
    const appliedPatches: Array<{
      ruleId: string;
      original: string;
      replacement: string;
      rationale: string;
    }> = [];
    const vernacularIdiomsAdded: string[] = [];

    // Apply replacements from back to front to preserve string offsets if needed,
    // or string replace direct matches safely
    targetFindings.forEach((f) => {
      if (rewritten.includes(f.originalText)) {
        rewritten = rewritten.replace(f.originalText, f.suggestedRevision);
        appliedPatches.push({
          ruleId: f.ruleId,
          original: f.originalText,
          replacement: f.suggestedRevision,
          rationale: f.explanation,
        });
        if (f.vernacularTip) {
          vernacularIdiomsAdded.push(f.suggestedRevision);
        }
      }
    });

    // Calculate projected cleanliness score
    const postAudit = analyzeTextForSlop(rewritten, projectId, intensity);

    logger.info(
      { projectId, patchesCount: appliedPatches.length, prevScore: audit.cleanlinessScore, newScore: postAudit.cleanlinessScore },
      "[deslop] Rewrite completed"
    );

    return res.json({
      success: true,
      message: `Successfully applied ${appliedPatches.length} anti-slop improvements`,
      data: {
        originalText: text,
        rewrittenText: rewritten,
        changesApplied: appliedPatches.length,
        previousCleanlinessScore: audit.cleanlinessScore,
        projectedCleanlinessScore: postAudit.cleanlinessScore,
        appliedPatches,
        vernacularIdiomsAdded,
      },
    });
  } catch (err: any) {
    logger.error(`[deslop] Error running rewrite: ${err.message}`);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default deslopRouter;
