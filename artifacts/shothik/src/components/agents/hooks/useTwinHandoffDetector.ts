import { useMemo } from "react";

export type TwinTriggerType =
  | "COMMERCE_LOGISTICS"
  | "ACADEMIC_PUBLISHING"
  | "VENTURE_OPPORTUNITY"
  | "REPETITION_WORKFLOW"
  | "SPRINT_EXECUTION"
  | "NONE";

export interface TwinTriggerContext {
  eligible: boolean;
  triggerType: TwinTriggerType;
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
    ): TwinTriggerContext => ({
      eligible,
      triggerType,
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

    // 1. Commerce & Courier Logistics Trigger
    if (COMMERCE_KEYWORDS.some((kw) => recentText.includes(kw))) {
      return buildResult(
        true,
        "COMMERCE_LOGISTICS",
        "Automate Parcel Tracking & Customer Replies",
        "Connect Steadfast / Pathao Courier APIs to automatically answer delivery questions and reconcile COD orders via Twin.",
        "Connect Courier Twin",
        `/twin/new?track=connect&channel=courier&fromChat=${conversationId || "active"}`,
        "F-Commerce Automation",
      );
    }

    // 2. Academic Thesis & Publishing POD Trigger
    if (
      ACADEMIC_KEYWORDS.some((kw) => recentText.includes(kw)) ||
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
      );
    }

    // 3. Founder & Venture Opportunity Trigger
    if (VENTURE_KEYWORDS.some((kw) => recentText.includes(kw))) {
      return buildResult(
        true,
        "VENTURE_OPPORTUNITY",
        "Turn Opportunity into Pitch Deck & Plan",
        "Have Twin transform this market insight into an investor pitch deck (Slide Studio) and operating financial model.",
        "Generate Pitch Deck & Plan",
        `/twin/new?track=build&fromChat=${conversationId || "active"}`,
        "Venture Operating Layer",
      );
    }

    // 4. Recurring Schedule & Repetition Trigger
    if (
      REPETITION_KEYWORDS.some((kw) => recentText.includes(kw)) ||
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
      );
    }

    // 5. Classic Sprint Execution Roadmap fallback
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
      );
    }

    return buildResult(false, "NONE", "", "", "", "", "");
  }, [messages, conversationId]);
}
