import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { createServer, type Server } from "node:http";
import publishingRouter from "../routes/publishing.js";
import {
  INKOS_TOOLS,
  INKOS_PILLARS,
  recommendInkOsToolsForChat,
  detectAmbientCoPilotWhisper,
} from "../../../shothik/src/components/writing-studio/config/inkos-tool-catalog.js";

describe("Publishing Compatibility Routes & Conversational InkOS UX Engine", () => {
  let server: Server;
  let baseUrl = "";

  beforeAll(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api", publishingRouter);
    server = createServer(app);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
    const addr = server.address() as { port: number };
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("exposes all 45+ InkOS Studio tools across 5 pillars with slash commands", () => {
    expect(INKOS_PILLARS.length).toBe(6); // 'all' + 5 pillars
    expect(INKOS_TOOLS.length).toBeGreaterThanOrEqual(45);
    const slashCommands = new Set(INKOS_TOOLS.map((t) => t.slashCommand));
    expect(slashCommands.has("/deslop")).toBe(true);
    expect(slashCommands.has("/dialect")).toBe(true);
    expect(slashCommands.has("/duet")).toBe(true);
    expect(slashCommands.has("/chrono")).toBe(true);
    expect(slashCommands.has("/preflight")).toBe(true);
  });

  it("recommends dialogue & dialect tools when user chats about character conversation", () => {
    const recs = recommendInkOsToolsForChat(
      "Help me write a tense dialogue between Himu and OC Rafiq",
      "Here is their conversation in Old Dhaka...",
      "<p>Himu smiled.</p>"
    );
    expect(recs).toHaveLength(3);
    const ids = recs.map((r) => r.tool.id);
    expect(ids).toContain("character-duet");
    expect(ids).toContain("dialect-transpiler");
    expect(ids).toContain("voice-casting");
  });

  it("recommends 1971 Chrono-Braider & Spatial GPS when chatting about historical timelines", () => {
    const recs = recommendInkOsToolsForChat(
      "Check my 1971 flashback in Dhaka",
      "In 1971, the timeline aligns with...",
      "<p>Chapter 3</p>"
    );
    const ids = recs.map((r) => r.tool.id);
    expect(ids).toContain("chrono-braider");
    expect(ids).toContain("spatial-gps");
  });

  it("detects ambient Co-Pilot whispers based on manuscript state", () => {
    const openingWhisper = detectAmbientCoPilotWhisper("<p>Short start.</p>");
    expect(openingWhisper?.id).toBe("whisper-opening");

    const dialogueWhisper = detectAmbientCoPilotWhisper(
      `<p>${Array(60).fill("word").join(" ")} “Hello” “World” “How” “Are” “You” “Today” “Friend” “Now” “Here”</p>`
    );
    expect(dialogueWhisper?.id).toBe("whisper-dialogue");
  });

  it("serves compatibility endpoints for Stripe Connect, Book Export, Publish Status, and bKash/Courier", async () => {
    const stripeRes = await fetch(`${baseUrl}/api/stripe/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "usr_123", email: "author@shothik.ai" }),
    });
    expect(stripeRes.status).toBe(200);
    const stripeJson: any = await stripeRes.json();
    expect(stripeJson.success).toBe(true);
    expect(stripeJson.accountId).toContain("acct_shothik_");

    const validateRes = await fetch(`${baseUrl}/api/books/export/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Amar Ekushey", content: "Sample words ".repeat(60), format: "epub" }),
    });
    expect(validateRes.status).toBe(200);
    const validateJson: any = await validateRes.json();
    expect(validateJson.valid).toBe(true);

    const convertRes = await fetch(`${baseUrl}/api/books/export/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Amar Ekushey", format: "pdf" }),
    });
    expect(convertRes.status).toBe(200);
    const convertJson: any = await convertRes.json();
    expect(convertJson.fileName).toBe("amar-ekushey.pdf");

    const bkashRes = await fetch(`${baseUrl}/api/bkash/inspect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleText: "bKash TrxID 9K82LM1P Amount 990 BDT" }),
    });
    expect(bkashRes.status).toBe(200);
    const bkashJson: any = await bkashRes.json();
    expect(bkashJson.isGenuine).toBe(true);
    expect(bkashJson.trxId).toBe("9K82LM1P");
  });
});
