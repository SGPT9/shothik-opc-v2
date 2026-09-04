/**
 * Vernacular Regional Dialect Normalization & Synthesis Engine
 * Provides demographic dialect adaptation for South Asian regional varieties:
 * - Sylheti (syl): Remittances, land deeds, UK/US diaspora commerce
 * - Chatgaya (ctg): Port logistics, maritime trade, Agrabad banking
 * - Noakhailla (nkh): Merchant networks, wholesale distribution
 * - Dhakaiya (dhk): Old Dhaka retail, F-Commerce, bKash 1-tap street vernacular
 */

export type RegionalDialect = "sylheti" | "chatgaya" | "noakhailla" | "dhakaiya" | "standard_bangla";

export interface DialectDetectionResult {
  detectedDialect: RegionalDialect;
  confidence: number;
  matchedKeywords: string[];
  normalizedStandardBangla: string;
}

export interface DialectTranslationResult {
  targetDialect: RegionalDialect;
  translatedText: string;
  dialectNotes: string;
}

interface DialectRule {
  dialectWord: string;
  standardBangla: string;
  englishGloss: string;
}

const SYLHETI_LEXICON: DialectRule[] = [
  { dialectWord: "খাইছতনি", standardBangla: "খেয়েছো কি", englishGloss: "have you eaten" },
  { dialectWord: "কিতা খবর", standardBangla: "কি খবর", englishGloss: "what's up" },
  { dialectWord: "লন্ডন থাকি টেকা আইছে", standardBangla: "লন্ডন থেকে টাকা এসেছে", englishGloss: "remittance received from London" },
  { dialectWord: "টেকা পাঠাইছি", standardBangla: "টাকা পাঠিয়েছি", englishGloss: "I sent money" },
  { dialectWord: "জমিনের দলিল", standardBangla: "জমির দলিল", englishGloss: "land deed" },
  { dialectWord: "ভালা আছেন নি", standardBangla: "ভালো আছেন কি", englishGloss: "are you well" },
  { dialectWord: "অখন যাইরাম", standardBangla: "এখন যাচ্ছি", englishGloss: "leaving now" },
];

const CHATGAYA_LEXICON: DialectRule[] = [
  { dialectWord: "হনা যাইব দে", standardBangla: "কোথায় যাওয়া হবে", englishGloss: "where to go" },
  { dialectWord: "গম আছেন নি", standardBangla: "ভালো আছেন কি", englishGloss: "are you well" },
  { dialectWord: "আঁই যাইয়্যুম", standardBangla: "আমি যাবো", englishGloss: "I will go" },
  { dialectWord: "জাহাজের মাল খালাস", standardBangla: "জাহাজের পণ্য খালাস", englishGloss: "shipment customs clearance" },
  { dialectWord: "টেঁয়া কত", standardBangla: "টাকা কত", englishGloss: "how much money" },
  { dialectWord: "কুরিয়ার পোঁছাই গেইয়ে", standardBangla: "কুরিয়ার পৌঁছে গেছে", englishGloss: "courier parcel delivered" },
  { dialectWord: "ইবা বালা চিজ", standardBangla: "এটা ভালো জিনিস", englishGloss: "this is good quality" },
];

const NOAKHAILLA_LEXICON: DialectRule[] = [
  { dialectWord: "হাছাই নি", standardBangla: "সত্যি কি", englishGloss: "is it true" },
  { dialectWord: "আন্নে কেন আছেন", standardBangla: "আপনি কেমন আছেন", englishGloss: "how are you" },
  { dialectWord: "কুরিয়ারের ফেটানি আইছে", standardBangla: "কুরিয়ারের পার্সেল এসেছে", englishGloss: "courier package arrived" },
  { dialectWord: "বিকাশে টেয়া মারি দেন", standardBangla: "বিকাশে টাকা পাঠিয়ে দিন", englishGloss: "send money via bKash" },
  { dialectWord: "হাইছি", standardBangla: "পেয়েছি", englishGloss: "received" },
  { dialectWord: "হাইলকা আসিয়েন", standardBangla: "কালকে আসবেন", englishGloss: "come tomorrow" },
];

const DHAKAIYA_LEXICON: DialectRule[] = [
  { dialectWord: "মামা খবর কি", standardBangla: "ভাই কেমন আছেন", englishGloss: "brother what's the news" },
  { dialectWord: "১-ট্যাপে বিকাশ মারেন", standardBangla: "এক ট্যাপে বিকাশ পেমেন্ট করুন", englishGloss: "1-Tap bKash payment" },
  { dialectWord: "ক্যাশ অন ডেলিভারি একদম খাসা", standardBangla: "ক্যাশ অন ডেলিভারি খুব ভালো", englishGloss: "cash on delivery is great" },
  { dialectWord: "মাল ছাইড়া দেন", standardBangla: "পণ্য পাঠিয়ে দিন", englishGloss: "dispatch goods" },
  { dialectWord: "একদম জিন্দাবাদ মাল", standardBangla: "খুব চমৎকার পণ্য", englishGloss: "top notch merchandise" },
  { dialectWord: "লগে লগে পার্সেল বুকিং", standardBangla: "তৎক্ষণাৎ পার্সেল বুকিং", englishGloss: "instant parcel booking" },
];

export class VernacularDialectEngine {
  private static instance: VernacularDialectEngine;

  static getInstance(): VernacularDialectEngine {
    if (!VernacularDialectEngine.instance) {
      VernacularDialectEngine.instance = new VernacularDialectEngine();
    }
    return VernacularDialectEngine.instance;
  }

  /**
   * Detects regional dialect features and maps to standard Bengali.
   */
  detectDialect(text: string): DialectDetectionResult {
    const lower = text.trim();
    let normalized = text;
    const matches: string[] = [];

    const scores = {
      sylheti: 0,
      chatgaya: 0,
      noakhailla: 0,
      dhakaiya: 0,
    };

    // Check Sylheti
    for (const rule of SYLHETI_LEXICON) {
      if (lower.includes(rule.dialectWord)) {
        scores.sylheti += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    // Check Chatgaya
    for (const rule of CHATGAYA_LEXICON) {
      if (lower.includes(rule.dialectWord)) {
        scores.chatgaya += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    // Check Noakhailla
    for (const rule of NOAKHAILLA_LEXICON) {
      if (lower.includes(rule.dialectWord)) {
        scores.noakhailla += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    // Check Dhakaiya
    for (const rule of DHAKAIYA_LEXICON) {
      if (lower.includes(rule.dialectWord)) {
        scores.dhakaiya += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    let detected: RegionalDialect = "standard_bangla";
    let maxScore = 0;

    for (const [d, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detected = d as RegionalDialect;
      }
    }

    const confidence = maxScore > 0 ? Math.min(0.99, Number((0.5 + maxScore * 0.15).toFixed(2))) : 0.95;

    return {
      detectedDialect: detected,
      confidence,
      matchedKeywords: matches,
      normalizedStandardBangla: normalized,
    };
  }

  /**
   * Translates standard Bengali text into a target regional dialect for personalized customer experience.
   */
  synthesizeDialect(standardText: string, targetDialect: RegionalDialect): DialectTranslationResult {
    let result = standardText;
    let lexicon: DialectRule[] = [];

    switch (targetDialect) {
      case "sylheti":
        lexicon = SYLHETI_LEXICON;
        break;
      case "chatgaya":
        lexicon = CHATGAYA_LEXICON;
        break;
      case "noakhailla":
        lexicon = NOAKHAILLA_LEXICON;
        break;
      case "dhakaiya":
        lexicon = DHAKAIYA_LEXICON;
        break;
      case "standard_bangla":
      default:
        return {
          targetDialect: "standard_bangla",
          translatedText: standardText,
          dialectNotes: "Standard modern Bengali grammar and lexicon.",
        };
    }

    for (const rule of lexicon) {
      result = result.replaceAll(rule.standardBangla, rule.dialectWord);
    }

    return {
      targetDialect,
      translatedText: result,
      dialectNotes: `Localized with ${targetDialect.toUpperCase()} commercial vernacular patterns.`,
    };
  }
}
