import { NextRequest, NextResponse } from "next/server";
import { getHermesDatabase } from "../../../../lib/hermes/infra/db";
import { z } from "zod";

const CreateSessionSchema = z.object({
  workspaceId: z.string({ required_error: "workspaceId is required" }),
  title: z.string().default("New Hermes Session"),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = CreateSessionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid session request payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { workspaceId, title, description, settings } = parseResult.data;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const session = await getHermesDatabase().createSession({
      id: sessionId,
      workspaceId,
      title,
      description,
      settings,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to create session", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
