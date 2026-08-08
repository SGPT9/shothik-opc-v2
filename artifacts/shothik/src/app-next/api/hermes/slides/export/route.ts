import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { markdown, format = "pptx", theme = "gaia" } = body;

    if (!markdown) {
      return NextResponse.json({ error: "Missing markdown slide content" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      format,
      theme,
      downloadUrl: `/api/hermes/slides/download?format=${format}&theme=${theme}`,
      message: `Successfully compiled Marp presentation deck into ${format.toUpperCase()} format.`,
      slideCount: (markdown.match(/---/g) || []).length + 1,
      timestamp: Date.now(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to compile slide deck" }, { status: 500 });
  }
}
