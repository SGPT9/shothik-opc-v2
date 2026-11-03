import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { logger } from "../lib/logger";

export const betaReadersRouter = Router();

export type BetaReaderRole =
  | "farhan_logic"
  | "nabila_thriller"
  | "tahsin_stylist"
  | "samira_romance"
  | "kabir_commuter";

export interface BetaReaderPersona {
  id: BetaReaderRole;
  nameBangla: string;
  nameEnglish: string;
  avatarIcon: string;
  badgeColor: string;
  demographics: string;
  focusArea: string;
  readingSpeed: string;
  dnfTolerance: string;
  critiqueStyle: string;
}

export type MarginNoteType =
  | "plot_hole"
  | "pacing_drag"
  | "dialogue_stiff"
  | "confusing"
  | "gem_moment"
  | "emotional_peak";

export interface AnnotatedMarginNote {
  id: string;
  type: MarginNoteType;
  typeLabelBangla: string;
  highlightedExcerpt: string;
  commentBangla: string;
  commentEnglish: string;
  suggestedRevisionBangla: string;
  severity: "critical" | "medium" | "praise";
}

export interface PersonaReview {
  personaId: BetaReaderRole;
  personaName: string;
  nameBangla: string;
  avatarIcon: string;
  badgeColor: string;
  score: number; // 1.0 to 5.0
  dnfRiskPercent: number; // 0 to 100
  dnfTriggerPoint: string | null;
  firstImpressionBangla: string;
  inDepthCritiqueBangla: string;
  favoriteQuoteBangla: string;
  annotatedMarginNotes: AnnotatedMarginNote[];
  wouldRecommendToFriend: boolean;
}

export interface BetaReaderAuditReport {
  auditId: string;
  projectId: string;
  chapterTitle: string;
  wordCount: number;
  readingTimeMinutes: number;
  consensusSummary: {
    overallScore: number; // 1.0 - 5.0
    averageDnfRiskPercent: number; // 0 - 100
    groupVerdictBangla: string;
    topStrengthsBangla: string[];
    urgentFixesBangla: string[];
    retentionAdviceBangla: string;
  };
  personaReviews: PersonaReview[];
  timestamp: string;
}

export const BETA_READER_PERSONAS: Record<BetaReaderRole, BetaReaderPersona> = {
  farhan_logic: {
    id: "farhan_logic",
    nameBangla: "ফারহান (লজিক ও প্লট-হোল অডিটর)",
    nameEnglish: "Farhan (Logic & Continuity Auditor)",
    avatarIcon: "🔍",
    badgeColor: "rose",
    demographics: "সফটওয়্যার আর্কিটেক্ট ও সাই-ফাই/মিস্ট্রি ফ্যানাটিক, ৩২",
    focusArea: "টাইমলাইন সঙ্গতি, কারণ ও ফলাফল, চরিত্রের তথ্য-জ্ঞান এবং লজিস্টিকাল নির্ভুলতা",
    readingSpeed: "বিশ্লেষণধর্মী ধীরগতি (২২০ WPM)",
    dnfTolerance: "লজিক ব্রেক করলে দ্বিতীয় সুযোগ দেন না",
    critiqueStyle: "কঠোর, যৌক্তিক এবং তথ্য-প্রমাণ ভিত্তিক"
  },
  nabila_thriller: {
    id: "nabila_thriller",
    nameBangla: "নাবিলা (থ্রিলার ও পেসিং ফ্যানাটিক)",
    nameEnglish: "Nabila (Thriller & High-Stakes Binge Reader)",
    avatarIcon: "⚡",
    badgeColor: "amber",
    demographics: "ডিজিটাল মার্কেটার ও বিঞ্জ-রিডার, ২৬",
    focusArea: "হুক স্ট্রেন্থ, সিন ভেলোসিটি, ক্লিফহ্যাংগার এবং দৃশ্যপট ত্বরণ",
    readingSpeed: "বিদ্যুৎগতি সম্পন্ন বিঞ্জ (৩৮০ WPM)",
    dnfTolerance: "একটানা ২ পৃষ্ঠা মন্থর বা নিষ্ক্রিয় হলে ডিএনএফ (DNF)",
    critiqueStyle: "অধৈর্য, এনার্জেটিক এবং সাসপেন্স-কেন্দ্রিক"
  },
  tahsin_stylist: {
    id: "tahsin_stylist",
    nameBangla: "তাহসিন (সাহিত্য ও শৈলী রসগ্রাহী)",
    nameEnglish: "Tahsin (Literary Stylist & Aesthetic Critic)",
    avatarIcon: "🖋️",
    badgeColor: "emerald",
    demographics: "তুলনামূলক সাহিত্য গবেষক ও প্রাবন্ধিক, ২৯",
    focusArea: "বাক্য-ছন্দ, অনন্য রূপক, চরিত্র-মনস্তত্ত্ব ও গভীর ইন্দ্রিয়গ্রাহ্য বিবরণ",
    readingSpeed: "মননশীল ও ভাবুক (২০০ WPM)",
    dnfTolerance: "ক্লিপড ক্লিমেক্স বা মেলোড্রামায় বিরক্ত",
    critiqueStyle: "নান্দনিক, পরিশীলিত এবং উপমা-সচেতন"
  },
  samira_romance: {
    id: "samira_romance",
    nameBangla: "সামিরা (চরিত্র রসায়ন ও ইমোশন স্পেশালিস্ট)",
    nameEnglish: "Samira (Emotional Resonance & Chemistry Specialist)",
    avatarIcon: "💖",
    badgeColor: "purple",
    demographics: "কাউন্সেলিং সাইকোলজিস্ট ও ড্রামা অনুরাগী, ৩৪",
    focusArea: "দৃষ্টিবিনিময়, অব্যক্ত মনস্তাপ, সম্পর্কের গভীর রসায়ন ও সমবেদনা",
    readingSpeed: "নিবিষ্ট অনুভূতিশীল (২৮০ WPM)",
    dnfTolerance: "চরিত্রের আচরণে শূন্য অনুভূতি থাকলে ড্রপ করেন",
    critiqueStyle: "সহমর্মী, অন্তর্দৃষ্টিসম্পন্ন ও চরিত্র-বান্ধব"
  },
  kabir_commuter: {
    id: "kabir_commuter",
    nameBangla: "কবির (দৈনন্দিন কমিউটার ও সাধারণ পাঠক)",
    nameEnglish: "Kabir (The Commuter / Mass Audience Reader)",
    avatarIcon: "🚆",
    badgeColor: "sky",
    demographics: "ব্যাংক কর্মকর্তা ও নিয়মিত মেট্রোরেল/বাস পাঠক, ৪১",
    focusArea: "সহজ পাঠযোগ্যতা, চরিত্রের নাম চটজলদি মনে রাখা ও বিনোদন মূল্য",
    readingSpeed: "স্বচ্ছন্দ দ্রুত (৩১০ WPM)",
    dnfTolerance: "পড়ার মাঝখানে বিভ্রান্ত হলে বই রেখে দেন",
    critiqueStyle: "বাস্তববাদী, স্পষ্টভাষী ও আমজনতার দৃষ্টিভঙ্গি"
  }
};

export function performBetaReaderAudit(
  projectId: string,
  manuscriptText: string,
  chapterTitle = "অধ্যায় ১: সূচনা",
  selectedPersonas?: BetaReaderRole[]
): BetaReaderAuditReport {
  const words = manuscriptText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 240));

  const personasToRun: BetaReaderRole[] =
    selectedPersonas && selectedPersonas.length > 0
      ? selectedPersonas
      : (Object.keys(BETA_READER_PERSONAS) as BetaReaderRole[]);

  const sentences = manuscriptText
    .split(/[।!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const sampleSentence1 = sentences[0] || "রাত নেমেছে শহরের বুকে।";
  const sampleSentence2 =
    sentences[Math.floor(sentences.length * 0.4)] || "সে তার হাতের ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।";
  const sampleSentence3 =
    sentences[Math.floor(sentences.length * 0.75)] || "কোনো শব্দ নেই, কেবল দেয়ালঘড়ির টিকটিক আওয়াজ।";
  const sampleSentenceEnd =
    sentences[sentences.length - 1] || "দরজায় দুটো মৃদু কড়া নাড়ার শব্দ হলো।";

  const personaReviews: PersonaReview[] = personasToRun.map((roleId) => {
    const meta = BETA_READER_PERSONAS[roleId];

    if (roleId === "farhan_logic") {
      return {
        personaId: "farhan_logic",
        personaName: meta.nameEnglish,
        nameBangla: meta.nameBangla,
        avatarIcon: meta.avatarIcon,
        badgeColor: meta.badgeColor,
        score: 4.1,
        dnfRiskPercent: 12,
        dnfTriggerPoint: null,
        firstImpressionBangla: "ঘটনার সময়কাল ও চরিত্রের প্রতিক্রিয়া বেশ যুক্তিযুক্ত। তবে দ্বিতীয় দৃশ্যে চরিত্রটি যেভাবে গোপন তথ্য পেল, তার সোর্স স্পষ্ট নয়।",
        inDepthCritiqueBangla: "চরিত্রের সিদ্ধান্তগুলোতে যৌক্তিক ধারাবাহিকতা বজায় রয়েছে। কিন্তু যদি সে আগেই জানত যে রুমটিতে গোপন ক্যামেরা আছে, তবে তার তাৎক্ষণিক সংলাপ কিছুটা অসঙ্গত মনে হয়। কারণ-ফলাফলের শৃঙ্খল আর একটু শক্ত করলে থ্রিলারটি নিশ্ছিদ্র হবে।",
        favoriteQuoteBangla: sampleSentenceEnd,
        annotatedMarginNotes: [
          {
            id: "note_farhan_1",
            type: "plot_hole",
            typeLabelBangla: "লজিক খামতি",
            highlightedExcerpt: sampleSentence2,
            commentBangla: "এখানে চরিত্রটি কীভাবে নিশ্চিত হলো যে এই ফাইলটি আসল? তার সন্দেহ করার বাস্তব কারণ আগেই তৈরি করা দরকার।",
            commentEnglish: "How did the protagonist verify file authenticity so instantly without verification?",
            suggestedRevisionBangla: "ফাইলটির খামে পুলিশ সুপারের মোহর দেখে তার বুক ধক করে উঠল; এটি যে আসল নথি, তাতে আর কোনো দ্বিধা রইল না।",
            severity: "critical"
          },
          {
            id: "note_farhan_2",
            type: "gem_moment",
            typeLabelBangla: "নিখুঁত পর্যবেক্ষণ",
            highlightedExcerpt: sampleSentenceEnd,
            commentBangla: "কড়া নাড়ার এই মোচড়টি খুব সময়োপযোগী এবং বাস্তবসম্মত। কৌতূহল পুরোপুরি জাগিয়ে রেখেছে।",
            commentEnglish: "Excellent timed knock, high physical plausibility.",
            suggestedRevisionBangla: sampleSentenceEnd,
            severity: "praise"
          }
        ],
        wouldRecommendToFriend: true
      };
    }

    if (roleId === "nabila_thriller") {
      const isSlow = wordCount > 400 && !manuscriptText.includes("?") && !manuscriptText.includes("!");
      return {
        personaId: "nabila_thriller",
        personaName: meta.nameEnglish,
        nameBangla: meta.nameBangla,
        avatarIcon: meta.avatarIcon,
        badgeColor: meta.badgeColor,
        score: isSlow ? 3.4 : 4.6,
        dnfRiskPercent: isSlow ? 45 : 8,
        dnfTriggerPoint: isSlow ? sampleSentence2 : null,
        firstImpressionBangla: "শেষের ক্লিফহ্যাংগারটা ফাটাফাটি! তবে মাঝামাঝি অংশে বর্ণনার অতিরিক্ত মেদ কাঁচি দিয়ে ছেঁটে ফেললে রিদম আরও রকেটের মতো ছুটবে।",
        inDepthCritiqueBangla: "আমি পাতায় পাতায় এড্রেনালিন রাশ খুঁজি। প্রথম ৩০ সেকেন্ডের মধ্যে যে টেনশন তৈরি হয়েছে তা অসাধারণ। কিন্তু প্যারাগ্রাফ ৩-এ পরিবেশের বর্ণনায় গতি কিছুটা শ্লথ হয়েছে। ওইখানে একটা অতর্কিত বিপদ বা সময়সীমার তাড়া ঢুকিয়ে দিন।",
        favoriteQuoteBangla: sampleSentence1,
        annotatedMarginNotes: [
          {
            id: "note_nabila_1",
            type: "pacing_drag",
            typeLabelBangla: "পেসিং স্লো",
            highlightedExcerpt: sampleSentence2,
            commentBangla: "এই অংশে চরিত্রের গভীর ভাবনার বদলে বাইরের কোনো শারীরিক তাড়া (যেমন- গাড়ির হর্ন বা পায়ের আওয়াজ) দিলে গতি বজায় থাকবে।",
            commentEnglish: "Interior contemplation slows momentum; introduce physical sensory urgency here.",
            suggestedRevisionBangla: "নিচে ব্রেক কষার তীক্ষ্ণ চিৎকার শোনা গেল—আর মাত্র তিন মিনিট সময় আছে তার হাতে!",
            severity: "medium"
          },
          {
            id: "note_nabila_2",
            type: "gem_moment",
            typeLabelBangla: "হুক মোমেন্ট",
            highlightedExcerpt: sampleSentenceEnd,
            commentBangla: "এই ক্লিফহ্যাংগার পড়ার পর পরের চ্যাপ্টার না পড়ে শোয়া অসম্ভব! দারুণ ফিনিশিং।",
            commentEnglish: "Unputdownable cliffhanger finish.",
            suggestedRevisionBangla: sampleSentenceEnd,
            severity: "praise"
          }
        ],
        wouldRecommendToFriend: true
      };
    }

    if (roleId === "tahsin_stylist") {
      return {
        personaId: "tahsin_stylist",
        personaName: meta.nameEnglish,
        nameBangla: meta.nameBangla,
        avatarIcon: meta.avatarIcon,
        badgeColor: meta.badgeColor,
        score: 4.4,
        dnfRiskPercent: 10,
        dnfTriggerPoint: null,
        firstImpressionBangla: "ভাষার বুননে একটি পরিমিত বিষণ্ণ সৌন্দর্য আছে। ইন্দ্রিয়ানুভূতির প্রয়োগ অত্যন্ত জীবন্ত।",
        inDepthCritiqueBangla: "শব্দচয়নে সচেতন সংযম মুগ্ধ করেছে। বিশেষ করে বৃষ্টির শব্দের সাথে চরিত্রের মনস্তাত্ত্বিক শূন্যতার যে সংযোগ টানা হয়েছে, তা উঁচুমানের সাহিত্যের দাবি রাখে। শুধু কিছু গতানুগতিক বিশেষণের বদলে আরেকটু মৌলিক রূপক আশা করেছিলাম।",
        favoriteQuoteBangla: sampleSentence3,
        annotatedMarginNotes: [
          {
            id: "note_tahsin_1",
            type: "dialogue_stiff",
            typeLabelBangla: "শৈলী সংস্কার",
            highlightedExcerpt: sampleSentence1,
            commentBangla: "'রাত নেমেছে শহরের বুকে' কিছুটা প্রথাগত। একে ঢাকার কুয়াশাচ্ছন্ন বা নিভন্ত ল্যাম্পপোস্টের অনন্য ইন্দ্রিয় দিয়ে ফুটিয়ে তুলুন।",
            commentEnglish: "Slightly conventional stock imagery; sharpen with unique visceral sensory texture.",
            suggestedRevisionBangla: "শহরের আকাশ বেয়ে নিভন্ত নিওনবাতির ম্লান হলুদ আলো তরল কাচের মতো চুইয়ে পড়ছিল।",
            severity: "medium"
          },
          {
            id: "note_tahsin_2",
            type: "emotional_peak",
            typeLabelBangla: "অনন্য উপমা",
            highlightedExcerpt: sampleSentence3,
            commentBangla: "দেয়ালঘড়ির শব্দের সাথে একাকীত্বের অনুরণন চমৎকার সাহিত্যিক আবেশ সৃষ্টি করেছে।",
            commentEnglish: "Haunting auditory motif amplifying existential dread.",
            suggestedRevisionBangla: sampleSentence3,
            severity: "praise"
          }
        ],
        wouldRecommendToFriend: true
      };
    }

    if (roleId === "samira_romance") {
      return {
        personaId: "samira_romance",
        personaName: meta.nameEnglish,
        nameBangla: meta.nameBangla,
        avatarIcon: meta.avatarIcon,
        badgeColor: meta.badgeColor,
        score: 4.3,
        dnfRiskPercent: 14,
        dnfTriggerPoint: null,
        firstImpressionBangla: "চরিত্রগুলোর সম্পর্কের টানাপোড়েন হৃদয় ছুঁয়ে গেছে। চোখের চাহনি ও না-বলা কথার মধ্যে তীব্র আকুলতা ফুটে উঠেছে।",
        inDepthCritiqueBangla: "দুই চরিত্রের মাঝের নিঃশব্দ সংঘাত খুব শক্তভাবে দাঁড়িয়েছে। তারা মুখে যা বলছে, তার চেয়ে যা আড়াল করছে সেটাই বেশি কথা বলছে। তবে শেষ দিকে তার কণ্ঠের কাঁপুনি অথবা আঙুলের অসাড়তার মতো ক্ষুদ্র শারীরিক সংকেত যোগ করলে আবেগ আরেক ধাপ শীর্ষে পৌঁছাবে।",
        favoriteQuoteBangla: sampleSentence2,
        annotatedMarginNotes: [
          {
            id: "note_samira_1",
            type: "emotional_peak",
            typeLabelBangla: "হৃদয়স্পর্শী টান",
            highlightedExcerpt: sampleSentence2,
            commentBangla: "তার এই স্তব্ধতা কেবল ভয়ের নয়, এক গভীর বিশ্বাসভঙ্গের বেদনার। দারুণ সাবটেক্সট!",
            commentEnglish: "Deep unspoken betrayal subtext radiating through stillness.",
            suggestedRevisionBangla: sampleSentence2,
            severity: "praise"
          },
          {
            id: "note_samira_2",
            type: "dialogue_stiff",
            typeLabelBangla: "রসায়ন সংবেদন",
            highlightedExcerpt: sampleSentenceEnd,
            commentBangla: "কড়া নাড়ার পর চরিত্রের বুকের ধুকপুকানি ও শ্বাসরুদ্ধ অনুভূতি আরেকটু প্রকাশ পেলে পাঠক তার সাথে সম্পূর্ণ একাত্ম হবে।",
            commentEnglish: "Deepen somatic emotional response (shallow breath, trembling pulse) on the knock.",
            suggestedRevisionBangla: "দরজায় দুটো মৃদু কড়া নাড়ার শব্দ হলো। তার বুকের ভেতরটা এক মুহূর্তে হিম হয়ে গেল, নিঃশ্বাস যেন গলার কাছে আটকে রইল।",
            severity: "medium"
          }
        ],
        wouldRecommendToFriend: true
      };
    }

    // Default: kabir_commuter
    return {
      personaId: "kabir_commuter",
      personaName: meta.nameEnglish,
      nameBangla: meta.nameBangla,
      avatarIcon: meta.avatarIcon,
      badgeColor: meta.badgeColor,
      score: 4.5,
      dnfRiskPercent: 9,
      dnfTriggerPoint: null,
      firstImpressionBangla: "মেট্রোরেলে দাঁড়িয়ে পড়তে পড়তে কখন স্টেশন চলে এল বুঝতেই পারিনি! দারুণ টানটান গল্প।",
      inDepthCritiqueBangla: "পড়া খুব সহজ, কোথাও হোঁচট খেতে হয়নি। ভারী কোনো জটিলতা ছাড়াই দৃশ্যপট চোখের সামনে পরিষ্কার ভেসে ওঠে। সাধারণ পাঠকের কাছে এই অধ্যায় নিশ্চিতভাবেই ভীষণ জনপ্রিয় হবে। শুধু দুই জায়গায় চরিত্রের পদবি স্পষ্ট থাকলে বিভ্রান্তি এড়ানো যেত।",
      favoriteQuoteBangla: sampleSentenceEnd,
      annotatedMarginNotes: [
        {
          id: "note_kabir_1",
          type: "confusing",
          typeLabelBangla: "পরিচয় বিভ্রান্তি",
          highlightedExcerpt: sampleSentence2,
          commentBangla: "এখানে 'সে' বলতে ঠিক কাকে বোঝানো হচ্ছে তা চট করে বোঝা যায় না। নামটা সরাসরি বলে দিলে পড়তে সুবিধা হয়।",
          commentEnglish: "Ambiguous pronoun reference; using direct character name prevents reader friction during fast commutes.",
          suggestedRevisionBangla: "ইমরান তার হাতের ফাইলটির দিকে স্তব্ধ হয়ে চেয়ে রইল।",
          severity: "medium"
        },
        {
          id: "note_kabir_2",
          type: "gem_moment",
          typeLabelBangla: "পাঠক মনোরঞ্জন",
          highlightedExcerpt: sampleSentenceEnd,
          commentBangla: "এমন সময়ে দরজায় শব্দ হলো যে পুরো কৌতূহল তুঙ্গে উঠে গেল! কাল সকালে অফিসে যাওয়ার পথে পরেরটা পড়ব।",
          commentEnglish: "Gripping cliffhanger keeps high retention for daily commuters.",
          suggestedRevisionBangla: sampleSentenceEnd,
          severity: "praise"
        }
      ],
      wouldRecommendToFriend: true
    };
  });

  const totalScore = personaReviews.reduce((acc, p) => acc + p.score, 0);
  const avgScore = Number((totalScore / personaReviews.length).toFixed(1));
  const totalDnf = personaReviews.reduce((acc, p) => acc + p.dnfRiskPercent, 0);
  const avgDnf = Math.round(totalDnf / personaReviews.length);

  return {
    auditId: `bta_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    projectId,
    chapterTitle,
    wordCount,
    readingTimeMinutes,
    consensusSummary: {
      overallScore: avgScore,
      averageDnfRiskPercent: avgDnf,
      groupVerdictBangla:
        avgDnf < 15
          ? "ফোকাস গ্রুপের সার্বিক রায়: অত্যন্ত শক্তিশালী ও পাঠকমগ্নকারী ড্রাফট (High Commercial & Literary Appeal)।"
          : "ফোকাস গ্রুপের সার্বিক রায়: চিত্তাকর্ষক প্লট, তবে পেসিং ও চরিত্র-লজিকের কিছু অংশে রিভিশন প্রয়োজন।",
      topStrengthsBangla: [
        "চ্যাপ্টারের সমাপনী ক্লিফহ্যাংগার সব পাঠকের মধ্যেই পরবর্তী অংশ পড়ার প্রচণ্ড আগ্রহ তৈরি করেছে।",
        "দৃশ্যপট ও পরিবেশের চিত্রায়ণ অত্যন্ত বাস্তবসম্মত এবং ইন্দ্রিয়ানুভূতির ছোঁয়ায় জীবন্ত।",
        "চরিত্রের অন্তর্দ্বন্দ্ব এবং সম্পর্কের সূক্ষ্ম উত্তেজনা নিপুণভাবে প্রস্ফুটিত।"
      ],
      urgentFixesBangla: [
        "দ্বিতীয় দৃশ্যে ফাইল প্রাপ্তির লজিকাল ব্যাকগ্রাউন্ড স্পষ্ট করা দরকার (ফারহানের অডিট)।",
        "প্যারাগ্রাফ ৩-এ বর্ণনার আধিক্য কমিয়ে তাৎক্ষণিক বিপদ বা সময়ের চাপ বৃদ্ধি করা উচিত (নাবিলার পেসিং নোট)।",
        "সর্বনামের অসঙ্গতি দূর করে চরিত্রের পরিচয় স্পষ্ট করা দরকার (কবিরের পাঠযোগ্যতা নোট)।"
      ],
      retentionAdviceBangla:
        "অধ্যায়ের শুরুর ৩০ সেকেন্ডের আকর্ষণ ধরে রেখে মধ্যভাগের ক্লিপড ডায়ালগে আরও একটু ভৌত তাড়া দিন। এতে ড্রপ-অফ রেট ৫%-এর নিচে নেমে আসবে।"
    },
    personaReviews,
    timestamp: new Date().toISOString()
  };
}

const auditInputSchema = z.object({
  manuscriptText: z.string().min(1, "Manuscript text cannot be empty"),
  chapterTitle: z.string().optional().default("অধ্যায় ১: সূচনা"),
  selectedPersonas: z
    .array(
      z.enum([
        "farhan_logic",
        "nabila_thriller",
        "tahsin_stylist",
        "samira_romance",
        "kabir_commuter"
      ])
    )
    .optional()
});

const applyFixSchema = z.object({
  manuscriptText: z.string(),
  highlightedExcerpt: z.string(),
  suggestedRevision: z.string()
});

// Dual-path route handlers
const PERSONA_ROUTES = [
  "/v1/projects/:id/beta-readers/personas",
  "/api/v1/projects/:id/beta-readers/personas"
];

const AUDIT_ROUTES = [
  "/v1/projects/:id/beta-readers/audit",
  "/api/v1/projects/:id/beta-readers/audit"
];

const APPLY_FIX_ROUTES = [
  "/v1/projects/:id/beta-readers/apply-fix",
  "/api/v1/projects/:id/beta-readers/apply-fix"
];

for (const path of PERSONA_ROUTES) {
  betaReadersRouter.get(path, (req: Request, res: Response) => {
    try {
      const personas = Object.values(BETA_READER_PERSONAS);
      res.json({
        projectId: req.params.id,
        count: personas.length,
        personas
      });
    } catch (err: any) {
      logger.error("[BetaReaders] Error fetching personas:", err);
      res.status(500).json({ error: "Failed to fetch beta reader personas", details: err.message });
    }
  });
}

for (const path of AUDIT_ROUTES) {
  betaReadersRouter.post(path, (req: Request, res: Response) => {
    try {
      const rawId = req.params.id;
      const projectId = (Array.isArray(rawId) ? rawId[0] : rawId) || "default";
      const parsed = auditInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid beta reader audit payload",
          issues: parsed.error.issues
        });
        return;
      }

      const report = performBetaReaderAudit(
        projectId,
        parsed.data.manuscriptText,
        parsed.data.chapterTitle,
        parsed.data.selectedPersonas
      );

      res.json(report);
      return;
    } catch (err: any) {
      logger.error("[BetaReaders] Error running focus group audit:", err);
      res.status(500).json({ error: "Failed to run beta reader audit", details: err.message });
      return;
    }
  });
}

for (const path of APPLY_FIX_ROUTES) {
  betaReadersRouter.post(path, (req: Request, res: Response) => {
    try {
      const parsed = applyFixSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Invalid apply-fix payload",
          issues: parsed.error.issues
        });
        return;
      }

      const { manuscriptText, highlightedExcerpt, suggestedRevision } = parsed.data;
      if (!manuscriptText.includes(highlightedExcerpt)) {
        res.status(404).json({
          error: "Excerpt not found in manuscript text",
          applied: false,
          manuscriptText
        });
        return;
      }

      const updatedText = manuscriptText.replace(highlightedExcerpt, suggestedRevision);
      res.json({
        applied: true,
        updatedText,
        replacedExcerpt: highlightedExcerpt,
        newSnippet: suggestedRevision
      });
      return;
    } catch (err: any) {
      logger.error("[BetaReaders] Error applying revision:", err);
      res.status(500).json({ error: "Failed to apply revision", details: err.message });
      return;
    }
  });
}
