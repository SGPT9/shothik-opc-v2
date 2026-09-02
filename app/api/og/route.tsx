import { ImageResponse } from "@vercel/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";

/**
 * GET /api/og?title=...&category=...&author=...
 * Dynamic OpenGraph & Twitter Card Generator for Viral Social Sharing
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "ShothikGPT — Autonomous AI Operating Platform";
    const category = searchParams.get("category") || "DeepMind & OpenAI Orchestration";
    const author = searchParams.get("author") || "Shothik Platform";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#09090b",
            backgroundImage: "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)",
            backgroundSize: "100px 100px",
            padding: "80px",
            fontFamily: "sans-serif",
          }}
        >
          {/* Top Brand Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 24px",
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: "9999px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <span
              style={{
                color: "#10b981",
                fontSize: "20px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </span>
          </div>

          {/* Center Main Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "1000px",
            }}
          >
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 800,
                color: "#f4f4f5",
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                fontSize: "24px",
                color: "#a1a1aa",
                margin: 0,
              }}
            >
              Created with ShothikGPT • 68 Subagents, 286 ECC Skills & bKash Economy
            </p>
          </div>

          {/* Bottom Footer Details */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
            }}
          >
            <span
              style={{
                color: "#71717a",
                fontSize: "20px",
              }}
            >
              Author: {author}
            </span>
            <span
              style={{
                color: "#10b981",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              shothik-web-mirror-v2.vercel.app
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (err: any) {
    return new Response(`Failed to generate OG Image: ${err.message}`, { status: 500 });
  }
}
