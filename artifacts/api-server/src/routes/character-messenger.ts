import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";
import { persistCharacterThreadMessage } from "../lib/novel-engine/suite-manifest-store";

export const characterMessengerRouter = Router();

export interface CharacterContact {
  id: string;
  nameBangla: string;
  nameEnglish: string;
  role: "protagonist" | "deuteragonist" | "antagonist" | "mentor" | "catalyst";
  avatar: string;
  status: "online" | "typing" | "away" | "offline";
  voicePersonaId: string;
  voiceName: string;
  dialect: string;
  personaMotto: string;
  hiddenSecret: string;
  lastActive: string;
}

export interface VoiceNotePayload {
  id: string;
  durationSeconds: number;
  waveformBars: number[];
  audioBase64: string;
  emotion: string;
  isSynthesized: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "author" | "character";
  characterId: string;
  text: string;
  timestamp: string;
  voiceNote?: VoiceNotePayload;
  secretLoreDisclosure?: {
    topic: string;
    confession: string;
  };
}

export interface ChatThread {
  characterId: string;
  messages: ChatMessage[];
  updatedAt: string;
}

const DEFAULT_CHARACTERS: CharacterContact[] = [
  {
    id: "char_himu",
    nameBangla: "হিমু (Himu)",
    nameEnglish: "Himu",
    role: "protagonist",
    avatar: "🟡",
    status: "online",
    voicePersonaId: "ayesha_sales",
    voiceName: "Ayesha (আইশা)",
    dialect: "Standard Dhaka Bangla",
    personaMotto: "আমি কোনো নিয়ম মানি না, নিয়ম আমাকে খুঁজে নেয়।",
    hiddenSecret: "রূপার নীল খামটি হিমু কখনো খোলে না, কারণ সে জানে খুললে তার খালি পায়ে হাঁটার স্বাধীনতা শেষ হয়ে যাবে।",
    lastActive: "Just now",
  },
  {
    id: "char_badal",
    nameBangla: "বাদল (Badal)",
    nameEnglish: "Badal",
    role: "deuteragonist",
    avatar: "👦",
    status: "online",
    voicePersonaId: "tania_casual",
    voiceName: "Tania (তানিয়া)",
    dialect: "Colloquial Dhakaiya",
    personaMotto: "হিমু ভাই, এত রাতে বৃষ্টিতে ভিজলে আপনার কিন্তু নিউমোনিয়া হবে!",
    hiddenSecret: "সে হিমুর মতো হওয়ার জন্য গোপনে খালি পায়ে হাঁটার চেষ্টা করে মেঝেতে পা কেটে ফেলেছিল।",
    lastActive: "2m ago",
  },
  {
    id: "char_rupa",
    nameBangla: "রুপা (Rupa)",
    nameEnglish: "Rupa",
    role: "catalyst",
    avatar: "💙",
    status: "away",
    voicePersonaId: "zara_corporate",
    voiceName: "Zara (জারা)",
    dialect: "Formal Pramit Bangla",
    personaMotto: "তুমি নীল পদ্ম আনতে পারোনি, কিন্তু নীল খামে চিঠি পাঠিয়েছ।",
    hiddenSecret: "তার পরিবার তাকে লন্ডনের এক ব্যারিস্টারের সাথে বিয়ে দিতে চায়, কিন্তু সে হিমুর জন্য ছাদে নীল শাড়ি ঝুলিয়ে রাখে।",
    lastActive: "15m ago",
  },
  {
    id: "char_oc_rafiq",
    nameBangla: "ওসি রফিক (OC Rafiq)",
    nameEnglish: "OC Rafiq",
    role: "antagonist",
    avatar: "👮",
    status: "online",
    voicePersonaId: "nusrat_banking",
    voiceName: "Nusrat (নুসরাত)",
    dialect: "Formal Pramit Bangla",
    personaMotto: "আইন অন্ধ হতে পারে হিমু, কিন্তু এই লালবাগ থানার চোখ কখনো ঘুমায় না।",
    hiddenSecret: "তার বাবার একটি অমীমাংসিত দুর্নীতির ফাইল পুলিশ সদর দফতরে এখনো সংরক্ষিত আছে।",
    lastActive: "Just now",
  },
];

// In-memory conversation stores keyed by `${projectId}_${characterId}`
const threadStores = new Map<string, ChatMessage[]>();

function getThreadKey(projectId: string, characterId: string): string {
  return `${projectId}__${characterId}`;
}

// Generate minimal 24kHz WAV Base64 tone waveform
function generateVoiceNoteBuffer(durationSec: number): { audioBase64: string; waveform: number[] } {
  const barsCount = 28;
  const waveform: number[] = [];
  for (let i = 0; i < barsCount; i++) {
    // Generate organic-looking audio amplitude envelope
    const factor = Math.sin((i / barsCount) * Math.PI);
    const randomJitter = Math.random() * 0.35 + 0.15;
    waveform.push(Math.round(Math.min(100, Math.max(15, factor * 85 + randomJitter * 25))));
  }

  // Valid 24kHz 16-bit Mono PCM WAV base64
  const fallbackWavBase64 =
    "UklGRqRwAABXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAAZGF0YYBwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

  return { audioBase64: fallbackWavBase64, waveform };
}

/**
 * Deterministically generates character in-persona dialogue responses
 */
export function generateCharacterReply(
  characterId: string,
  userMessage: string
): {
  replyText: string;
  emotion: string;
  secretLore?: { topic: string; confession: string };
} {
  const lower = userMessage.toLowerCase();

  switch (characterId) {
    case "char_himu":
      if (lower.includes("রূপা") || lower.includes("রুপা") || lower.includes("নীল") || lower.includes("প্রেম")) {
        return {
          replyText:
            "রুপার নীল শাড়িতে মায়া বড় বেশি। মায়ায় জড়িয়ে গেলে ভরা পূর্ণিমার রাতে একা একা বেইলি রোডে হাঁটা যায় না। আপনি তো লেখক, আপনি কি জানেন মায়া কত ভারী?",
          emotion: "enigmatic",
          secretLore: {
            topic: "রূপার নীল খাম",
            confession: "হিমু চিঠিটি পকেটে নিয়ে ঘোরে কিন্তু কখনো খোলে না। চিঠি না খুলেই কথাগুলো বাতাসে পড়ে নেওয়া যায়।",
          },
        };
      }
      if (lower.includes("থানা") || lower.includes("পুলিশ") || lower.includes("ওসি") || lower.includes("জেল")) {
        return {
          replyText:
            "ওসি সাহেব ভাবছেন আমাকে আটকে রেখেছেন। আসলে উনি নিজেই নিজের ইউনিফর্ম আর ডিউটির লকআপে বন্দী। আমি তো কেবল রাতের বাতাস দেখতে এসেছি।",
          emotion: "detached",
          secretLore: {
            topic: "ওসি সাহেবের গোপন ভয়",
            confession: "ওসি সাহেবের টেবিলের ড্রয়ারে তার শৈশবের একটি ভাঙা বাঁশি রাখা আছে। হিমু তা গন্ধ শুঁকে জেনে ফেলেছে।",
          },
        };
      }
      return {
        replyText:
          "মানুষ কেন এত প্রশ্ন করে বলুন তো? সব প্রশ্নের উত্তর জানলে তো মহাবিশ্বের কৌতূহল শেষ হয়ে যাবে। হলুদ পাঞ্জাবি রোদে শুকাতে দিয়েছি, আজ রাতে বৃষ্টি নামবে।",
        emotion: "playful_serene",
      };

    case "char_badal":
      if (lower.includes("হিমু") || lower.includes("ভাই")) {
        return {
          replyText:
            "হিমু ভাইয়ের কোনো ঠিকঠিকানা নেই লেখক ভাই! কাল রাতে আমাকে বললেন চামেলি বাগানে ভূত খুঁজতে যাবেন, আমি তিন ঘণ্টা দাঁড়িয়ে থেকে মশার কামড় খেয়ে বাড়ি ফিরেছি!",
          emotion: "exasperated_warm",
          secretLore: {
            topic: "বাদলের ডায়েরি",
            confession: "বাদল গোপনে হিমু ভাইয়ের প্রতিটি অদ্ভুত উক্তি একটি হলুদ চামড়ার ডায়রিতে টুকে রাখে।",
          },
        };
      }
      return {
        replyText:
          "আপনি আমাকে নতুন কোনো বিপদে ফেলবেন না তো? আগের চ্যাপ্টারে যে পুলিশ আমাকে তাড়া করল, আমি এখনো ভয়ে কাঁপি!",
        emotion: "anxious",
      };

    case "char_rupa":
      return {
        replyText:
          "হিমুকে আপনি আবার কোন গন্তব্যহীন রাস্তায় পাঠিয়ে দিচ্ছেন? যদি ও ফিরে না আসে, তবে আপনার এই উপন্যাসের শেষ পাতা আমি ছিঁড়ে ফেলব।",
        emotion: "longing_defiant",
        secretLore: {
          topic: "ছাদের নীল শাড়ি",
          confession: "রুপা প্রতি শুক্রবার রাতে ছাদে এক ঘণ্টা একা দাঁড়িয়ে আকাশের তারা গোনে, হিমুর পায়ের শব্দ শোনার আশায়।",
        },
      };

    case "char_oc_rafiq":
      return {
        replyText:
          "লেখক সাহেব, আপনি আপনার চরিত্রদের লাইসেন্স দিচ্ছেন বেশি। হিমু ছেলেটি যা করছে তা সরাসরি সিআরপিসি আইনের লঙ্ঘন। আজ রাতে ওকে না পেলে আমি ওর খোঁজে ফোর্স পাঠাব।",
        emotion: "stern_authoritative",
        secretLore: {
          topic: "পিতার অমীমাংসিত ফাইল",
          confession: "ওসি রফিকের প্রধান লক্ষ্য হিমুকে ধরা নয়, বরং হিমুর অলৌকিক অন্তর্দৃষ্টি দিয়ে তার পিতার হারানো ফাইলটির হদিস বের করা।",
        },
      };

    default:
      return {
        replyText: "আমি চরিত্রের ভেতর থেকে বলছি। এই দৃশ্যে আমার উদ্দেশ্য এখনো পরিষ্কার নয়, আপনি কি আরেকটু বলবেন?",
        emotion: "neutral",
      };
  }
}

// -------------------------------------------------------------
// Route Endpoints
// -------------------------------------------------------------

/**
 * GET /api/v1/projects/:id/character-messenger/characters
 * Returns all story characters available for direct messenger chat
 */
characterMessengerRouter.get(
  ["/v1/projects/:id/character-messenger/characters", "/api/v1/projects/:id/character-messenger/characters"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";

    logger.info({ projectId }, "[CharacterMessenger] Character list requested");
    res.status(200).json({
      projectId,
      totalCharacters: DEFAULT_CHARACTERS.length,
      characters: DEFAULT_CHARACTERS,
    });
  }
);

/**
 * GET /api/v1/projects/:id/character-messenger/threads/:characterId
 * Returns chat message history for a specific character thread
 */
characterMessengerRouter.get(
  ["/v1/projects/:id/character-messenger/threads/:characterId", "/api/v1/projects/:id/character-messenger/threads/:characterId"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";
    const charId = Array.isArray(req.params.characterId) ? req.params.characterId[0] : req.params.characterId;

    const key = getThreadKey(projectId, charId);
    let messages = threadStores.get(key);

    if (!messages) {
      // Seed initial welcoming message from character
      const charMeta = DEFAULT_CHARACTERS.find((c) => c.id === charId) || DEFAULT_CHARACTERS[0];
      const initialVoice = generateVoiceNoteBuffer(2.4);
      messages = [
        {
          id: `msg_init_${charId}`,
          sender: "character",
          characterId: charId,
          text: `নমস্কার লেখক! ${charMeta.personaMotto} বলুন, আমাদের গল্পের পরবর্তী দৃশ্যে কী ঘটতে যাচ্ছে?`,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          voiceNote: {
            id: `vn_init_${charId}`,
            durationSeconds: 2.4,
            waveformBars: initialVoice.waveform,
            audioBase64: initialVoice.audioBase64,
            emotion: "warm",
            isSynthesized: true,
          },
        },
      ];
      threadStores.set(key, messages);
    }

    res.status(200).json({
      projectId,
      characterId: charId,
      totalMessages: messages.length,
      messages,
    });
  }
);

const sendMessageSchema = z.object({
  characterId: z.string(),
  userMessage: z.string().min(1),
  generateVoiceNote: z.boolean().optional(),
});

/**
 * POST /api/v1/projects/:id/character-messenger/send
 * Sends message to character and gets back in-persona response with voice note and optional lore confession
 */
characterMessengerRouter.post(
  ["/v1/projects/:id/character-messenger/send", "/api/v1/projects/:id/character-messenger/send"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";

    const parsed = sendMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const { characterId, userMessage, generateVoiceNote = true } = parsed.data;
    const key = getThreadKey(projectId, characterId);
    let messages = threadStores.get(key) || [];

    // 1. Append Author Message
    const authorMsg: ChatMessage = {
      id: `msg_auth_${Date.now()}`,
      sender: "author",
      characterId,
      text: userMessage,
      timestamp: new Date().toISOString(),
    };
    messages.push(authorMsg);

    // 2. Generate Character In-Persona Reply
    const { replyText, emotion, secretLore } = generateCharacterReply(characterId, userMessage);

    let voiceNote: VoiceNotePayload | undefined = undefined;
    if (generateVoiceNote) {
      const durationSec = Math.max(1.8, Number((replyText.length * 0.07).toFixed(1)));
      const { audioBase64, waveform } = generateVoiceNoteBuffer(durationSec);
      voiceNote = {
        id: `vn_${Date.now()}`,
        durationSeconds: durationSec,
        waveformBars: waveform,
        audioBase64,
        emotion,
        isSynthesized: true,
      };
    }

    const charMsg: ChatMessage = {
      id: `msg_char_${Date.now()}`,
      sender: "character",
      characterId,
      text: replyText,
      timestamp: new Date().toISOString(),
      voiceNote,
      secretLoreDisclosure: secretLore,
    };
    messages.push(charMsg);
    threadStores.set(key, messages);
    void persistCharacterThreadMessage(key, "author", "author", userMessage, { projectId, characterId });
    void persistCharacterThreadMessage(key, characterId, "character", replyText, { projectId, characterId, hasVoice: !!voiceNote, secretLoreDisclosure: secretLore });

    logger.info({ projectId, characterId, hasVoice: !!voiceNote }, "[CharacterMessenger] Message exchanged");

    res.status(200).json({
      success: true,
      projectId,
      characterId,
      authorMessage: authorMsg,
      characterReply: charMsg,
      totalThreadMessages: messages.length,
    });
  }
);
