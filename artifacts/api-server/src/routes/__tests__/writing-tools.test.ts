import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Multilingual NLP Writing Tools Suite (/api/v1/nlp/*)", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("POST /api/v1/nlp/grammar:check detects Bangla spelling & Sadhu-Cholit issues", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nlp/grammar:check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "আমি শ্রদ্ধাঞ্জলী নিবেদন করিব এবং পুরষ্কার গ্রহণ করিব।",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.language).toBe("bn");
    expect(json.data.totalIssues).toBeGreaterThanOrEqual(3);
    expect(json.data.correctedText).toContain("শ্রদ্ধাঞ্জলি");
    expect(json.data.correctedText).toContain("পুরস্কার");
    expect(json.data.correctedText).toContain("করব");
  });

  it("POST /api/v1/nlp/grammar:check detects English spelling, agreement, repeated words, and article errors", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nlp/grammar:check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "he have recieve the the package and a apple.",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.totalIssues).toBeGreaterThanOrEqual(4);
    expect(json.data.correctedText.toLowerCase()).toContain("he has");
    expect(json.data.correctedText.toLowerCase()).toContain("receive");
    expect(json.data.correctedText.toLowerCase()).toContain("an apple");
  });

  it("POST /api/v1/nlp/paraphrase generates real mode-aware synonyms and variations", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nlp/paraphrase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "We need a fast system to help analyze important problems.",
        mode: "formal",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.paraphrasedText).not.toBe("We need a fast system to help analyze important problems.");
    expect(json.data.paraphrasedText).not.toContain("In clearer and more concise terms:");
    expect(json.data.variations.length).toBeGreaterThanOrEqual(2);
    const importantTag = json.taggedWords.find((t: any) => t.word === "important");
    expect(importantTag).toBeDefined();
    expect(importantTag.synonyms).toContain("significant");
  });

  it("POST /api/v1/nlp/summarize ranks sentences by TF-IDF centrality and computes real compressionRatio", async () => {
    const input = [
      "Artificial intelligence and natural language processing are transforming software engineering across Bangladesh.",
      "Random filler commentary about the weather yesterday afternoon.",
      "Developers use natural language processing and artificial intelligence to build modern Bengali voice assistants.",
      "Consequently, software engineering teams achieve rapid progress in digital education.",
    ].join(" ");

    const res = await fetch(`${baseUrl}/api/v1/nlp/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, length: "short" }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.keyPoints.length).toBe(1);
    expect(json.data.summary.length).toBeLessThan(input.length);
    expect(json.data.compressionRatio).toMatch(/^\d+%$/);
  });

  it("POST /api/v1/nlp/translate performs bidirectional English <-> Bangla translation instead of echoing input", async () => {
    const enToBnRes = await fetch(`${baseUrl}/api/v1/nlp/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Artificial intelligence and technology help students in Bangladesh.",
        sourceLang: "en",
        targetLang: "bn",
      }),
    });

    expect(enToBnRes.status).toBe(200);
    const enToBn = (await enToBnRes.json()) as any;
    expect(enToBn.success).toBe(true);
    expect(enToBn.translated).not.toBe("Artificial intelligence and technology help students in Bangladesh.");
    expect(enToBn.translated).toContain("কৃত্রিম বুদ্ধিমত্তা");
    expect(enToBn.translated).toContain("বাংলাদেশ");

    const bnToEnRes = await fetch(`${baseUrl}/api/v1/nlp/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "কৃত্রিম বুদ্ধিমত্তা এবং প্রযুক্তি শিক্ষা ও গবেষণা উন্নত করে।",
        sourceLang: "bn",
        targetLang: "en",
      }),
    });

    expect(bnToEnRes.status).toBe(200);
    const bnToEn = (await bnToEnRes.json()) as any;
    expect(bnToEn.success).toBe(true);
    expect(bnToEn.translated.toLowerCase()).toContain("artificial intelligence");
    expect(bnToEn.translated.toLowerCase()).toContain("technology");
  });

  it("POST /api/v1/nlp/ai-detector:check computes dynamic burstiness, perplexity, and watermark density", async () => {
    const aiHeavyText =
      "Furthermore, it is important to note that this comprehensive overview plays a crucial role in modern systems. Moreover, we must delve into the multifaceted tapestry of innovation. In conclusion, this is a testament to progress.";
    const humanVariedText =
      "Wait—why did the server crash at 3 AM? I checked the logs, found a stray null pointer in the auth handler, and patched it before coffee.";

    const [aiRes, humanRes] = await Promise.all([
      fetch(`${baseUrl}/api/v1/nlp/ai-detector:check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiHeavyText }),
      }),
      fetch(`${baseUrl}/api/v1/nlp/ai-detector:check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: humanVariedText }),
      }),
    ]);

    const aiJson = (await aiRes.json()) as any;
    const humanJson = (await humanRes.json()) as any;

    expect(aiJson.success).toBe(true);
    expect(humanJson.success).toBe(true);
    expect(aiJson.data.aiProbability).toBeGreaterThan(humanJson.data.aiProbability);
    expect(aiJson.data.watermarkHits).toBeGreaterThanOrEqual(4);
  });

  it("POST /api/v1/nlp/humanize strips robotic AI transitions in Bangla and English", async () => {
    const res = await fetch(`${baseUrl}/api/v1/nlp/humanize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Furthermore, it is important to note that we utilize modern tools to delve into problems.",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.humanizedText).toContain("Also,");
    expect(json.humanizedText).toContain("Keep in mind that");
    expect(json.humanizedText).toContain("use");
    expect(json.humanizedText).toContain("explore");
  });

  it("POST /api/v1/research/paper/deerflow-slr & /verify execute SLR synthesis and citation-aware rubric scoring", async () => {
    const slrRes = await fetch(`${baseUrl}/api/v1/research/paper/deerflow-slr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: "Bangla Speech Synthesis with OpenVINO",
        fieldOfStudy: "Computer Science & AI",
        scopeCount: 15,
      }),
    });
    expect(slrRes.status).toBe(200);
    const slrJson = (await slrRes.json()) as any;
    expect(slrJson.success).toBe(true);
    expect(slrJson.data.methodology).toBe("DEERFLOW_V2_SLR");
    expect(slrJson.data.themes.length).toBeGreaterThanOrEqual(1);

    const verifyRes = await fetch(`${baseUrl}/api/v1/research/paper/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "Our empirical methodology evaluates baseline variance across the benchmark dataset [1] and confirms the hypothesis (Rahman et al., 2025).",
      }),
    });
    expect(verifyRes.status).toBe(200);
    const verifyJson = (await verifyRes.json()) as any;
    expect(verifyJson.success).toBe(true);
    expect(verifyJson.data.rubricScores.citationCount).toBe(2);
    expect(verifyJson.data.rubricScores.methodologicalRigor).toBeGreaterThanOrEqual(85);
  });

  it("POST /api/v1/tools/sheet-ai streams context-aware spreadsheet formulas over SSE", async () => {
    const res = await fetch(`${baseUrl}/api/v1/tools/sheet-ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Lookup customer ID in column A and match value",
        chatId: "sheet_test_1",
      }),
    });
    expect(res.status).toBe(200);
    const sseText = await res.text();
    expect(sseText).toContain("XLOOKUP");
  });

  it("GET /api/grammar/sections, POST /api/plagiarism/analyze, and GET /api/v1/kyc/ocr/dossiers resolve under /api mount", async () => {
    const [sectionsRes, plagRes, kycRes] = await Promise.all([
      fetch(`${baseUrl}/api/grammar/sections`),
      fetch(`${baseUrl}/api/plagiarism/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Artificial intelligence is transforming modern software engineering and natural language processing.",
        }),
      }),
      fetch(`${baseUrl}/api/v1/kyc/ocr/dossiers`),
    ]);

    expect(sectionsRes.status).toBe(200);
    const sectionsJson = (await sectionsRes.json()) as any;
    expect(sectionsJson.success).toBe(true);
    expect(sectionsJson.total).toBe(7);

    expect(plagRes.status).toBe(200);
    const plagJson = (await plagRes.json()) as any;
    expect(plagJson.success).toBe(true);
    expect(plagJson.similarityPercent).toBeGreaterThanOrEqual(2);

    expect(kycRes.status).toBe(200);
    const kycJson = (await kycRes.json()) as any;
    expect(kycJson.success).toBe(true);
    expect(Array.isArray(kycJson.dossiers)).toBe(true);
  });
});
