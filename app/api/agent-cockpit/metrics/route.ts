import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    metrics: {
      totalTokens: 1482900,
      promptTokens: 980400,
      completionTokens: 502500,
      estimatedCostUsd: 4.82,
      activeSessions: 3,
      avgLatencyMs: 245,
      throughputRps: 18.4,
      modelUsageBreakdown: [
        { model: "gemini-1.5-pro", usagePercent: 52 },
        { model: "claude-3-5-sonnet", usagePercent: 34 },
        { model: "opensearch-vl", usagePercent: 14 },
      ],
      hourlyTokenTrend: [
        { hour: "08:00", tokens: 120000 },
        { hour: "09:00", tokens: 210000 },
        { hour: "10:00", tokens: 180000 },
        { hour: "11:00", tokens: 340000 },
        { hour: "12:00", tokens: 290000 },
        { hour: "13:00", tokens: 342900 },
      ],
    },
  });
}
