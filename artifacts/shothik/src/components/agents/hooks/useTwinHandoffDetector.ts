import { useMemo } from "react";

export type TwinTriggerType =
  | "COMMERCE_LOGISTICS"
  | "ACADEMIC_PUBLISHING"
  | "VENTURE_OPPORTUNITY"
  | "REPETITION_WORKFLOW"
  | "SPRINT_EXECUTION"
  | "DEVELOPER_TWIN"
  | "FINTECH_MFS"
  | "WRITING_CONTENT"
  | "CONVERSATIONAL_VOICE"
  | "NONE";

export interface TwinTriggerContext {
  eligible: boolean;
  triggerType: TwinTriggerType;
  serviceId?: number;
  pillarName?: string;
  triad?: "writing" | "creative" | "twin";
  title: string;
  description: string;
  actionText: string;
  targetUrl: string;
  badgeText: string;
  hasStartupIntent: boolean;
}

const COMMERCE_KEYWORDS = [
  "delivery",
  "parcel",
  "steadfast",
  "pathao",
  "redx",
  "courier",
  "cod",
  "cash on delivery",
  "customer inquiries",
  "customer query",
  "customer inquiry",
  "orders",
  "tracking",
  "rto",
  "return to origin",
  "f-commerce",
  "ecommerce",
  "e-commerce",
  "woocommerce",
  "daraz",
  "পার্সেল",
  "ডেলিভারি",
  "কুরিয়ার",
  "অর্ডার",
  "কাস্টমার",
  "ক্যাশ অন ডেলিভারি",
  "পাঠাও",
  "স্টিডফাস্ট",
  "ট্র্যাকিং",
];

const ACADEMIC_KEYWORDS = [
  "thesis",
  "monograph",
  "manuscript",
  "dissertation",
  "literature review",
  "research paper",
  "chapter draft",
  "ieee",
  "apa",
  "citations",
  "bibliography",
  "boimela",
  "print on demand",
  "pod",
  "nilkhet",
  "book printing",
  "বই",
  "থিসিস",
  "গবেষণা",
  "অধ্যায়",
  "পাণ্ডুলিপি",
  "বইমেলা",
  "নীলক্ষেত",
  "মুদ্রণ",
  "প্রকাশনা",
];

const VENTURE_KEYWORDS = [
  "market gap",
  "startup",
  "pricing",
  "business plan",
  "gtm",
  "launch",
  "tam",
  "sam",
  "som",
  "financial model",
  "financial runway",
  "runway",
  "competitor analysis",
  "pitch deck",
  "investor",
  "fundraise",
  "fundraising",
  "product market fit",
  "unit economics",
  "ব্যবসা",
  "ইনভেস্টর",
  "মার্কেট গ্যাপ",
  "পিচ ডেক",
  "স্টার্টআপ",
  "ফান্ডরেইজ",
];

const REPETITION_KEYWORDS = [
  "weekly",
  "recurring",
  "schedule",
  "every monday",
  "automate this",
  "run daily",
  "repeated data",
  "meeting summaries",
  "recurring reporting",
  "daily report",
  "nightshift",
  "প্রতিদিন",
  "প্রতি সপ্তাহে",
  "রিকারিং",
  "শিডিউল",
  "অটোমেশন",
];

const DEVELOPER_KEYWORDS = [
  "bug",
  "exception",
  "stack trace",
  "failing test",
  "vitest",
  "jest",
  "ast",
  "blast radius",
  "refactor",
  "self-heal",
  "self healing",
  "red-green-refactor",
  "docker container",
  "pull request",
  "git patch",
  "deploy preview",
  "syntax error",
  "typescript error",
  "runtime error",
  "ci/cd",
  "ব্যাগ",
  "কোড",
  "রিফ্যাক্টর",
  "বাগ ফিক্স",
  "টেস্টিং",
  "এরর",
];

const FINTECH_KEYWORDS = [
  "bkash",
  "nagad",
  "rocket",
  "upay",
  "mfs",
  "mobile financial",
  "disbursement",
  "merchant settlement",
  "payment gateway",
  "cashout",
  "cash out",
  "transaction fee",
  "বিকাশ",
  "নগদ",
  "পেমেন্ট",
  "লেনদেন",
  "ক্যাশআউট",
  "মার্চেন্ট",
];

const WRITING_KEYWORDS = [
  "paraphrase",
  "grammar",
  "plagiarism",
  "ai humanize",
  "humanization",
  "proofread",
  "banglish to bangla",
  "summarize text",
  "summarization",
  "প্যারাফ্রেজ",
  "গ্রামার",
  "অনুবাদ",
  "সামারি",
];

const VOICE_KEYWORDS = [
  "voice call",
  "audio mode",
  "bangla voice",
  "speech to text",
  "audio transcription",
  "ভয়েস",
  "কথা বলা",
  "অডিও",
];

function hasKeywordMatch(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => {
    if (kw.length <= 4 && /^[a-z0-9_-]+$/i.test(kw)) {
      const regex = new RegExp(`(^|[^a-zA-Z0-9_-])${kw}([^a-zA-Z0-9_-]|$)`, "i");
      return regex.test(text);
    }
    return text.includes(kw);
  });
}

export function useTwinHandoffDetector(
  messages: { content: string; metadata?: any }[],
  conversationId?: string,
): TwinTriggerContext {
  return useMemo(() => {
    const buildResult = (
      eligible: boolean,
      triggerType: TwinTriggerType,
      title: string,
      description: string,
      actionText: string,
      targetUrl: string,
      badgeText: string,
      serviceId?: number,
      pillarName?: string,
      triad?: "writing" | "creative" | "twin",
    ): TwinTriggerContext => ({
      eligible,
      triggerType,
      serviceId,
      pillarName,
      triad,
      title,
      description,
      actionText,
      targetUrl,
      badgeText,
      hasStartupIntent:
        eligible &&
        (triggerType === "VENTURE_OPPORTUNITY" ||
          triggerType === "SPRINT_EXECUTION"),
    });

    if (!messages || messages.length < 2) {
      return buildResult(false, "NONE", "", "", "", "", "");
    }

    const recentText = messages
      .slice(-6)
      .map((m) => (m.content || "").toLowerCase())
      .join(" ");

    const totalWordCount = messages.reduce(
      (acc, m) => acc + (m.content ? m.content.split(/\s+/).length : 0),
      0,
    );

    // 1. Developer Twin & Agent Services (Service 11)
    if (hasKeywordMatch(recentText, DEVELOPER_KEYWORDS)) {
      return buildResult(
        true,
        "DEVELOPER_TWIN",
        "Dispatch Autonomous Developer Twin",
        "Run self-healing Red-Green-Refactor loop in isolated sandboxes and analyze AST blast radius.",
        "Open Developer Twin",
        `/twin?tab=developer&fromChat=${conversationId || "active"}`,
        "Developer Twin · AST Engine",
        11,
        "AI Agent Services & Autonomous Developer",
        "twin",
      );
    }

    // 2. FinTech, MFS & Banking Gateway (Service 12)
    if (hasKeywordMatch(recentText, FINTECH_KEYWORDS)) {
      return buildResult(
        true,
        "FINTECH_MFS",
        "Automate bKash & Nagad MFS Settlements",
        "Reconcile payment transactions, cashout fees, and merchant disbursements directly on MFS rails.",
        "Open MFS Gateway",
        `/twin?tab=mfs&fromChat=${conversationId || "active"}`,
        "FinTech & MFS Rails",
        12,
        "Payments & Monetization",
        "twin",
      );
    }

    // 3. Commerce & Courier Logistics Trigger (Service 7 & 6)
    if (hasKeywordMatch(recentText, COMMERCE_KEYWORDS)) {
      return buildResult(
        true,
        "COMMERCE_LOGISTICS",
        "Automate Parcel Tracking & Customer Replies",
        "Connect Steadfast / Pathao Courier APIs to automatically answer delivery questions and reconcile COD orders via Twin.",
        "Connect Courier Twin",
        `/twin/new?track=connect&channel=courier&fromChat=${conversationId || "active"}`,
        "F-Commerce Automation",
        7,
        "Logistics & Courier Automation",
        "twin",
      );
    }

    // 4. Academic Thesis & Publishing POD Trigger (Service 2 & 10)
    if (
      hasKeywordMatch(recentText, ACADEMIC_KEYWORDS) ||
      totalWordCount > 2500
    ) {
      return buildResult(
        true,
        "ACADEMIC_PUBLISHING",
        "Turn Manuscript into a Print-Ready Book",
        "Your writing is structured as a monograph. View the 3D BoiMela flip preview, calculate Nilkhet print costs, and publish.",
        "Open 3D Book Preview",
        `/books/active-draft?fromChat=${conversationId || "active"}`,
        "BoiMela Publishing",
        10,
        "Publishing & Print-on-Demand",
        "creative",
      );
    }

    // 5. Founder & Venture Opportunity Trigger (Service 8)
    if (hasKeywordMatch(recentText, VENTURE_KEYWORDS)) {
      return buildResult(
        true,
        "VENTURE_OPPORTUNITY",
        "Turn Opportunity into Pitch Deck & Plan",
        "Have Twin transform this market insight into an investor pitch deck (Slide Studio) and operating financial model.",
        "Generate Pitch Deck & Plan",
        `/twin/new?track=build&fromChat=${conversationId || "active"}`,
        "Venture Operating Layer",
        8,
        "Venture Creation",
        "creative",
      );
    }

    // 6. Writing & Linguistic Content Trigger (Service 3)
    if (hasKeywordMatch(recentText, WRITING_KEYWORDS)) {
      return buildResult(
        true,
        "WRITING_CONTENT",
        "Open Linguistic & Writing Studio",
        "Run contextual paraphrasing, Banglish-to-Bangla translation, APA formatting, and AI humanization.",
        "Open Writing Studio",
        `/writing-studio?fromChat=${conversationId || "active"}`,
        "Writing & Linguistics",
        3,
        "Writing & Content Creation",
        "writing",
      );
    }

    // 7. Conversational Voice & Multimodal Audio Trigger (Service 9)
    if (hasKeywordMatch(recentText, VOICE_KEYWORDS)) {
      return buildResult(
        true,
        "CONVERSATIONAL_VOICE",
        "Launch Conversational Voice Mode",
        "Low-latency Bengali and English speech synthesis with real-time Work Canvas interaction.",
        "Start Voice Mode",
        `/twin?tab=voice&fromChat=${conversationId || "active"}`,
        "Voice & Audio Intelligence",
        9,
        "Conversational AI",
        "writing",
      );
    }

    // 8. Recurring Schedule & Repetition Trigger (Service 5)
    if (
      hasKeywordMatch(recentText, REPETITION_KEYWORDS) ||
      messages.length >= 8
    ) {
      return buildResult(
        true,
        "REPETITION_WORKFLOW",
        "Automate this Workflow with Twin Nightshift",
        "You run this task frequently. Let Twin execute it autonomously on schedule while you sleep.",
        "Schedule Nightshift",
        `/twin?tab=nightshift&fromChat=${conversationId || "active"}`,
        "Autonomous Routine",
        5,
        "Twin — Business Automation",
        "twin",
      );
    }

    // 9. Classic Sprint Execution Roadmap fallback (Service 1)
    const hasSprintPlan = messages.some((msg) => {
      const meta = msg.metadata as any;
      if (meta?.twinEligible || meta?.projectIntent || meta?.isPrd) return true;
      const content = msg.content || "";
      return /(### (strategic execution roadmap|product requirements|project roadmap|sprint plan|architecture specification)|\|\s*\*\*foundation|\*\*sprint backlog\*\*|user stories & acceptance criteria|workstream.*timeline)/i.test(
        content,
      );
    });

    if (hasSprintPlan) {
      return buildResult(
        true,
        "SPRINT_EXECUTION",
        "Start this in Twin",
        "Turn this conversation into an active company workspace with actionable tasks and live tracking.",
        "Start in Twin",
        `/twin?fromChat=${conversationId || "active"}`,
        "Next Step",
        1,
        "AI Execution",
        "twin",
      );
    }

    return buildResult(false, "NONE", "", "", "", "", "");
  }, [messages, conversationId]);
}
