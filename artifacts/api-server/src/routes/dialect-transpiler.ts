import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const dialectTranspilerRouter = Router();

export type RegisterId =
  | "cholit_standard"
  | "sadhu_bhasha"
  | "dhakaiya_kutti"
  | "sylheti_nagri"
  | "chittagonian_chatgaya"
  | "barisali"
  | "liberation_war_1971"
  | "cinematic_melodrama_1950s";

export interface RegisterMetadata {
  id: RegisterId;
  nameBangla: string;
  nameEnglish: string;
  historicalPeriod: string;
  geographicRegion: string;
  benchmarkAuthorOrWork: string;
  badgeColor: string;
  sampleInput: string;
  sampleTranspiled: string;
  culturalNote: string;
}

export interface DialectTransformationToken {
  original: string;
  transpiled: string;
  category: "verb_conjugation" | "pronominal_shift" | "regional_lexicon" | "phonetic_mutation" | "period_idiom";
  explanation: string;
}

export interface TranspilationResult {
  sourceText: string;
  transpiledText: string;
  sourceRegister: RegisterId;
  targetRegister: RegisterId;
  dialogueQuotesOnly: boolean;
  authenticityScore: number; // 0 - 100
  transformationsCount: number;
  transformationTokens: DialectTransformationToken[];
  linguisticNotes: string[];
}

export const REGISTER_CATALOG: Record<RegisterId, RegisterMetadata> = {
  cholit_standard: {
    id: "cholit_standard",
    nameBangla: "চলিত বাংলা (প্রমিত চলিত)",
    nameEnglish: "Standard Colloquial Bengali",
    historicalPeriod: "Modern Contemporary (20th–21st C.)",
    geographicRegion: "National Standard / West Bengal & Bangladesh",
    benchmarkAuthorOrWork: "Pramatha Chaudhuri, Humayun Ahmed",
    badgeColor: "emerald",
    sampleInput: "আমরা সেখানে গিয়েছিলাম এবং সবাইকে বলেছিলাম।",
    sampleTranspiled: "আমরা সেখানে গিয়েছিলাম এবং সবাইকে বলেছিলাম।",
    culturalNote: "The recognized linguistic benchmark for contemporary Bengali publishing, academic discourse, and general fiction.",
  },
  sadhu_bhasha: {
    id: "sadhu_bhasha",
    nameBangla: "সাধু ভাষা (ধ্রুপদী ঊনবিংশ শতাব্দী)",
    nameEnglish: "19th-Century Classical Sadhu Bhasha",
    historicalPeriod: "Colonial Era (1800–1920s)",
    geographicRegion: "Fort William / Kolkata Intellectual Renaissance",
    benchmarkAuthorOrWork: "Bankim Chandra Chattopadhyay, Ishwar Chandra Vidyasagar",
    badgeColor: "amber",
    sampleInput: "আমরা সেখানে গিয়েছিলাম এবং তাকে দেখেছিলাম।",
    sampleTranspiled: "আমরা তথায় গিয়াছিলাম এবং তাহাকে অবলোকন করিয়াছিলাম।",
    culturalNote: "Characterized by uncontracted Tatsama Sanskrit vocabulary, full verb inflections (গিয়াছিল, করিতেছিল), and formal pronominal honorifics (তাহাকে, উহাদিগের).",
  },
  dhakaiya_kutti: {
    id: "dhakaiya_kutti",
    nameBangla: "ঢাকাইয়া কুট্টি (পুরান ঢাকা)",
    nameEnglish: "Old Dhaka Kutti Colloquial",
    historicalPeriod: "Mughal Subah to Contemporary Puran Dhaka",
    geographicRegion: "Chawkbazar, Armanitola, Nazira Bazar",
    benchmarkAuthorOrWork: "Old Dhaka Oral Folklore & Street Comedy",
    badgeColor: "rose",
    sampleInput: "ভাই কেমন আছেন? আপনি কি খেয়েছেন?",
    sampleTranspiled: "মামা খবর কি? আপনি কি খাইসেন নি?",
    culturalNote: "Legendary for street wit, quick repartee, distinctive vocatives (মামা, মিয়া, আব্বা), past-tense shifts (-সেন, -সিলাম), and Persian-Urdu loan infusions.",
  },
  sylheti_nagri: {
    id: "sylheti_nagri",
    nameBangla: "ছিলটি নাগরী (সুরমা উপত্যকা)",
    nameEnglish: "Sylheti Regional Vernacular",
    historicalPeriod: "Medieval Shah Jalal Era to Global Diaspora",
    geographicRegion: "Sylhet Division, Surma-Kushiyara Basin, London Brick Lane",
    benchmarkAuthorOrWork: "Sylheti Nagri Manuscripts & Folk Baul Traditions",
    badgeColor: "teal",
    sampleInput: "কি খবর? ভালো আছেন তো? এখন আমি যাচ্ছি।",
    sampleTranspiled: "কিতা খবর? ভালা আছইন নি? অখন আমি যাইরাম।",
    culturalNote: "Distinguished by initial aspirate softening (p -> f), characteristic interrogatives (নি, কিতা), and distinct verbal suffixes (-রাম, -ছইন).",
  },
  chittagonian_chatgaya: {
    id: "chittagonian_chatgaya",
    nameBangla: "চাটগাঁইয়া (কর্ণফুলী ও উপকূলীয়)",
    nameEnglish: "Chatgaya Coastal Vernacular",
    historicalPeriod: "Ancient Maritime Port to Modern Agrabad",
    geographicRegion: "Chattogram, Sandwip, Karnafuli Estuary",
    benchmarkAuthorOrWork: "Shekhor Bandyopadhyay, Chittagong Coastal Ballads",
    badgeColor: "indigo",
    sampleInput: "আমি যাবো এবং টাকা পাঠিয়ে দেবো।",
    sampleTranspiled: "আঁই যাইয়্যুম আর টেঁয়া পাঠাই দিয়্যুম।",
    culturalNote: "High phonological divergence with nasal vowels, first-person pronoun 'আঁই', future tense markers (-য়্যুম), and specialized port-trade maritime terms.",
  },
  barisali: {
    id: "barisali",
    nameBangla: "বরিশাইল্যা (ভাটি অঞ্চল ও কীর্তনখোলা)",
    nameEnglish: "Barisali Southern Riverine Register",
    historicalPeriod: "Lower Meghna Delta & Riverine Bakerganj",
    geographicRegion: "Barishal, Bhola, Jhalokathi, Pirojpur",
    benchmarkAuthorOrWork: "Southern Delta Oral Narratives & River Epics",
    badgeColor: "cyan",
    sampleInput: "আমাদের সাথে চলো, কোথায় যাবে তুমি?",
    sampleTranspiled: "মোগো লগে চলো, কনে যাবা তুমি?",
    culturalNote: "Signature first-person plural 'মোগো' (our/us), 'মুই' (I), interrogative 'কনে' (where), and spirited southern riverine cadence.",
  },
  liberation_war_1971: {
    id: "liberation_war_1971",
    nameBangla: "১৯৭১ রণক্ষেত্র রেজিস্টার (গেরিলা ও মুক্তিসংগ্রাম)",
    nameEnglish: "1971 Liberation War Field Register",
    historicalPeriod: "Bangladesh Liberation War (March–December 1971)",
    geographicRegion: "Sector Headquarters, Guerrilla Hideouts, Crack Platoon Dhaka",
    benchmarkAuthorOrWork: "Jahanara Imam's Ekattorer Dinguli, Humayun Ahmed's Josna O Jononir Golpo",
    badgeColor: "red",
    sampleInput: "শত্রুরা আক্রমণ করছে, আমাদের ক্যাম্প খালি করতে হবে।",
    sampleTranspiled: "পাক হানাদার বাহিনী আক্রমণ করছে, আমাদের গেরিলা ক্যাম্প অ্যালার্টে খালি করতে হবে।",
    culturalNote: "Heavily inflected with Mukti Bahini combat jargon, radio frequencies, clandestine resistance codes, and passionate anti-fascist vernacular.",
  },
  cinematic_melodrama_1950s: {
    id: "cinematic_melodrama_1950s",
    nameBangla: "১৯৫০ ক্লাসিক্যাল মেলোড্রামা (রুপালি পর্দা)",
    nameEnglish: "1950s Golden Age Theatrical Register",
    historicalPeriod: "Post-War Theatrical Cinema (1940s–1960s)",
    geographicRegion: "BFDC Studios Dhaka, Tollygunge Studio Floor",
    benchmarkAuthorOrWork: "Suchitra-Uttam Golden Era Scripts, Zahir Raihan Early Theatrics",
    badgeColor: "purple",
    sampleInput: "তুমি এটা কি করলে? আমি চিরতরে চলে যাব।",
    sampleTranspiled: "এ তুমি কি করিলে? নিয়তির এই নির্মম পরিহাস! আমি চিরতরে বিদায় নেব।",
    culturalNote: "Elevated high-voltage theatrical emotionality, dramatic apostrophe, cosmic fatefulness, and heightened moral gravitas.",
  },
};

interface RuleDefinition {
  sourceWord: string;
  replacement: string;
  category: DialectTransformationToken["category"];
  explanation: string;
}

const SADHU_RULES: RuleDefinition[] = [
  // Pronouns
  { sourceWord: "তাকে", replacement: "তাহাকে", category: "pronominal_shift", explanation: "Colloquial 'তাকে' expanded to classical 'তাহাকে'" },
  { sourceWord: "তার", replacement: "তাহার", category: "pronominal_shift", explanation: "Colloquial genitive 'তার' to classical uncontracted 'তাহার'" },
  { sourceWord: "তাদের", replacement: "তাহাদিগের", category: "pronominal_shift", explanation: "Plural pronoun 'তাদের' to formal 'তাহাদিগের'" },
  { sourceWord: "এরা", replacement: "ইহারা", category: "pronominal_shift", explanation: "Demonstrative 'এরা' to sadhu 'ইহারা'" },
  { sourceWord: "এদের", replacement: "ইহাদিগের", category: "pronominal_shift", explanation: "Demonstrative genitive 'এদের' to 'ইহাদিগের'" },
  { sourceWord: "ওটা", replacement: "উহা", category: "pronominal_shift", explanation: "Colloquial pronoun 'ওটা' to Tatsama 'উহা'" },
  { sourceWord: "আমাদের", replacement: "আমাদিগের", category: "pronominal_shift", explanation: "First-person plural 'আমাদের' to classical 'আমাদিগের'" },
  { sourceWord: "তোমাদের", replacement: "তোমাদিগের", category: "pronominal_shift", explanation: "Second-person plural 'তোমাদের' to 'তোমাদিগের'" },
  { sourceWord: "সেখানে", replacement: "তথায়", category: "pronominal_shift", explanation: "Locative adverb 'সেখানে' to classical 'তথায়'" },
  { sourceWord: "এখানে", replacement: "এথায়", category: "pronominal_shift", explanation: "Locative adverb 'এখানে' to 'এথায়'" },

  // Verbs (Past tense uncontracted)
  { sourceWord: "হয়েছিল", replacement: "হইয়াছিল", category: "verb_conjugation", explanation: "Past auxiliary contraction reverted to uncontracted 'হইয়াছিল'" },
  { sourceWord: "হয়েছে", replacement: "হইয়াছে", category: "verb_conjugation", explanation: "Present perfect contraction reverted to uncontracted 'হইয়াছে'" },
  { sourceWord: "করেছিল", replacement: "করিয়াছিল", category: "verb_conjugation", explanation: "Past tense 'করেছিল' expanded to full 'করিয়াছিল'" },
  { sourceWord: "করছিল", replacement: "করিতেছিল", category: "verb_conjugation", explanation: "Past continuous 'করছিল' expanded to 'করিতেছিল'" },
  { sourceWord: "করেছেন", replacement: "করিয়াছেন", category: "verb_conjugation", explanation: "Honorific verb 'করেছেন' to 'করিয়াছেন'" },
  { sourceWord: "করছিলেন", replacement: "করিতেছিলেন", category: "verb_conjugation", explanation: "Honorific past continuous to 'করিতেছিলেন'" },
  { sourceWord: "গিয়েছিল", replacement: "গিয়াছিল", category: "verb_conjugation", explanation: "Past motion verb 'গিয়েছিল' to uncontracted 'গিয়াছিল'" },
  { sourceWord: "গিয়েছিলাম", replacement: "গিয়াছিলাম", category: "verb_conjugation", explanation: "First-person past motion verb 'গিয়েছিলাম' to 'গিয়াছিলাম'" },
  { sourceWord: "গিয়েছিলেন", replacement: "গিয়াছিলেন", category: "verb_conjugation", explanation: "Honorific motion verb to 'গিয়াছিলেন'" },
  { sourceWord: "গিয়ে", replacement: "গিয়া", category: "verb_conjugation", explanation: "Conjunctive participle 'গিয়ে' to 'গিয়া'" },
  { sourceWord: "খেয়ে", replacement: "খাইয়া", category: "verb_conjugation", explanation: "Conjunctive participle 'খেয়ে' to 'খাইয়া'" },
  { sourceWord: "দেখে", replacement: "দেখিয়া", category: "verb_conjugation", explanation: "Conjunctive participle 'দেখে' to 'দেখিয়া'" },
  { sourceWord: "দেখেছিল", replacement: "দেখিয়াছিল", category: "verb_conjugation", explanation: "Past perception verb to 'দেখিয়াছিল'" },
  { sourceWord: "দেখেছিলাম", replacement: "দেখিয়াছিলাম", category: "verb_conjugation", explanation: "First-person past perception verb 'দেখেছিলাম' to 'দেখিয়াছিলাম'" },
  { sourceWord: "বলেছিল", replacement: "বলিয়াছিল", category: "verb_conjugation", explanation: "Speech verb 'বলেছিল' to 'বলিয়াছিল'" },
  { sourceWord: "বললেন", replacement: "বলিলেন", category: "verb_conjugation", explanation: "Speech verb honorific 'বললেন' to 'বলিলেন'" },
  { sourceWord: "এসেছিল", replacement: "আসিয়াছিল", category: "verb_conjugation", explanation: "Arrival verb 'এসেছিল' to 'আসিয়াছিল'" },
  { sourceWord: "চলে", replacement: "চলিয়া", category: "verb_conjugation", explanation: "Motion participle 'চলে' to 'চলিয়া'" },
  { sourceWord: "দিয়েছিল", replacement: "দিয়াছিল", category: "verb_conjugation", explanation: "Dative verb 'দিয়েছিল' to 'দিয়াছিল'" },
  { sourceWord: "যাবেন", replacement: "যাইবেন", category: "verb_conjugation", explanation: "Future honorific 'যাবেন' to uncontracted 'যাইবেন'" },

  // Lexical & Time
  { sourceWord: "সকালে", replacement: "প্রাতঃকালে", category: "period_idiom", explanation: "Colloquial 'সকালে' to formal Sanskrit Tatsama 'প্রাতঃকালে'" },
  { sourceWord: "রাতে", replacement: "রাত্রিযোগে", category: "period_idiom", explanation: "Temporal noun to classical 'রাত্রিযোগে'" },
  { sourceWord: "দিনে", replacement: "দিবাভাগে", category: "period_idiom", explanation: "Colloquial 'দিনে' to classical 'দিবাভাগে'" },
  { sourceWord: "দেখা", replacement: "অবলোকন", category: "period_idiom", explanation: "Verb noun 'দেখা' elevated to Sanskrit 'অবলোকন'" },
];

const DHAKAIYA_RULES: RuleDefinition[] = [
  // Phrases first (multi-token)
  { sourceWord: "কেমন আছেন", replacement: "খবর কি", category: "period_idiom", explanation: "Old Dhaka conversational greeting 'খবর কি'" },
  { sourceWord: "খেয়েছেন কি", replacement: "খাইসেন নি", category: "verb_conjugation", explanation: "Interrogative perfect with suffix '-নি'" },
  { sourceWord: "চলে যাবেন", replacement: "যাইবেন গা", category: "verb_conjugation", explanation: "Departure compound verb with enclitic 'গা'" },
  { sourceWord: "বসে আছেন", replacement: "বইয়া রইসেন", category: "verb_conjugation", explanation: "Stative aspect to 'বইয়া রইসেন'" },
  { sourceWord: "ছেড়ে দিন", replacement: "ছাইড়া দেন", category: "verb_conjugation", explanation: "Imperative to 'ছাইড়া দেন'" },
  { sourceWord: "ফেলে দেব", replacement: "ফালায় দিমু", category: "verb_conjugation", explanation: "Future compound verb to 'ফালায় দিমু'" },
  { sourceWord: "খুব ভালো", replacement: "একদম খাসা", category: "regional_lexicon", explanation: "Enthusiastic superlative 'একদম খাসা'" },

  // Vocatives & Slang
  { sourceWord: "ভাই", replacement: "মামা", category: "regional_lexicon", explanation: "Ubiquitous Old Dhaka vocative 'মামা'" },
  { sourceWord: "বন্ধুরা", replacement: "আব্বারা", category: "regional_lexicon", explanation: "Affectionate street collective 'আব্বারা'" },
  { sourceWord: "টাকা", replacement: "টেকা", category: "phonetic_mutation", explanation: "Phonetic vowel narrowing to 'টেকা'" },

  // Pronouns
  { sourceWord: "আমাদের", replacement: "আমাগো", category: "pronominal_shift", explanation: "Genitive pronoun shift to 'আমাগো'" },
  { sourceWord: "তোমাদের", replacement: "তোমাগো", category: "pronominal_shift", explanation: "Genitive pronoun shift to 'তোমাগো'" },
  { sourceWord: "ঐটা", replacement: "হেইডা", category: "pronominal_shift", explanation: "Distal demonstrative to 'হেইডা'" },
  { sourceWord: "এটা", replacement: "এইডা", category: "pronominal_shift", explanation: "Proximal demonstrative to 'এইডা'" },

  // Single Verbs
  { sourceWord: "করছেন", replacement: "করতাসেন", category: "verb_conjugation", explanation: "Continuous aspect to Old Dhaka '-তাসেন'" },
  { sourceWord: "করছি", replacement: "করতাসি", category: "verb_conjugation", explanation: "First-person continuous to '-তাসি'" },
  { sourceWord: "খেয়েছেন", replacement: "খাইসেন", category: "verb_conjugation", explanation: "Past honorific to 'খাইসেন'" },
  { sourceWord: "চমৎকার", replacement: "জিন্দাবাদ", category: "regional_lexicon", explanation: "Loan approval adjective 'জিন্দাবাদ'" },
  { sourceWord: "তাড়াতাড়ি", replacement: "লগে লগে", category: "period_idiom", explanation: "Instant action idiom 'লগে লগে'" },
];

const SYLHETI_RULES: RuleDefinition[] = [
  // Phrases
  { sourceWord: "কি খবর", replacement: "কিতা খবর", category: "regional_lexicon", explanation: "Sylheti interrogative 'কিতা'" },
  { sourceWord: "ভালো আছেন কি", replacement: "ভালা আছইন নি", category: "regional_lexicon", explanation: "Standard polite greeting to 'ভালা আছইন নি'" },
  { sourceWord: "ভালো আছেন তো", replacement: "ভালা আছইন নি", category: "regional_lexicon", explanation: "Interrogative enclitic 'নি'" },
  { sourceWord: "টাকা এসেছে", replacement: "টেকা আইছে", category: "regional_lexicon", explanation: "Remittance lexicon 'টেকা আইছে'" },
  { sourceWord: "খেয়েছ কি", replacement: "খাইছতনি", category: "verb_conjugation", explanation: "Familiar interrogative '-তনি'" },

  // Lexical
  { sourceWord: "টাকা", replacement: "টেকা", category: "phonetic_mutation", explanation: "Sylheti monetary term 'টেকা'" },
  { sourceWord: "এখন", replacement: "অখন", category: "regional_lexicon", explanation: "Temporal adverb 'এখন' to 'অখন'" },
  { sourceWord: "যাচ্ছি", replacement: "যাইরাম", category: "verb_conjugation", explanation: "Present continuous inflection '-রাম'" },
  { sourceWord: "ছেলে", replacement: "ফুয়া", category: "regional_lexicon", explanation: "Kinship noun 'ফুয়া'" },
  { sourceWord: "মেয়ে", replacement: "পুরি", category: "regional_lexicon", explanation: "Kinship noun 'পুরি'" },
  { sourceWord: "শুনেছি", replacement: "হুনছি", category: "phonetic_mutation", explanation: "Sibilant s -> h shift to 'হুনছি'" },
  { sourceWord: "শুনে", replacement: "হুনিয়া", category: "phonetic_mutation", explanation: "Aspiration mutation to 'হুনিয়া'" },
  { sourceWord: "আমাদের", replacement: "আমারার", category: "pronominal_shift", explanation: "Plural genitive pronoun 'আমারার'" },
  { sourceWord: "তোমাদের", replacement: "তরার", category: "pronominal_shift", explanation: "Second-person genitive to 'তরার'" },
  { sourceWord: "তাদের", replacement: "তারার", category: "pronominal_shift", explanation: "Third-person genitive to 'তারার'" },
  { sourceWord: "কথা", replacement: "মাত", category: "regional_lexicon", explanation: "Speech noun to Sylheti 'মাত'" },
];

const CHATGAYA_RULES: RuleDefinition[] = [
  // Phrases
  { sourceWord: "ভালো আছেন কি", replacement: "গম আছেন নি", category: "regional_lexicon", explanation: "Chattogram greeting 'গম আছেন নি'" },
  { sourceWord: "কোথায় যাওয়া হবে", replacement: "হনা যাইব দে", category: "period_idiom", explanation: "Classic travel query 'হনা যাইব দে'" },
  { sourceWord: "ভালো জিনিস", replacement: "বালা চিজ", category: "regional_lexicon", explanation: "Mercantile appraisal 'বালা চিজ'" },

  // Pronouns & Nouns
  { sourceWord: "আমি", replacement: "আঁই", category: "pronominal_shift", explanation: "First-person singular pronoun to nasal 'আঁই'" },
  { sourceWord: "আমাদের", replacement: "আঁরার", category: "pronominal_shift", explanation: "First-person plural genitive to 'আঁরার'" },
  { sourceWord: "তুমি", replacement: "তুঁই", category: "pronominal_shift", explanation: "Second-person singular to nasal 'তুঁই'" },
  { sourceWord: "তোমাদের", replacement: "তোঁয়ারার", category: "pronominal_shift", explanation: "Second-person plural genitive to 'তোঁয়ারার'" },
  { sourceWord: "এটা", replacement: "ইবা", category: "pronominal_shift", explanation: "Demonstrative pronoun to 'ইবা'" },
  { sourceWord: "টাকা", replacement: "টেঁয়া", category: "phonetic_mutation", explanation: "Nasalized currency token 'টেঁয়া'" },
  { sourceWord: "কোথায়", replacement: "হনা", category: "regional_lexicon", explanation: "Locative interrogative 'হনা'" },

  // Verbs
  { sourceWord: "যাবো", replacement: "যাইয়্যুম", category: "verb_conjugation", explanation: "Future tense marker to '-ইয়্যুম'" },
  { sourceWord: "খাবো", replacement: "খাইয়্যুম", category: "verb_conjugation", explanation: "Future first-person to '-ইয়্যুম'" },
  { sourceWord: "গেছে", replacement: "গেইয়ে", category: "verb_conjugation", explanation: "Past third-person to 'গেইয়ে'" },
  { sourceWord: "এসেছে", replacement: "আইস্যে", category: "verb_conjugation", explanation: "Perfect aspect to 'আইস্যে'" },
  { sourceWord: "পেয়েছি", replacement: "হাইছি", category: "verb_conjugation", explanation: "Aspiration shift p -> h 'হাইছি'" },
];

const BARISALI_RULES: RuleDefinition[] = [
  // Phrases
  { sourceWord: "কোথায় যাবে", replacement: "কনে যাবা", category: "verb_conjugation", explanation: "Interrogative 'কনে' + second-person '-বা'" },
  { sourceWord: "সাথে চলো", replacement: "লগে চল", category: "period_idiom", explanation: "Imperative 'লগে চল'" },
  { sourceWord: "আজ রাতে", replacement: "আইজকা রাইতে", category: "period_idiom", explanation: "Temporal idiom 'আইজকা রাইতে'" },
  { sourceWord: "সত্যি কথা", replacement: "হাছা কতা", category: "phonetic_mutation", explanation: "Phonetic shift to 'হাছা কতা'" },
  { sourceWord: "খাব না", replacement: "খামু না", category: "verb_conjugation", explanation: "First-person future negative 'খামু না'" },

  // Pronouns
  { sourceWord: "আমাদের", replacement: "মোগো", category: "pronominal_shift", explanation: "Iconic Barisali plural genitive 'মোগো'" },
  { sourceWord: "আমরা", replacement: "মোগো", category: "pronominal_shift", explanation: "Collective first-person 'মোগো'" },
  { sourceWord: "আমি", replacement: "মুই", category: "pronominal_shift", explanation: "First-person singular to 'মুই'" },
  { sourceWord: "আমাকে", replacement: "মোরে", category: "pronominal_shift", explanation: "First-person objective to 'মোরে'" },
  { sourceWord: "তোমাদের", replacement: "তোমাগো", category: "pronominal_shift", explanation: "Second-person genitive to 'তোমাগো'" },
  { sourceWord: "ঐটা", replacement: "হেইডা", category: "pronominal_shift", explanation: "Demonstrative to 'হেইডা'" },
  { sourceWord: "সে", replacement: "হ্যায়", category: "pronominal_shift", explanation: "Third-person singular to 'হ্যায়'" },
  { sourceWord: "কোথায়", replacement: "কনে", category: "regional_lexicon", explanation: "Barisali locative 'কনে'" },

  // Verbs
  { sourceWord: "করব", replacement: "করমু", category: "verb_conjugation", explanation: "Future inflection '-মু'" },
  { sourceWord: "বলছি", replacement: "কইতাসি", category: "verb_conjugation", explanation: "Speech continuous 'কইতাসি'" },
];

const LIBERATION_WAR_RULES: RuleDefinition[] = [
  { sourceWord: "শত্রুরা", replacement: "পাক হানাদার বাহিনী", category: "period_idiom", explanation: "1971 wartime terminology for occupying army" },
  { sourceWord: "শত্রু সেনা", replacement: "খানসেনা", category: "period_idiom", explanation: "Historical Muktijuddho term 'খানসেনা'" },
  { sourceWord: "হামলা", replacement: "গেরিলা অপারেশন", category: "period_idiom", explanation: "Tactical guerrilla action descriptor" },
  { sourceWord: "দল", replacement: "ক্র্যাক প্লাটুন", category: "period_idiom", explanation: "Dhaka urban warfare commando platoon designation" },
  { sourceWord: "মুক্ত এলাকা", replacement: "মুক্তাঞ্চল", category: "period_idiom", explanation: "Liberated sovereign territory designation" },
  { sourceWord: "ক্যাম্প", replacement: "গেরিলা ক্যাম্প", category: "period_idiom", explanation: "Guerrilla encampment designation" },
  { sourceWord: "সতর্কতা", replacement: "ক্যাম্প অ্যালার্ট", category: "period_idiom", explanation: "Sector field radio alert term" },
  { sourceWord: "দালাল", replacement: "রাজাকার-আলবদর দোসর", category: "period_idiom", explanation: "1971 collaborationist paramilitary designation" },
  { sourceWord: "জয় হোক", replacement: "জয় বাংলা", category: "period_idiom", explanation: "Historic liberation war rallying clarion call" },
  { sourceWord: "গুলি চালানো", replacement: "স্টেনগান ব্রাশফায়ার", category: "period_idiom", explanation: "Automatic weapon fire terminology" },
];

const CINEMATIC_MELODRAMA_RULES: RuleDefinition[] = [
  { sourceWord: "ভগবানের কসম", replacement: "ঈশ্বর সাক্ষী", category: "period_idiom", explanation: "Theatrical invocation 'ঈশ্বর সাক্ষী'" },
  { sourceWord: "তুমি এটা কি করলে", replacement: "এ তুমি কি করিলে", category: "period_idiom", explanation: "Classic dramatic interrogation monologue" },
  { sourceWord: "আমায় ক্ষমা করো", replacement: "ক্ষমা করো হে ভগবান", category: "period_idiom", explanation: "Theatrical emotional supplication" },
  { sourceWord: "ভাগ্যের খেলা", replacement: "নিয়তির এই নির্মম পরিহাস", category: "period_idiom", explanation: "Tragic cosmic fatalism idiom" },
  { sourceWord: "চিরতরে চলে যাব", replacement: "চিরতরে বিদায় নেব", category: "period_idiom", explanation: "Melodramatic high-stakes parting" },
  { sourceWord: "প্রিয় সন্তান", replacement: "বুকের মানিক", category: "period_idiom", explanation: "High melodrama maternal trope" },
  { sourceWord: "শাস্তি", replacement: "পাপের নির্মম প্রায়শ্চিত্ত", category: "period_idiom", explanation: "Thematic cinematic moral reckoning" },
  { sourceWord: "করব না", replacement: "মার্জনা করিব না", category: "verb_conjugation", explanation: "Formal theatrical dramatic refusal" },
];

function makeUnicodeBoundaryRegex(word: string): RegExp {
  // Use Unicode letter and mark lookaround to ensure Bengali word boundary safety
  return new RegExp(`(?<![\\p{L}\\p{M}])${word}(?![\\p{L}\\p{M}])`, "gu");
}

/**
 * Transpiles text from standard Bengali or any source to a target register.
 */
export function transpileBengaliRegister(
  text: string,
  targetRegister: RegisterId,
  options?: {
    preserveDialogueQuotesOnly?: boolean;
    sourceRegister?: RegisterId;
  }
): TranspilationResult {
  const dialogueQuotesOnly = options?.preserveDialogueQuotesOnly ?? false;
  const sourceRegister = options?.sourceRegister ?? "cholit_standard";

  if (targetRegister === "cholit_standard" && sourceRegister === "cholit_standard") {
    return {
      sourceText: text,
      transpiledText: text,
      sourceRegister: "cholit_standard",
      targetRegister: "cholit_standard",
      dialogueQuotesOnly,
      authenticityScore: 98,
      transformationsCount: 0,
      transformationTokens: [],
      linguisticNotes: ["Text is already in standard colloquial Bengali."],
    };
  }

  let definitions: RuleDefinition[] = [];
  switch (targetRegister) {
    case "sadhu_bhasha":
      definitions = SADHU_RULES;
      break;
    case "dhakaiya_kutti":
      definitions = DHAKAIYA_RULES;
      break;
    case "sylheti_nagri":
      definitions = SYLHETI_RULES;
      break;
    case "chittagonian_chatgaya":
      definitions = CHATGAYA_RULES;
      break;
    case "barisali":
      definitions = BARISALI_RULES;
      break;
    case "liberation_war_1971":
      definitions = LIBERATION_WAR_RULES;
      break;
    case "cinematic_melodrama_1950s":
      definitions = CINEMATIC_MELODRAMA_RULES;
      break;
    default:
      definitions = [];
  }

  const transformationTokens: DialectTransformationToken[] = [];

  const transformChunk = (input: string): string => {
    let result = input;
    for (const rule of definitions) {
      const rx = makeUnicodeBoundaryRegex(rule.sourceWord);
      if (rx.test(result)) {
        transformationTokens.push({
          original: rule.sourceWord,
          transpiled: rule.replacement,
          category: rule.category,
          explanation: rule.explanation,
        });
        result = result.replace(rx, rule.replacement);
      }
    }
    return result;
  };

  let transpiledText = text;

  if (dialogueQuotesOnly) {
    // Regex matching "..." or “...” or '...'
    const quoteRegex = /([“"'])(.*?)([”"'])/gu;
    transpiledText = text.replace(quoteRegex, (_match, openQuote, dialogueContent, closeQuote) => {
      const converted = transformChunk(dialogueContent);
      return `${openQuote}${converted}${closeQuote}`;
    });
  } else {
    transpiledText = transformChunk(text);
  }

  // Calculate authenticity score based on transformations found
  const baseScore = 75;
  const scoreBoost = Math.min(23, transformationTokens.length * 6);
  const authenticityScore = transformationTokens.length > 0 ? baseScore + scoreBoost : 80;

  const metadata = REGISTER_CATALOG[targetRegister];
  const linguisticNotes = [
    metadata.culturalNote,
    `Target Register: ${metadata.nameBangla} (${metadata.historicalPeriod}).`,
    dialogueQuotesOnly
      ? "Preserved narrative prose; transformed character dialogue utterances inside quotation marks."
      : "Transpiled entire manuscript paragraph into target sociolect.",
  ];

  return {
    sourceText: text,
    transpiledText,
    sourceRegister,
    targetRegister,
    dialogueQuotesOnly,
    authenticityScore,
    transformationsCount: transformationTokens.length,
    transformationTokens,
    linguisticNotes,
  };
}

// -------------------------------------------------------------
// Route Endpoints
// -------------------------------------------------------------

/**
 * GET /api/v1/projects/:id/dialect-registers
 * Returns metadata catalog of all 8 supported dialect & historical registers
 */
dialectTranspilerRouter.get(
  ["/v1/projects/:id/dialect-registers", "/api/v1/projects/:id/dialect-registers"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";

    logger.info({ projectId }, "[DialectTranspiler] Catalog requested");
    res.status(200).json({
      projectId,
      totalRegisters: Object.keys(REGISTER_CATALOG).length,
      registers: Object.values(REGISTER_CATALOG),
    });
  }
);

const transpileBodySchema = z.object({
  text: z.string().min(1),
  targetRegister: z.enum([
    "cholit_standard",
    "sadhu_bhasha",
    "dhakaiya_kutti",
    "sylheti_nagri",
    "chittagonian_chatgaya",
    "barisali",
    "liberation_war_1971",
    "cinematic_melodrama_1950s",
  ]),
  sourceRegister: z
    .enum([
      "cholit_standard",
      "sadhu_bhasha",
      "dhakaiya_kutti",
      "sylheti_nagri",
      "chittagonian_chatgaya",
      "barisali",
      "liberation_war_1971",
      "cinematic_melodrama_1950s",
    ])
    .optional(),
  preserveDialogueQuotesOnly: z.boolean().optional(),
});

/**
 * POST /api/v1/projects/:id/dialect-transpile
 * Transpiles text or dialogue to a target register with token-level audit
 */
dialectTranspilerRouter.post(
  ["/v1/projects/:id/dialect-transpile", "/api/v1/projects/:id/dialect-transpile"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";

    const parsed = transpileBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const { text, targetRegister, sourceRegister, preserveDialogueQuotesOnly } = parsed.data;

    const result = transpileBengaliRegister(text, targetRegister, {
      sourceRegister,
      preserveDialogueQuotesOnly,
    });

    logger.info(
      { projectId, targetRegister, transformations: result.transformationsCount },
      "[DialectTranspiler] Transpilation executed"
    );

    res.status(200).json(result);
  }
);

const batchCompareSchema = z.object({
  text: z.string().min(1),
  preserveDialogueQuotesOnly: z.boolean().optional(),
});

/**
 * POST /api/v1/projects/:id/dialect-batch-compare
 * Generates side-by-side transpilation across ALL 8 registers simultaneously
 */
dialectTranspilerRouter.post(
  ["/v1/projects/:id/dialect-batch-compare", "/api/v1/projects/:id/dialect-batch-compare"],
  async (req: Request, res: Response) => {
    const paramId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const projectId = paramId || "default";

    const parsed = batchCompareSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
      return;
    }

    const { text, preserveDialogueQuotesOnly } = parsed.data;

    const registerKeys = Object.keys(REGISTER_CATALOG) as RegisterId[];
    const comparisons = registerKeys.map((regId) => {
      const transpiled = transpileBengaliRegister(text, regId, {
        preserveDialogueQuotesOnly,
      });
      return {
        registerId: regId,
        metadata: REGISTER_CATALOG[regId],
        transpiledText: transpiled.transpiledText,
        transformationsCount: transpiled.transformationsCount,
        authenticityScore: transpiled.authenticityScore,
        transformationTokens: transpiled.transformationTokens,
      };
    });

    logger.info({ projectId, totalComparisons: comparisons.length }, "[DialectTranspiler] Batch compare executed");

    res.status(200).json({
      projectId,
      sourceText: text,
      dialogueQuotesOnly: !!preserveDialogueQuotesOnly,
      comparisons,
    });
  }
);
