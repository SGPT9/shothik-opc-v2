import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";

export const runtime = "edge";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (user) {
    return NextResponse.json({
      user,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  return NextResponse.json({
    user: {
      id: "guest-user",
      name: "Guest User",
      email: "guest@shothikgpt.com",
      role: "guest",
    },
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
}
