import { NextRequest, NextResponse } from "next/server";
import { verifyAuthToken } from "./api-middleware";

const ANON_LIMITS: Record<string, number> = {
  chat: 15,
  plagiarism: 2,
  "ai-detector": 2,
  paraphrase: 3,
  grammar: 5,
  humanize: 2,
  summarize: 3,
  translator: 5,
};

const anonUsageMap = new Map<string, { count: number; resetAt: number }>();

function checkAnonymousLimit(
  req: NextRequest,
  toolName: string,
): { allowed: boolean } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const key = `${ip}:${toolName}`;
  const limit = ANON_LIMITS[toolName] ?? 3;
  const now = Date.now();
  const windowMs = 24 * 60 * 60 * 1000;

  const entry = anonUsageMap.get(key);
  if (!entry || now >= entry.resetAt) {
    anonUsageMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return { allowed: false };
  }

  entry.count += 1;
  return { allowed: true };
}

function getBaseApiUrl(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
}

export async function enforceUsageLimit(
  req: NextRequest,
  toolName: string,
): Promise<{ allowed: boolean; userId: string | null; tier?: string; response?: NextResponse }> {
  const user = await verifyAuthToken(req);
  const userId = user?.userId || null;

  if (!userId) {
    const anonCheck = checkAnonymousLimit(req, toolName);
    if (!anonCheck.allowed) {
      return {
        allowed: false,
        userId: null,
        response: NextResponse.json(
          {
            error: "Usage limit reached",
            errorCode: "RATE_LIMITED",
            message: "Usage limit reached. Sign up for more free usage or upgrade your plan.",
            tier: "anonymous",
            upgradeUrl: "/account/billing",
          },
          { status: 429 },
        ),
      };
    }
    return { allowed: true, userId: null, tier: "anonymous" };
  }

  try {
    const res = await fetch(`${getBaseApiUrl()}/api/v1/subscriptions/check-limit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ userId, tool: toolName }),
    });

    if (!res.ok) {
      // Allow graceful fallback if service is starting up
      return { allowed: true, userId, tier: "free" };
    }

    const result = await res.json();

    if (result.success && !result.allowed) {
      return {
        allowed: false,
        userId,
        tier: result.tier,
        response: NextResponse.json(
          {
            error: "Usage limit reached",
            errorCode: "USAGE_EXCEEDED",
            message: `You've reached your ${result.tier} plan limit (${result.used}/${result.limit}). Upgrade your plan for more usage.`,
            tier: result.tier,
            used: result.used,
            limit: result.limit,
            upgradeUrl: "/account/billing",
          },
          { status: 429 },
        ),
      };
    }

    return { allowed: true, userId, tier: result.tier ?? "free" };
  } catch {
    // Fail open gracefully in development or offline mode
    return { allowed: true, userId, tier: "free" };
  }
}

export async function recordToolUsage(
  userId: string,
  toolName: string,
): Promise<void> {
  try {
    await fetch(`${getBaseApiUrl()}/api/v1/subscriptions/increment-usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
      },
      body: JSON.stringify({ userId, tool: toolName }),
    });
  } catch {
    // Usage tracking failure should not block tool execution
  }
}
