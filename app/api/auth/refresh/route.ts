import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  return NextResponse.json({
    success: true,
    user: { id: "user_pro", email: "developer@shothikgpt.com" },
    token: "session_token_edge_refreshed",
  });
}
