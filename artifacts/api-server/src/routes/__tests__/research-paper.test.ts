import { describe, it, expect, beforeAll, afterAll } from "vitest";
import express from "express";
import { researchPaperRouter } from "../research-paper.js";
import { AutoResearchBridge } from "../../lib/academic/auto-research-bridge.js";

const app = express();
app.use(express.json());
app.use("/api", researchPaperRouter);

describe("AutoResearchClaw Academic Research Paper Engine Integration", () => {
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

  describe("AutoResearchBridge Unit Methods", () => {
    it("generates full research paper draft with sections and BibTeX citations", () => {
      const result = AutoResearchBridge.generatePaperDraft({
        title: "Autonomous Agentic Operating Systems for Vernacular South Asian Commerce",
        topic: "Low-latency speculative routing and Banglish conversational agents",
        fieldOfStudy: "Computer Science & AI",
        targetFormat: "IEEE",
        methodologyType: "EMPIRICAL_BENCHMARK",
        keywords: ["Agentic OS", "Speculative Routing", "Vernacular NLP", "bKash Commerce"],
      });

      expect(result.paperId).toBeDefined();
      expect(result.title).toContain("Autonomous Agentic Operating Systems");
      expect(result.abstract).toBeDefined();
      expect(result.sections.length).toBe(6);
      expect(result.bibtexEntries.length).toBeGreaterThan(0);
      expect(result.qualityScore.overallRubricScore).toBeGreaterThanOrEqual(90);
      expect(result.sha256VerificationHash).toBeDefined();
      expect(result.sha256VerificationHash.length).toBe(64);
    });

    it("exports generated research paper to Overleaf-ready LaTeX format", () => {
      const paper = AutoResearchBridge.generatePaperDraft({
        title: "Evaluation of Speculative Decoding in Resource-Constrained Environments",
        topic: "Speculative Decoding on Intel Arc GPUs",
        fieldOfStudy: "Computer Science",
        targetFormat: "IEEE",
      });

      const latex = AutoResearchBridge.exportToLatex(paper);
      expect(latex).toContain("\\documentclass[conference]{IEEEtran}");
      expect(latex).toContain("\\begin{document}");
      expect(latex).toContain("\\begin{abstract}");
      expect(latex).toContain("\\section{Introduction}");
      expect(latex).toContain("\\bibliographystyle{IEEEtran}");
    });
  });

  describe("API Endpoints", () => {
    it("GET /api/v1/research/paper/formats returns supported academic formats", async () => {
      const res = await fetch(`${baseUrl}/api/v1/research/paper/formats`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.formats.length).toBeGreaterThanOrEqual(5);

      const ugc = json.data.formats.find((f: any) => f.id === "UGC_BANGLADESH");
      expect(ugc).toBeDefined();
      expect(ugc.popularIn).toContain("BUET");
    });

    it("POST /api/v1/research/paper/generate produces complete draft", async () => {
      const res = await fetch(`${baseUrl}/api/v1/research/paper/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Empirical Analysis of MFS Cash Settlement Latency in Bangladesh",
          topic: "bKash and Nagad API Clearing Pipelines",
          fieldOfStudy: "FinTech & Distributed Systems",
          targetFormat: "APA_7TH",
          methodologyType: "QUANTITATIVE",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.sections.length).toBe(6);
      expect(json.data.qualityScore.originality).toBeGreaterThan(90);
    });

    it("POST /api/v1/research/paper/generate with useDeerFlowSlr attaches DeerFlow 2.0 metadata", async () => {
      const res = await fetch(`${baseUrl}/api/v1/research/paper/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Cryptographic Capability Leashes in South Asian Autonomous Agent Swarms",
          topic: "HMAC Capability Tokens in Distributed Commerce",
          fieldOfStudy: "Computer Science & Cryptography",
          targetFormat: "IEEE",
          useDeerFlowSlr: true,
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.deerflowMeta).toBeDefined();
      expect(json.data.deerflowMeta.poweredBy).toBe("DeerFlow 2.0 Super Agent");
      expect(json.data.deerflowMeta.slrSkill).toBe("systematic-literature-review");
    });

    it("POST /api/v1/research/paper/deerflow-slr generates structured multi-paper literature review", async () => {
      const res = await fetch(`${baseUrl}/api/v1/research/paper/deerflow-slr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "Speculative Decoding and Edge-first Vector Search",
          fieldOfStudy: "Distributed Systems & Machine Learning",
          scopeCount: 25,
          citationFormat: "IEEE",
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.reviewId).toMatch(/^SLR-/);
      expect(json.data.methodology).toBe("DEERFLOW_V2_SLR");
      expect(json.data.scopeCount).toBe(25);
      expect(json.data.themes.length).toBeGreaterThan(0);
      expect(json.data.annotatedBibliography.length).toBeGreaterThan(0);
      expect(json.data.sha256VerificationHash).toBeDefined();
    });

    it("POST /api/v1/research/paper/verify evaluates paper rubric scores", async () => {
      const sampleText = "We present a comprehensive evaluation of autonomous multi-agent systems in e-commerce fulfillment across Dhaka micro-hubs. Our methodology combines empirical latency measurements with stochastic load balancing.";

      const res = await fetch(`${baseUrl}/api/v1/research/paper/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sampleText }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.rubricScores.overallRecommendation).toBe("ACCEPT_WITH_MINOR_REVISION");
      expect(json.data.turnitinSimilarityEstimate).toContain("UGC Approved");
    });
  });
});
