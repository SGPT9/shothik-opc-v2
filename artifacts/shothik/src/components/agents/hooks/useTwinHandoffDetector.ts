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
}

const COMMERCE_KEYWORDS = [
  "delivery",
  "parcel",
  "steadfast",
  "pathao",
  "redx",
  "courier",
  "cod",
  "customer inquiries",
  "customer query",
  "orders",
  "tracking",
  "rto",
  "f-commerce",
  "woocommerce",
  "পার্সেল",
  "ডেলিভারি",
  "কুরিয়ার",
  "অর্ডার",
  "কাস্টমার",
];

const ACADEMIC_KEYWORDS = [
  "thesis",
  "monograph",
  "manuscript",
  "dissertation",
  "literature review",
  "ieee",
  "apa",
  "citations",
  "bibliography",
  "boimela",
  "print on demand",
  "nilkhet",
  "বই",
  "থিসিস",
  "গবেষণা",
  "অধ্যায়",
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
  "pitch deck",
  "investor",
  "fundraise",
  "product market fit",
  "ব্যবসা",
  "ইনভেস্টর",
  "মার্কেট গ্যাপ",
];

const REPETITION_KEYWORDS = [
  "weekly",
  "recurring",
  "schedule",
  "every monday",
  "automate this",
  "run daily",
  "প্রতিদিন",
  "প্রতি সপ্তাহে",
  "রিকারিং",
];

export function useTwinHandoffDetector(
  messages: { content: string; metadata?: any }[],
  conversationId?: string,
): TwinTriggerContext {
  return useMemo(() => {
    if (!messages || messages.length < 2) {
      return {
        eligible: false,
        triggerType: "NONE",
        title: "",
        description: "",
        actionText: "",
        targetUrl: "",
        badgeText: "",
      };
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
      return {
        eligible: true,
        triggerType: "COMMERCE_LOGISTICS",
        title: "Automate Parcel Tracking & Customer Replies",
        description:
          "Connect Steadfast / Pathao Courier APIs to automatically answer delivery questions and reconcile COD orders via Twin.",
        actionText: "Connect Courier Twin",
        targetUrl: `/twin/new?track=connect&channel=courier&fromChat=${conversationId || "active"}`,
        badgeText: "F-Commerce Automation",
      };
    }

    // 2. Academic Thesis & Publishing POD Trigger
    if (
      ACADEMIC_KEYWORDS.some((kw) => recentText.includes(kw)) ||
      totalWordCount > 2500
    ) {
      return {
        eligible: true,
        triggerType: "ACADEMIC_PUBLISHING",
        title: "Turn Manuscript into a Print-Ready Book",
        description:
          "Your writing is structured as a monograph. View the 3D BoiMela flip preview, calculate Nilkhet print costs, and publish.",
        actionText: "Open 3D Book Preview",
        targetUrl: `/books/active-draft?fromChat=${conversationId || "active"}`,
        badgeText: "BoiMela Publishing",
      };
    }

    // 3. Founder & Venture Opportunity Trigger
    if (VENTURE_KEYWORDS.some((kw) => recentText.includes(kw))) {
      return {
        eligible: true,
        triggerType: "VENTURE_OPPORTUNITY",
        title: "Turn Opportunity into Pitch Deck & Plan",
        description:
          "Have Twin transform this market insight into an investor pitch deck (Slide Studio) and operating financial model.",
        actionText: "Generate Pitch Deck & Plan",
        targetUrl: `/twin/new?track=build&fromChat=${conversationId || "active"}`,
        badgeText: "Venture Operating Layer",
      };
    }

    // 4. Recurring Schedule & Repetition Trigger
    if (
      REPETITION_KEYWORDS.some((kw) => recentText.includes(kw)) ||
      messages.length >= 8
    ) {
      return {
        eligible: true,
        triggerType: "REPETITION_WORKFLOW",
        title: "Automate this Workflow with Twin Nightshift",
        description:
          "You run this task frequently. Let Twin execute it autonomously on schedule while you sleep.",
        actionText: "Schedule Nightshift",
        targetUrl: `/twin?tab=nightshift&fromChat=${conversationId || "active"}`,
        badgeText: "Autonomous Routine",
      };
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
      return {
        eligible: true,
        triggerType: "SPRINT_EXECUTION",
        title: "Start this in Twin",
        description:
          "Turn this conversation into an active company workspace with actionable tasks and live tracking.",
        actionText: "Start in Twin",
        targetUrl: `/twin?fromChat=${conversationId || "active"}`,
        badgeText: "Next Step",
      };
    }

    return {
      eligible: false,
      triggerType: "NONE",
      title: "",
      description: "",
      actionText: "",
      targetUrl: "",
      badgeText: "",
    };
  }, [messages, conversationId]);
}
