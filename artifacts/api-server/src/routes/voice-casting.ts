import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const voiceCastingRouter = Router();

export interface VoicePersonaMetadata {
  id: string;
  name: string;
  dialect: string;
  pitchHz: number;
  defaultEmotion: string;
  gender: "female" | "male" | "neutral";
  timbreDescription: string;
}

export interface CharacterVoiceProfile {
  characterId: string;
  characterName: string;
  personaId: string;
  dialect: string;
  pitchOffsetSemitones: number;
  speakingRate: number;
  defaultEmotion: string;
  customPronunciations: Array<{ word: string; phoneticIpa: string }>;
  sampleLine: string;
  sampleAudioBase64?: string;
  updatedAt: string;
}

export interface ProjectCastRoster {
  projectId: string;
  narratorPersonaId: string;
  defaultDialect: string;
  characters: CharacterVoiceProfile[];
  updatedAt: string;
}

// Available voice personas backed by 24kHz Bangla Voice AI engine
export const AVAILABLE_PERSONAS: VoicePersonaMetadata[] = [
  {
    id: "ayesha_sales",
    name: "Ayesha (আইশা - Sales & Story)",
    dialect: "Standard Dhaka Bangla",
    pitchHz: 215.0,
    defaultEmotion: "empathetic",
    gender: "female",
    timbreDescription: "Resonant, clear, emotionally expressive, ideal for empathetic protagonists."
  },
  {
    id: "nusrat_banking",
    name: "Nusrat (নুসরাত - Formal Narrator)",
    dialect: "Formal Pramit Bangla",
    pitchHz: 205.0,
    defaultEmotion: "reassuring",
    gender: "female",
    timbreDescription: "Grounded, authoritative, steady pacing, perfect for literary narration."
  },
  {
    id: "zara_corporate",
    name: "Zara (জারা - Dramatic & Sharp)",
    dialect: "Bilingual Bangla-English",
    pitchHz: 198.0,
    defaultEmotion: "professional",
    gender: "female",
    timbreDescription: "Crisp, commanding, intense emotional range for fierce heroines or antagonists."
  },
  {
    id: "tania_casual",
    name: "Tania (তানিয়া - Colloquial & Lively)",
    dialect: "Colloquial Dhakaiya",
    pitchHz: 225.0,
    defaultEmotion: "warm",
    gender: "female",
    timbreDescription: "Playful, energetic, melodic intonation, ideal for younger cousins and allies."
  }
];

const castStores = new Map<string, ProjectCastRoster>();

export function generateDefaultCastRoster(projectId: string): ProjectCastRoster {
  const defaultCharacters: CharacterVoiceProfile[] = [
    {
      characterId: "char_himu",
      characterName: "হিমু (Himu)",
      personaId: "ayesha_sales",
      dialect: "Standard Dhaka Bangla",
      pitchOffsetSemitones: -2,
      speakingRate: 0.95,
      defaultEmotion: "empathetic",
      customPronunciations: [{ word: "হিমালয়", phoneticIpa: "himaːlɔe̯" }],
      sampleLine: "আমি কোনো নিয়ম মানি না, নিয়ম আমাকে খুঁজে নেয়।",
      updatedAt: new Date().toISOString()
    },
    {
      characterId: "char_badal",
      characterName: "বাদল (Badal)",
      personaId: "tania_casual",
      dialect: "Colloquial Dhakaiya",
      pitchOffsetSemitones: 1,
      speakingRate: 1.1,
      defaultEmotion: "warm",
      customPronunciations: [],
      sampleLine: "হিমু ভাই, এত রাতে বৃষ্টিতে ভিজলে আপনার কিন্তু ভয়াবহ নিউমোনিয়া হবে!",
      updatedAt: new Date().toISOString()
    },
    {
      characterId: "char_rupa",
      characterName: "রুপা (Rupa)",
      personaId: "zara_corporate",
      dialect: "Formal Pramit Bangla",
      pitchOffsetSemitones: 0,
      speakingRate: 1.0,
      defaultEmotion: "dramatic",
      customPronunciations: [],
      sampleLine: "তুমি নীল পদ্ম আনতে পারোনি, কিন্তু নীল খামে চিঠি পাঠিয়েছ।",
      updatedAt: new Date().toISOString()
    },
    {
      characterId: "char_narrator",
      characterName: "কথক (Narrator)",
      personaId: "nusrat_banking",
      dialect: "Formal Pramit Bangla",
      pitchOffsetSemitones: 0,
      speakingRate: 1.0,
      defaultEmotion: "reassuring",
      customPronunciations: [],
      sampleLine: "রাত তখন আড়াইটা। ঢাকার রাজপথ ধোঁয়াটে বৃষ্টির চাদরে মোড়া।",
      updatedAt: new Date().toISOString()
    }
  ];

  const roster: ProjectCastRoster = {
    projectId,
    narratorPersonaId: "nusrat_banking",
    defaultDialect: "Standard Dhaka Bangla",
    characters: defaultCharacters,
    updatedAt: new Date().toISOString()
  };

  castStores.set(projectId, roster);
  return roster;
}

// Synthesizer helper: calls local 24kHz Voice AI daemon (:8001) or returns deterministic WAV buffer
export async function synthesizeDialogueLine(params: {
  text: string;
  personaId: string;
  emotion?: string;
  pitchOffsetSemitones?: number;
  speakingRate?: number;
}): Promise<{
  audioBase64: string;
  durationSeconds: number;
  sampleRate: number;
  format: string;
  latencyMs: number;
  source: "voice_ai_daemon_8001" | "deterministic_buffer";
}> {
  const startTime = performance.now();
  const VOICE_AI_URL = process.env.BANGLA_VOICE_AI_URL || "http://127.0.0.1:8001";

  try {
    const encodedText = encodeURIComponent(params.text);
    const persona = params.personaId || "ayesha_sales";
    const emotion = params.emotion || "empathetic";

    const fetchUrl = `${VOICE_AI_URL}/api/v1/synthesize?text=${encodedText}&persona=${persona}&emotion=${emotion}&include_breaths=true`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data: any = await response.json();
      if (data && data.audio_base64) {
        const latencyMs = Number((performance.now() - startTime).toFixed(2));
        return {
          audioBase64: data.audio_base64,
          durationSeconds: data.duration_seconds || 1.2,
          sampleRate: data.sample_rate || 24000,
          format: data.format || "wav",
          latencyMs,
          source: "voice_ai_daemon_8001"
        };
      }
    }
  } catch (err: any) {
    logger.debug({ err: err.message }, "[VoiceCasting] Local voice AI daemon unreachable, using fallback buffer");
  }

  // Deterministic 24kHz Fallback Audio Header + Noise (Ensures 100% offline & test reliability)
  const duration = Math.max(0.6, Number((params.text.length * 0.06).toFixed(2)));
  const latencyMs = Number((performance.now() - startTime).toFixed(2));

  // Minimal valid 24kHz 16-bit Mono PCM WAV base64
  const fallbackWavBase64 = "UklGRqRwAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YYBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  return {
    audioBase64: fallbackWavBase64,
    durationSeconds: duration,
    sampleRate: 24000,
    format: "wav",
    latencyMs,
    source: "deterministic_buffer"
  };
}

// ======================== ROUTES ========================

// 1. GET Available Personas
voiceCastingRouter.get(
  ["/v1/voice-casting/available-personas", "/api/v1/voice-casting/available-personas"],
  async (_req: Request, res: Response) => {
    return res.json({
      success: true,
      data: {
        personas: AVAILABLE_PERSONAS,
        engineSampleRate: 24000,
        supportedEmotions: ["empathetic", "warm", "reassuring", "dramatic", "professional", "urgent"],
        supportedDialects: [
          "Standard Dhaka Bangla",
          "Formal Pramit Bangla",
          "Colloquial Dhakaiya",
          "Chittagonian",
          "Sylheti",
          "Bilingual Bangla-English"
        ]
      }
    });
  }
);

// 2. GET Project Cast Roster
voiceCastingRouter.get(
  ["/v1/projects/:id/voice-casting", "/api/v1/projects/:id/voice-casting"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      let roster = castStores.get(projectId);
      if (!roster) {
        roster = generateDefaultCastRoster(projectId);
      }
      return res.json({ success: true, data: roster });
    } catch (err: any) {
      logger.error({ err, projectId }, "[VoiceCasting] Failed to load cast roster");
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

// 3. POST Assign or Update Character Voice Profile
const assignProfileSchema = z.object({
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  personaId: z.string().min(1),
  dialect: z.string().default("Standard Dhaka Bangla"),
  pitchOffsetSemitones: z.number().min(-12).max(12).default(0),
  speakingRate: z.number().min(0.5).max(2.0).default(1.0),
  defaultEmotion: z.string().default("empathetic"),
  customPronunciations: z.array(z.object({
    word: z.string(),
    phoneticIpa: z.string()
  })).default([]),
  sampleLine: z.string().default("আমি প্রস্তুত।")
});

voiceCastingRouter.post(
  ["/v1/projects/:id/voice-casting/assign", "/api/v1/projects/:id/voice-casting/assign"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = assignProfileSchema.parse(req.body);
      let roster = castStores.get(projectId);
      if (!roster) {
        roster = generateDefaultCastRoster(projectId);
      }

      const existingIdx = roster.characters.findIndex(c => c.characterId === body.characterId);
      const updatedProfile: CharacterVoiceProfile = {
        characterId: body.characterId,
        characterName: body.characterName,
        personaId: body.personaId,
        dialect: body.dialect,
        pitchOffsetSemitones: body.pitchOffsetSemitones,
        speakingRate: body.speakingRate,
        defaultEmotion: body.defaultEmotion,
        customPronunciations: body.customPronunciations,
        sampleLine: body.sampleLine,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        roster.characters[existingIdx] = updatedProfile;
      } else {
        roster.characters.push(updatedProfile);
      }

      roster.updatedAt = new Date().toISOString();
      castStores.set(projectId, roster);

      return res.json({ success: true, data: updatedProfile });
    } catch (err: any) {
      logger.error({ err, projectId }, "[VoiceCasting] Failed to assign voice profile");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 4. POST Audition Character Voice
const auditionSchema = z.object({
  characterName: z.string().min(1),
  personaId: z.string().min(1),
  text: z.string().min(1),
  emotion: z.string().default("empathetic"),
  pitchOffsetSemitones: z.number().default(0),
  speakingRate: z.number().default(1.0)
});

voiceCastingRouter.post(
  ["/v1/projects/:id/voice-casting/audition", "/api/v1/projects/:id/voice-casting/audition"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = auditionSchema.parse(req.body);
      const audioResult = await synthesizeDialogueLine({
        text: body.text,
        personaId: body.personaId,
        emotion: body.emotion,
        pitchOffsetSemitones: body.pitchOffsetSemitones,
        speakingRate: body.speakingRate
      });

      return res.json({
        success: true,
        data: {
          projectId,
          characterName: body.characterName,
          personaId: body.personaId,
          text: body.text,
          ...audioResult
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[VoiceCasting] Audition synthesis failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);

// 5. POST Render Multi-Cast Scene Audio
const renderSceneSchema = z.object({
  sceneText: z.string().min(1),
  narratorOverridePersona: z.string().optional()
});

voiceCastingRouter.post(
  ["/v1/projects/:id/voice-casting/render-scene", "/api/v1/projects/:id/voice-casting/render-scene"],
  async (req: Request, res: Response) => {
    const projectId = String(req.params.id);
    try {
      const body = renderSceneSchema.parse(req.body);
      let roster = castStores.get(projectId);
      if (!roster) {
        roster = generateDefaultCastRoster(projectId);
      }

      // Parse lines: e.g. "হিমু: কথা বলল।" or narration
      const rawLines = body.sceneText.split("\n").map(l => l.trim()).filter(Boolean);
      const renderedClips = [];
      let totalDuration = 0;

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const colonMatch = line.match(/^([^:：]+)[:：]\s*(.+)$/);

        let speakerName = "কথক (Narrator)";
        let dialogueText = line;

        if (colonMatch) {
          speakerName = colonMatch[1].trim();
          dialogueText = colonMatch[2].trim();
        }

        // Match character in roster
        const matchedChar = roster.characters.find(c =>
          c.characterName.toLowerCase().includes(speakerName.toLowerCase()) ||
          speakerName.toLowerCase().includes(c.characterName.toLowerCase())
        );

        const personaId = matchedChar?.personaId || roster.narratorPersonaId || "nusrat_banking";
        const emotion = matchedChar?.defaultEmotion || "reassuring";

        const clipSynthesis = await synthesizeDialogueLine({
          text: dialogueText,
          personaId,
          emotion,
          pitchOffsetSemitones: matchedChar?.pitchOffsetSemitones || 0,
          speakingRate: matchedChar?.speakingRate || 1.0
        });

        renderedClips.push({
          lineIndex: i + 1,
          speaker: speakerName,
          personaId,
          text: dialogueText,
          startTimeSeconds: Number(totalDuration.toFixed(2)),
          durationSeconds: clipSynthesis.durationSeconds,
          audioBase64: clipSynthesis.audioBase64,
          sampleRate: clipSynthesis.sampleRate,
          source: clipSynthesis.source
        });

        totalDuration += clipSynthesis.durationSeconds + 0.35; // 350ms pause between lines
      }

      return res.json({
        success: true,
        data: {
          projectId,
          totalClips: renderedClips.length,
          totalDurationSeconds: Number(totalDuration.toFixed(2)),
          clips: renderedClips
        }
      });
    } catch (err: any) {
      logger.error({ err, projectId }, "[VoiceCasting] Render scene failed");
      return res.status(400).json({ success: false, error: err.message });
    }
  }
);
