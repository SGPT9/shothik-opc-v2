import { describe, it, expect } from "vitest";
import { KnowledgeWatcher } from "../KnowledgeWatcher";
import { SecondMeCognitiveMemory } from "../../memory/second-me-cognitive-memory";

describe("KnowledgeWatcher Continuous Knowledge Ingestion Pipeline", () => {
  it("classifies, chunks, and indexes a markdown document into cognitive memory", async () => {
    const memory = new SecondMeCognitiveMemory();
    const watcher = new KnowledgeWatcher(memory);

    const doc = {
      filename: "architecture-brief.md",
      title: "Shothik Architecture Brief",
      rawText: `# Introduction
Shothik is an AI BaaS platform for emerging markets.

## Core Features
1. Instant F-Commerce storefronts with bKash and Nagad payment automation.
2. Low-spec 2GB RAM device optimization with sub-48MB memory footprint.

## Security Governance
Protected by PostgreSQL Row-Level Security policies and Ephemeral MicroVM sandboxing.`,
      epistemicTier: "tier_1_official" as const,
    };

    const result = await watcher.ingestDocument(doc);
    expect(result.success).toBe(true);
    expect(result.chunks.length).toBeGreaterThan(0);

    // Verify search in memory returns indexed chunks
    const searchResults = memory.searchSemanticMemory("bKash payment automation", 2);
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].documentTitle).toBe("Shothik Architecture Brief");

    // Verify metrics
    const metrics = watcher.getMetrics();
    expect(metrics.totalDocuments).toBe(1);
    expect(metrics.totalChunks).toBe(result.chunks.length);
    expect(metrics.categories["document"]).toBe(1);
  });

  it("scrubs secrets and sensitive API tokens before memory indexing", async () => {
    const memory = new SecondMeCognitiveMemory();
    const watcher = new KnowledgeWatcher(memory);

    const doc = {
      filename: "config-sample.md",
      rawText: `# API Credentials
Use the token: ghp_123456789012345678901234567890123456
OpenAI Key: sk-abcdefghijklmnopqrstuvwxyz1234567890123456789012
Bearer Token: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`,
    };

    const result = await watcher.ingestDocument(doc);
    expect(result.success).toBe(true);

    const searchResults = memory.searchSemanticMemory("API Credentials", 1);
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].text).not.toContain("ghp_1234567890");
    expect(searchResults[0].text).not.toContain("sk-abcdefghijkl");
    expect(searchResults[0].text).toContain("••••••••");
  });

  it("rejects executable and dangerous files with Magika pre-validation", async () => {
    const watcher = new KnowledgeWatcher();

    const result = await watcher.ingestDocument({
      filename: "malware.exe",
      rawText: "binary contents",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("blocked file type");

    const metrics = watcher.getMetrics();
    expect(metrics.failedCount).toBe(1);
  });

  it("emits real-time observer events to subscribers", async () => {
    const watcher = new KnowledgeWatcher();
    const eventLog: string[] = [];

    const unsubscribe = watcher.subscribe((evt) => {
      eventLog.push(evt.eventType);
    });

    await watcher.ingestDocument({
      filename: "product-roadmap.md",
      rawText: "# Product Roadmap\nTarget launch Q3 2026.",
    });

    expect(eventLog).toContain("ingestion_started");
    expect(eventLog).toContain("file_classified");
    expect(eventLog).toContain("chunks_generated");
    expect(eventLog).toContain("indexed_to_memory");

    unsubscribe();
  });

  it("handles batch ingestion of multiple documents", async () => {
    const watcher = new KnowledgeWatcher();

    const batch = [
      { filename: "doc1.md", rawText: "Content of document 1" },
      { filename: "doc2.ts", rawText: "export const config = { port: 3000 };" },
      { filename: "bad.sh", rawText: "rm -rf /" },
    ];

    const result = await watcher.batchIngest(batch);
    expect(result.totalProcessed).toBe(3);
    expect(result.successful).toBe(2);
    expect(result.failed).toBe(1);

    const metrics = watcher.getMetrics();
    expect(metrics.totalDocuments).toBe(2);
    expect(metrics.failedCount).toBe(1);
  });
});
