import { useMemo } from "react";

const STARTUP_KEYWORDS = [
  "saas",
  "startup",
  "company",
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
  "yc",
  "fundraise",
  "product market fit",
];

export function useTwinHandoffDetector(messages: { content: string }[]) {
  const hasStartupIntent = useMemo(() => {
    if (!messages || messages.length === 0) return false;

    // Check last 4 messages for startup keywords
    const recentText = messages
      .slice(-4)
      .map((m) => m.content.toLowerCase())
      .join(" ");

    return STARTUP_KEYWORDS.some((kw) => recentText.includes(kw));
  }, [messages]);

  return {
    hasStartupIntent,
  };
}
