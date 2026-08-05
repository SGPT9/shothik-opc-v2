import { NextRequest, NextResponse } from "next/server";
import {
  diagnoseConvexJwtConfig,
} from "@/lib/convex/auth-diagnostics";
import { mintConvexUserToken } from "@/lib/convex/user-token";
import logger from "@/lib/logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://prod-api.shothik.ai";

async function verifyAccessToken(
  accessToken: string
): Promise<{ userId: string; email?: string; name?: string } | null> {
  try {
    const res = await fetch(`${API_URL}/api/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const user = data?.data || data?.user || data;

    if (!user) return null;

    const userId = user._id || user.id || user.sub;
    if (!userId) return null;

    return {
      userId,
      email: user.email,
      name: user.name || user.fullName,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const diagnostics = diagnoseConvexJwtConfig();
    if (diagnostics.status !== "healthy") {
      return NextResponse.json(
        {
          error: "Convex token exchange unavailable",
          code: diagnostics.issueCode,
          message: diagnostics.message,
        },
        { status: 503 },
      );
    }

    let accessToken = "";
    try {
      const body = await request.json();
      accessToken = body?.accessToken || "";
    } catch {
      // Empty or unparseable JSON body from guest client
    }

    let verified: { userId: string; email?: string; name?: string } | null = null;

    if (
      !accessToken ||
      accessToken === "guest-playground-token" ||
      accessToken === "guest-playground-user" ||
      accessToken === "guest" ||
      accessToken === "demo-token"
    ) {
      verified = {
        userId: "guest-playground-user",
        email: "guest@shothik.ai",
        name: "Guest Playground User",
      };
    } else {
      verified = await verifyAccessToken(accessToken);
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Invalid or expired access token" },
        { status: 401 }
      );
    }

    const convexToken = await mintConvexUserToken({
      _id: verified.userId,
      email: verified.email,
      name: verified.name,
    });

    return NextResponse.json({ token: convexToken });
  } catch (error: any) {
    logger.error("Convex token exchange error:", error.message);
    return NextResponse.json(
      { error: "Token exchange failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
