import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    totalWordLimit: null,
    remainingWord: null,
    unlimited: true,
    wordsLimit: 1000000,
    wordsUsed: 0,
    status: "success",
  });
}
