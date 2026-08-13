import { NextRequest, NextResponse } from "next/server";
import { getHermesDatabase } from "../../../../lib/hermes/infra/db";
import { z } from "zod";

const CreateRunSchema = z.object({
  sessionId: z.string({ required_error: "sessionId is required" }),
  workspaceId: z.string({ required_error: "workspaceId is required" }),
  domain: z.string().default("general"),
  config: z.record(z.unknown()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateRunSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid run creation payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, workspaceId, domain, config, metadata } = parseResult.data;
    const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const db = getHermesDatabase();

    // Verify session exists
    const session = await db.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: `Session '${sessionId}' does not exist` },
        { status: 404 }
      );
    }

    const run = await db.createRun({
      id: runId,
      sessionId,
      workspaceId,
      domain,
      config,
      metadata,
    });

    const origin = req.nextUrl.origin;
    const streamUrl = `${origin}/api/hermes/runs/${runId}`;

    return NextResponse.json({ run, streamUrl }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create run", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
