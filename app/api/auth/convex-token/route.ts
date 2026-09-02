import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST() {
  return NextResponse.json({
    token: "dev_convex_token_production",
    user: {
      id: "prod_user",
      name: "Pro User",
      email: "user@shothikgpt.com",
      role: "admin",
    },
  });
}
