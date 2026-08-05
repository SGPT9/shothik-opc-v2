import { NextResponse } from "next/server";
import { getConfiguredConvexJwks } from "@/lib/convex/jwt-config";

export async function GET() {
  return NextResponse.json(getConfiguredConvexJwks(), {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
