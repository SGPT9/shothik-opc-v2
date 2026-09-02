import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    status: "online",
    edgeGateway: true,
    availableModels: ["deepseek-r1", "claude-3.7-sonnet", "gpt-4.5"],
  });
}
