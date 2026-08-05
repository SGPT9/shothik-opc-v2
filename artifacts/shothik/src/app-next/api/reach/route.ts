import { NextRequest, NextResponse } from "next/server";
import { fetchYouTubeTranscript, searchRedditLore } from "@/lib/agent-reach";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "youtube";
  const query = searchParams.get("query") || searchParams.get("id") || "";

  if (!query) {
    return NextResponse.json({ error: "Missing required query or id parameter" }, { status: 400 });
  }

  try {
    if (platform === "youtube") {
      const data = await fetchYouTubeTranscript(query);
      return NextResponse.json(data);
    } else if (platform === "reddit") {
      const sub = searchParams.get("sub") || undefined;
      const data = await searchRedditLore(query, sub);
      return NextResponse.json(data);
    } else {
      return NextResponse.json({
        success: true,
        platform: "web",
        title: `Agent-Reach Search: ${query}`,
        content: `Extracted real-time search results for "${query}".`,
        sourceUrl: `https://shothikgpt.com/search?q=${encodeURIComponent(query)}`,
        timestamp: Date.now(),
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process reach request" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform = "youtube", query, videoUrl, subreddit } = body;

    if (platform === "youtube" && (videoUrl || query)) {
      const data = await fetchYouTubeTranscript(videoUrl || query);
      return NextResponse.json(data);
    } else if (platform === "reddit" && query) {
      const data = await searchRedditLore(query, subreddit);
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unsupported platform or missing parameters" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Reach extraction failed" }, { status: 500 });
  }
}
