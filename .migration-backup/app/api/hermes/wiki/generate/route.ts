import { NextRequest } from "next/server";
import { generateOpenWikiMemory } from "@/lib/hermes/openwiki-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, notes } = body;

    if (!topic) {
      return Response.json({ error: "topic field is required" }, { status: 400 });
    }

    const wiki = await generateOpenWikiMemory(topic, notes || []);
    return Response.json({ data: wiki, success: true });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to generate OpenWiki memory" },
      { status: 500 }
    );
  }
}
