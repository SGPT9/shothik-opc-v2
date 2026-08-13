import { NextRequest, NextResponse } from "next/server";
import { getHermesDatabase } from "../../../../../lib/hermes/infra/db";

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const rawParams = context?.params;
    const params = rawParams instanceof Promise ? await rawParams : rawParams;
    const sessionId = params?.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const session = await getHermesDatabase().getSession(sessionId);

    if (!session) {
      return NextResponse.json({ error: `Session '${sessionId}' not found` }, { status: 404 });
    }

    return NextResponse.json({ session }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch session", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
