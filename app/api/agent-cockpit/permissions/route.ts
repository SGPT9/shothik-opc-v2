import { NextResponse } from "next/server";

export interface SecurityRule {
  id: string;
  capability: string;
  description: string;
  mode: "auto-approve" | "prompt-user" | "block";
  riskLevel: "low" | "medium" | "high" | "critical";
}

const mockRules: SecurityRule[] = [
  {
    id: "web-search",
    capability: "Web Search & Academic Queries",
    description: "Search search engines, OpenSearch-VL, arXiv, and PubMed.",
    mode: "auto-approve",
    riskLevel: "low",
  },
  {
    id: "file-read",
    capability: "Workspace Local File Read",
    description: "Read code files, markdown docs, and configuration files.",
    mode: "auto-approve",
    riskLevel: "low",
  },
  {
    id: "file-modify",
    capability: "Workspace File Modifications",
    description: "Write, update, or edit code and asset files on disk.",
    mode: "prompt-user",
    riskLevel: "medium",
  },
  {
    id: "headless-browser",
    capability: "Headless Browser Automation",
    description: "Automate browser interactions via Playwright workers.",
    mode: "prompt-user",
    riskLevel: "high",
  },
  {
    id: "payment-billing",
    capability: "Payments & Financial Operations",
    description: "Trigger Stripe, Razorpay, or bKash checkout/payout flows.",
    mode: "block",
    riskLevel: "critical",
  },
];

let rulesState = [...mockRules];

export async function GET() {
  return NextResponse.json({
    success: true,
    rules: rulesState,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, mode } = body;

    if (!id || !["auto-approve", "prompt-user", "block"].includes(mode)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    rulesState = rulesState.map((rule) => (rule.id === id ? { ...rule, mode } : rule));

    return NextResponse.json({
      success: true,
      rules: rulesState,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
