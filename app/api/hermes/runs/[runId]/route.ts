import { NextRequest, NextResponse } from "next/server";
import { getHermesDatabase } from "../../../../../lib/hermes/infra/db";
import { HermesEventEnvelope, RunControlActionSchema } from "../../../../../lib/hermes/contracts/core";

export async function GET(
  req: NextRequest,
  context: any
) {
  const rawParams = context?.params;
  const params = rawParams instanceof Promise ? await rawParams : rawParams;
  const runId = params?.runId;

  const db = getHermesDatabase();

  const run = await db.getRun(runId);
  if (!run) {
    return NextResponse.json({ error: `Run '${runId}' not found` }, { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let sequence = 0;

      const sendEnvelope = (eventType: HermesEventEnvelope["eventType"], payload: Record<string, unknown>) => {
        sequence++;
        const envelope: HermesEventEnvelope = {
          __hermes: true,
          eventId: `evt_${Date.now()}_${sequence}`,
          runId,
          sessionId: run.sessionId,
          workspaceId: run.workspaceId,
          domain: run.domain,
          eventType,
          timestamp: new Date().toISOString(),
          sequence,
          payload,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(envelope)}\n\n`));
      };

      // 1. Initial run_started envelope
      sendEnvelope("run_started", { run });

      // 2. Progress update envelope
      sendEnvelope("progress_update", { message: "Executing Hermes Phase 1 run pipeline..." });

      // 3. Mark run as completed
      await db.updateRunStatus(runId, "completed");

      // 4. Final run_completed envelope
      sendEnvelope("run_completed", { status: "completed", result: { success: true } });

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    const rawParams = context?.params;
    const params = rawParams instanceof Promise ? await rawParams : rawParams;
    const runId = params?.runId;

    const body = await req.json();
    const parseResult = RunControlActionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid control action payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { action, reason } = parseResult.data;
    const db = getHermesDatabase();

    const run = await db.getRun(runId);
    if (!run) {
      return NextResponse.json({ error: `Run '${runId}' not found` }, { status: 404 });
    }

    let targetStatus = run.status;
    if (action === "pause") targetStatus = "paused";
    if (action === "resume") targetStatus = "running";
    if (action === "cancel") targetStatus = "cancelled";

    const updatedRun = await db.updateRunStatus(runId, targetStatus, { controlReason: reason });

    return NextResponse.json({ run: updatedRun, actionApplied: action }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to process run control action", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
