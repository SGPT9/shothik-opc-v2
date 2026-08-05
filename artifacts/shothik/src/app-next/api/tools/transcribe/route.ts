import { NextRequest } from "next/server";
import { transcribeBuzzAudio } from "@/lib/hermes/buzz-whisper-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioBase64, language, task } = body;

    if (!audioBase64) {
      return Response.json({ error: "audioBase64 field is required" }, { status: 400 });
    }

    const result = await transcribeBuzzAudio(audioBase64, { language, task });
    return Response.json({ data: result, success: true });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
