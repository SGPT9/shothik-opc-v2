import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { synthesizeDialogueLine } from "./voice-casting";
import { persistSuiteManifest, loadSuiteManifest } from "../lib/novel-engine/suite-manifest-store";

export const phonemeTunerRouter = Router();

export type PhonemeCategory =
  | "character_name"
  | "mythology_fantasy"
  | "geographic_landmark"
  | "cultural_archaic";

export interface PhoneticRuleEntry {
  id: string;
  projectId: string;
  grapheme: string;
  ipa: string;
  syllabification: string[];
  stressIndex: number;
  diacritics: {
    hasHasanta: boolean;
    hasChandrabindu: boolean;
    hasBishorgo: boolean;
    hasAnusvara: boolean;
    vowelMarkers: string[];
  };
  ssmlPhoneme: string;
  category: PhonemeCategory;
  notes: string;
  updatedAt: string;
}

export interface PhonemeDictionaryStore {
  projectId: string;
  entries: PhoneticRuleEntry[];
  updatedAt: string;
}

// In-memory phonetic dictionary store
const dictionaryStores = new Map<string, PhonemeDictionaryStore>();

// Bengali Phonological Rules Engine
export function analyzeBengaliPhonetics(word: string, customIpa?: string): {
  ipa: string;
  syllabification: string[];
  stressIndex: number;
  diacritics: {
    hasHasanta: boolean;
    hasChandrabindu: boolean;
    hasBishorgo: boolean;
    hasAnusvara: boolean;
    vowelMarkers: string[];
  };
  ssmlPhoneme: string;
} {
  const cleanWord = word.trim();

  // 1. Detect Diacritics
  const hasHasanta = cleanWord.includes("্");
  const hasChandrabindu = cleanWord.includes("ঁ");
  const hasBishorgo = cleanWord.includes("ঃ");
  const hasAnusvara = cleanWord.includes("ং");

  const vowelMarkers: string[] = [];
  const allVowels = ["া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ"];
  for (const v of allVowels) {
    if (cleanWord.includes(v)) vowelMarkers.push(v);
  }

  // 2. Rule-based IPA conversion if not explicitly provided
  let ipa = customIpa;
  if (!ipa) {
    ipa = convertBengaliToIpa(cleanWord);
  }

  // 3. Syllabification heuristic
  const syllabification = syllabifyBengali(cleanWord);

  // 4. Default primary stress in Bengali is on the initial syllable
  const stressIndex = 0;

  // 5. Generate SSML phoneme tag
  const ssmlPhoneme = `<phoneme alphabet="ipa" ph="${ipa}">${cleanWord}</phoneme>`;

  return {
    ipa,
    syllabification,
    stressIndex,
    diacritics: {
      hasHasanta,
      hasChandrabindu,
      hasBishorgo,
      hasAnusvara,
      vowelMarkers
    },
    ssmlPhoneme
  };
}

// Deterministic Bengali to IPA mapping table
const CHAR_TO_IPA: Record<string, string> = {
  "অ": "ɔ",
  "আ": "a",
  "ই": "i",
  "ঈ": "iː",
  "উ": "u",
  "ঊ": "uː",
  "ঋ": "ri",
  "এ": "e",
  "ঐ": "oi̯",
  "ও": "o",
  "ঔ": "ou̯",
  "া": "a",
  "ি": "i",
  "ী": "iː",
  "ু": "u",
  "ূ": "uː",
  "ৃ": "ri",
  "ে": "e",
  "ৈ": "oi̯",
  "ো": "o",
  "ৌ": "ou̯",
  "ক": "k",
  "খ": "kʰ",
  "গ": "ɡ",
  "ঘ": "ɡʱ",
  "ঙ": "ŋ",
  "চ": "tʃ",
  "ছ": "tʃʰ",
  "জ": "dʒ",
  "ঝ": "dʒʱ",
  "ঞ": "n",
  "ট": "ʈ",
  "ঠ": "ʈʰ",
  "ড": "ɖ",
  "ঢ": "ɖʱ",
  "ণ": "n",
  "ত": "t̪",
  "থ": "t̪ʰ",
  "দ": "d̪",
  "ধ": "d̪ʱ",
  "ন": "n",
  "প": "p",
  "ফ": "pʰ",
  "ব": "b",
  "ভ": "bʱ",
  "ম": "m",
  "য": "dʒ",
  "র": "r",
  "ল": "l",
  "শ": "ʃ",
  "ষ": "ʃ",
  "স": "ʃ",
  "হ": "ɦ",
  "ড়": "ɽ",
  "ঢ়": "ɽʱ",
  "য়": "e̯",
  "ৎ": "t̪",
  "ং": "ŋ",
  "ঃ": "h",
  "ঁ": "~̃"
};

export function convertBengaliToIpa(word: string): string {
  let result = "";
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (ch === "্") {
      // Hasanta cancels inherent vowel
      continue;
    }
    const mapped = CHAR_TO_IPA[ch];
    if (mapped) {
      result += mapped;
    } else {
      result += ch;
    }
  }
  return result;
}

export function syllabifyBengali(word: string): string[] {
  // Regex splitting on consonant-vowel boundaries
  const parts: string[] = [];
  let current = "";

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    current += ch;

    // If next character is vowel marker or word ends
    const next = word[i + 1];
    const isVowelMarker = ["া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ"].includes(next);
    const isHasanta = ch === "্" || next === "্";

    if (!isHasanta && (isVowelMarker || (current.length >= 2 && !isVowelMarker))) {
      parts.push(current);
      current = "";
    }
  }

  if (current) {
    if (parts.length > 0 && current.length === 1 && current === "্") {
      parts[parts.length - 1] += current;
    } else {
      parts.push(current);
    }
  }

  return parts.length > 0 ? parts : [word];
}

export function generateDefaultPhonemeDictionary(projectId: string): PhonemeDictionaryStore {
  const defaultEntries: PhoneticRuleEntry[] = [
    {
      id: "phn_himu",
      projectId,
      grapheme: "হিমালয়",
      ipa: "himaːlɔe̯",
      syllabification: ["হি", "মা", "লয়"],
      stressIndex: 0,
      diacritics: {
        hasHasanta: false,
        hasChandrabindu: false,
        hasBishorgo: false,
        hasAnusvara: false,
        vowelMarkers: ["ি", "া"]
      },
      ssmlPhoneme: '<phoneme alphabet="ipa" ph="himaːlɔe̯">হিমালয়</phoneme>',
      category: "character_name",
      notes: "Himu's formal ancestral name. Ensure elongated 'aa' vowel.",
      updatedAt: new Date().toISOString()
    },
    {
      id: "phn_sadarghat",
      projectId,
      grapheme: "সোমেশ্বরী",
      ipa: "ʃomeʃːoriː",
      syllabification: ["সো", "মেশ্ব", "রী"],
      stressIndex: 0,
      diacritics: {
        hasHasanta: true,
        hasChandrabindu: false,
        hasBishorgo: false,
        hasAnusvara: false,
        vowelMarkers: ["ো", "ে", "ী"]
      },
      ssmlPhoneme: '<phoneme alphabet="ipa" ph="ʃomeʃːoriː">সোমেশ্বরী</phoneme>',
      category: "geographic_landmark",
      notes: "River in Netrokona. Geminated 'sh-sh' due to ba-fala cluster.",
      updatedAt: new Date().toISOString()
    },
    {
      id: "phn_noirito",
      projectId,
      grapheme: "নৈঋত",
      ipa: "noi̯rit̪",
      syllabification: ["নৈ", "ঋত"],
      stressIndex: 0,
      diacritics: {
        hasHasanta: false,
        hasChandrabindu: false,
        hasBishorgo: false,
        hasAnusvara: false,
        vowelMarkers: ["ৈ"]
      },
      ssmlPhoneme: '<phoneme alphabet="ipa" ph="noi̯rit̪">নৈঋত</phoneme>',
      category: "mythology_fantasy",
      notes: "South-western directional guardian deity in Bengali mythology.",
      updatedAt: new Date().toISOString()
    },
    {
      id: "phn_chandrabindu",
      projectId,
      grapheme: "বাঁশঝাড়",
      ipa: "ba~̃ʃdʒʱaɽ",
      syllabification: ["বাঁশ", "ঝাড়"],
      stressIndex: 0,
      diacritics: {
        hasHasanta: false,
        hasChandrabindu: true,
        hasBishorgo: false,
        hasAnusvara: false,
        vowelMarkers: ["া"]
      },
      ssmlPhoneme: '<phoneme alphabet="ipa" ph="ba~̃ʃdʒʱaɽ">বাঁশঝাড়</phoneme>',
      category: "cultural_archaic",
      notes: "Bamboo grove. Requires distinctive nasalized vowel quality.",
      updatedAt: new Date().toISOString()
    }
  ];

  const store: PhonemeDictionaryStore = {
    projectId,
    entries: defaultEntries,
    updatedAt: new Date().toISOString()
  };

  dictionaryStores.set(projectId, store);
  return store;
}

// ======================== ROUTES ========================

// 1. GET /v1/projects/:id/phonemes
phonemeTunerRouter.get(
  ["/v1/projects/:id/phonemes", "/api/v1/projects/:id/phonemes"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      let store = dictionaryStores.get(projectId);
      if (!store) {
        const persisted = await loadSuiteManifest<PhonemeDictionaryStore>(projectId, "phoneme_tuner");
        if (persisted && Array.isArray(persisted.entries)) {
          store = persisted;
          dictionaryStores.set(projectId, store);
        } else {
          store = generateDefaultPhonemeDictionary(projectId);
        }
      }
      return res.json({ success: true, data: store });
    } catch (err: any) {
      logger.error({ err, projectId }, "[PhonemeTuner] Failed to fetch dictionary");
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

// 2. POST /v1/projects/:id/phonemes/transcribe
const transcribeSchema = z.object({
  word: z.string().min(1),
  customIpa: z.string().optional()
});

phonemeTunerRouter.post(
  ["/v1/projects/:id/phonemes/transcribe", "/api/v1/projects/:id/phonemes/transcribe"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = transcribeSchema.parse(req.body);
      const analysis = analyzeBengaliPhonetics(body.word, body.customIpa);

      return res.json({
        success: true,
        data: {
          word: body.word,
          projectId,
          ...analysis
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[PhonemeTuner] Transcribe failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 3. POST /v1/projects/:id/phonemes (Upsert)
const upsertPhonemeSchema = z.object({
  id: z.string().optional(),
  grapheme: z.string().min(1),
  ipa: z.string().min(1),
  syllabification: z.array(z.string()).default([]),
  stressIndex: z.number().int().default(0),
  category: z.enum(["character_name", "mythology_fantasy", "geographic_landmark", "cultural_archaic"]),
  notes: z.string().default("")
});

phonemeTunerRouter.post(
  ["/v1/projects/:id/phonemes", "/api/v1/projects/:id/phonemes"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = upsertPhonemeSchema.parse(req.body);
      let store = dictionaryStores.get(projectId);
      if (!store) {
        const persisted = await loadSuiteManifest<PhonemeDictionaryStore>(projectId, "phoneme_tuner");
        if (persisted && Array.isArray(persisted.entries)) {
          store = persisted;
          dictionaryStores.set(projectId, store);
        } else {
          store = generateDefaultPhonemeDictionary(projectId);
        }
      }

      const analysis = analyzeBengaliPhonetics(body.grapheme, body.ipa);
      const entryId = body.id || `phn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const existingIdx = store.entries.findIndex(e => e.id === entryId || e.grapheme === body.grapheme);

      const entry: PhoneticRuleEntry = {
        id: entryId,
        projectId,
        grapheme: body.grapheme,
        ipa: body.ipa,
        syllabification: body.syllabification.length > 0 ? body.syllabification : analysis.syllabification,
        stressIndex: body.stressIndex,
        diacritics: analysis.diacritics,
        ssmlPhoneme: `<phoneme alphabet="ipa" ph="${body.ipa}">${body.grapheme}</phoneme>`,
        category: body.category,
        notes: body.notes,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        store.entries[existingIdx] = entry;
      } else {
        store.entries.unshift(entry);
      }

      store.updatedAt = new Date().toISOString();
      dictionaryStores.set(projectId, store);
      void persistSuiteManifest(projectId, "phoneme_tuner", store);
      void persistSuiteManifest(projectId, "phoneme_tuner", store);

      return res.json({ success: true, data: entry });
    } catch (err: any) {
      logger.error({ err, projectId }, "[PhonemeTuner] Upsert failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 4. DELETE /v1/projects/:id/phonemes/:entryId
phonemeTunerRouter.delete(
  ["/v1/projects/:id/phonemes/:entryId", "/api/v1/projects/:id/phonemes/:entryId"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    const entryId = String(req.params.entryId);
    try {
      let store = dictionaryStores.get(projectId);
      if (!store) {
        const persisted = await loadSuiteManifest<PhonemeDictionaryStore>(projectId, "phoneme_tuner");
        if (persisted && Array.isArray(persisted.entries)) {
          store = persisted;
          dictionaryStores.set(projectId, store);
        } else {
          store = generateDefaultPhonemeDictionary(projectId);
        }
      }

      store.entries = store.entries.filter(e => e.id !== entryId);
      store.updatedAt = new Date().toISOString();
      dictionaryStores.set(projectId, store);
      void persistSuiteManifest(projectId, "phoneme_tuner", store);
      void persistSuiteManifest(projectId, "phoneme_tuner", store);

      return res.json({ success: true, message: `Phoneme entry ${entryId} deleted` });
    } catch (err: any) {
      logger.error({ err, projectId, entryId }, "[PhonemeTuner] Delete failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 5. POST /v1/projects/:id/phonemes/preview-audio
const previewAudioSchema = z.object({
  word: z.string().min(1),
  ipa: z.string().optional(),
  personaId: z.string().default("nusrat_banking")
});

phonemeTunerRouter.post(
  ["/v1/projects/:id/phonemes/preview-audio", "/api/v1/projects/:id/phonemes/preview-audio"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = previewAudioSchema.parse(req.body);
      const audioResult = await synthesizeDialogueLine({
        text: body.word,
        personaId: body.personaId,
        emotion: "reassuring"
      });

      return res.json({
        success: true,
        data: {
          word: body.word,
          ipa: body.ipa,
          ...audioResult
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[PhonemeTuner] Preview audio failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 6. POST /v1/projects/:id/phonemes/scan-manuscript
const scanManuscriptSchema = z.object({
  manuscriptText: z.string().min(1)
});

phonemeTunerRouter.post(
  ["/v1/projects/:id/phonemes/scan-manuscript", "/api/v1/projects/:id/phonemes/scan-manuscript"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = scanManuscriptSchema.parse(req.body);
      const store = dictionaryStores.get(projectId) || generateDefaultPhonemeDictionary(projectId);

      // Extract unique Bengali words with complex clusters or rare diacritics
      const words = Array.from(new Set(body.manuscriptText.match(/[\u0980-\u09FF]+/g) || []));
      const potentialRisks = [];

      for (const w of words) {
        if (w.length < 3) continue;
        const hasCompound = w.includes("্");
        const hasChandrabindu = w.includes("ঁ");
        const hasBishorgo = w.includes("ঃ");
        const isAlreadyTuned = store.entries.some(e => e.grapheme === w);

        if ((hasCompound || hasChandrabindu || hasBishorgo) && !isAlreadyTuned) {
          const analysis = analyzeBengaliPhonetics(w);
          potentialRisks.push({
            word: w,
            suggestedIpa: analysis.ipa,
            syllabification: analysis.syllabification,
            hasCompound,
            hasChandrabindu,
            hasBishorgo,
            riskLevel: hasCompound && hasChandrabindu ? "high" : "medium"
          });
        }
      }

      return res.json({
        success: true,
        data: {
          projectId,
          totalScannedWords: words.length,
          riskCandidatesFound: potentialRisks.length,
          candidates: potentialRisks.slice(0, 20)
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[PhonemeTuner] Manuscript scan failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);
