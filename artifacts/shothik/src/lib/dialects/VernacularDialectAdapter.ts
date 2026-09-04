/**
 * Client-Side Vernacular Dialect Adapter
 * 
 * High-performance demographic language adaptation for Bangladesh regional dialects:
 * - Sylheti (syl): Remittances, land deeds, UK/US diaspora commerce
 * - Chatgaya (ctg): Maritime trade, port logistics, Agrabad commercial banking
 * - Noakhailla (nkh): Merchant networks, wholesale distribution
 * - Dhakaiya (dhk): Old Dhaka retail, F-Commerce, 1-Tap bKash street vernacular
 */

export type RegionalDialect = "sylheti" | "chatgaya" | "noakhailla" | "dhakaiya" | "standard_bangla";

export interface DialectDetectionResult {
  detectedDialect: RegionalDialect;
  confidence: number;
  matchedKeywords: string[];
  normalizedStandardBangla: string;
}

export interface DialectSynthesisResult {
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

export class VernacularDialectAdapter {
  private static instance: VernacularDialectAdapter;

  static getInstance(): VernacularDialectAdapter {
    if (!VernacularDialectAdapter.instance) {
      VernacularDialectAdapter.instance = new VernacularDialectAdapter();
    }
    return VernacularDialectAdapter.instance;
  }

  /**
   * Detects regional dialect keywords and normalizes to standard Bangla.
   */
  detectDialect(text: string): DialectDetectionResult {
    const input = text.trim();
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
      if (input.includes(rule.dialectWord)) {
        scores.sylheti += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    // Check Chatgaya
    for (const rule of CHATGAYA_LEXICON) {
      if (input.includes(rule.dialectWord)) {
        scores.chatgaya += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    // Check Noakhailla
    for (const rule of NOAKHAILLA_LEXICON) {
      if (input.includes(rule.dialectWord)) {
        scores.noakhailla += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    // Check Dhakaiya
    for (const rule of DHAKAIYA_LEXICON) {
      if (input.includes(rule.dialectWord)) {
        scores.dhakaiya += 2;
        matches.push(rule.dialectWord);
        normalized = normalized.replaceAll(rule.dialectWord, rule.standardBangla);
      }
    }

    let detectedDialect: RegionalDialect = "standard_bangla";
    let highestScore = 0;

    for (const [dialect, score] of Object.entries(scores)) {
      if (score > highestScore) {
        highestScore = score;
        detectedDialect = dialect as RegionalDialect;
      }
    }

    const confidence = highestScore > 0 ? Math.min(1.0, 0.5 + highestScore * 0.15) : 0.95;

    return {
      detectedDialect,
      confidence,
      matchedKeywords: matches,
      normalizedStandardBangla: normalized,
    };
  }

  /**
   * Synthesizes standard Bangla into target regional vernacular dialect.
   */
  synthesizeDialect(standardBanglaText: string, targetDialect: RegionalDialect): DialectSynthesisResult {
    if (targetDialect === "standard_bangla") {
      return {
        targetDialect,
        translatedText: standardBanglaText,
        dialectNotes: "Standard modern formal Bangla (Prashita)",
      };
    }

    let lexicon: DialectRule[] = [];
    let dialectNotes = "";

    switch (targetDialect) {
      case "sylheti":
        lexicon = SYLHETI_LEXICON;
        dialectNotes = "Adapted for Sylhet / London diaspora remittance context";
        break;
      case "chatgaya":
        lexicon = CHATGAYA_LEXICON;
        dialectNotes = "Adapted for Chittagong port logistics and maritime commerce";
        break;
      case "noakhailla":
        lexicon = NOAKHAILLA_LEXICON;
        dialectNotes = "Adapted for Noakhali merchant wholesale & distributor dialect";
        break;
      case "dhakaiya":
        lexicon = DHAKAIYA_LEXICON;
        dialectNotes = "Adapted for Old Dhaka F-Commerce street slang & 1-tap checkout";
        break;
    }

    let translated = standardBanglaText;
    for (const rule of lexicon) {
      translated = translated.replaceAll(rule.standardBangla, rule.dialectWord);
    }

    return {
      targetDialect,
      translatedText: translated,
      dialectNotes,
    };
  }
}
