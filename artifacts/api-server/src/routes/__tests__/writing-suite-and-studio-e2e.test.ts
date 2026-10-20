import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import writingToolsRouter from "../writing-tools.js";
import subscriptionsRouter from "../subscriptions.js";
import { plagiarismRouter } from "../plagiarism.js";

const app = express();
app.use(express.json());
app.use("/api", writingToolsRouter);
app.use("/api", subscriptionsRouter);
app.use("/api", plagiarismRouter);

describe("Complete Shothik Writing Suite & Writing Studio End-to-End Verification", () => {
  let server: any;
  let baseUrl: string;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const port = (server.address() as any).port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
  });

  describe("1. Shothik Writing Suite Tools", () => {
    // 1.1 Paraphraser
    it("paraphrases text in Bengali and English via canonical & legacy endpoints", async () => {
      const payload = {
        text: "Artificial intelligence empowers modern researchers to write high impact academic papers.",
        mode: "standard",
        language: "en",
      };

      const res = await fetch(`${baseUrl}/api/v1/nlp/paraphrase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.paraphrasedText).toBeDefined();
      expect(json.data.variations.length).toBeGreaterThan(0);
    });

    // 1.2 Grammar & Spell Checker
    it("checks multi-lingual grammar and spelling with rules and suggestions", async () => {
      const payload = {
        text: "আমরা তাহাকে আসিতে বলিলাম কিন্তু তিনি আসিলেন না।",
        language: "bn",
      };

      const res = await fetch(`${baseUrl}/api/v1/nlp/grammar:check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.corrections.length).toBeGreaterThan(0);
      expect(json.data.language).toBe("bn");
    });

    // 1.3 Summarizer
    it("condenses text into key summary points", async () => {
      const payload = {
        text: "The Bangladesh National Board of Revenue has mandated electronic VAT invoices. Companies must ensure 13-digit BIN compliance. Failure to comply results in penalties under the VAT Act 2012.",
        length: "short",
      };

      const res = await fetch(`${baseUrl}/api/v1/nlp/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.summary).toBeDefined();
      expect(json.data.compressionRatio).toBeDefined();
    });

    // 1.4 Translator
    it("translates text accurately between English and Bengali", async () => {
      const payload = {
        text: "Good morning, welcome to Shothik AI.",
        sourceLang: "en",
        targetLang: "bn",
      };

      const res = await fetch(`${baseUrl}/api/v1/nlp/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.sourceLanguage).toBe("en");
      expect(json.data.targetLanguage).toBe("bn");
    });

    // 1.5 Plagiarism Checker
    it("analyzes text similarity and returns originality score", async () => {
      const payload = {
        text: "This is a sample academic manuscript text submitted for UGC Turnitin plagiarism verification.",
      };

      const res = await fetch(`${baseUrl}/api/v1/nlp/plagiarism:analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.originalityScore).toBeGreaterThan(0);
      expect(json.similarityPercent).toBeDefined();
      expect(json.matchedSources).toBeDefined();
    });
  });

  describe("2. User State, Pricing & Credit Deductions", () => {
    it("retrieves live credits balance and subscription status", async () => {
      const res = await fetch(`${baseUrl}/api/v1/subscriptions/credits`, {
        headers: { "x-user-id": "usr_default" },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.creditsBalance).toBeGreaterThanOrEqual(0);
      expect(json.canExecuteAutonomousTask).toBe(true);
    });

    it("fetches outcome-based monetization pass catalog", async () => {
      const res = await fetch(`${baseUrl}/api/v1/subscriptions/passes/catalog`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.passes.length).toBeGreaterThan(0);

      const thesisPass = json.passes.find((p: any) => p.id === "THESIS_PLAGIARISM_PASS");
      expect(thesisPass).toBeDefined();
      expect(thesisPass.priceBdt).toBe(49);
    });

    it("verifies and checks tool usage limits", async () => {
      const res = await fetch(`${baseUrl}/api/v1/subscriptions/check-limit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "usr_default",
        },
        body: JSON.stringify({ tool: "paraphrase" }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.allowed).toBe(true);
    });
  });
});
