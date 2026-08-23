import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import fs from "fs";
import path from "path";
import app from "../../app.js";
import { MemoriSemanticMemoryStore } from "../../lib/semantic-memory.js";

describe("Memori Semantic Memory Adapter & API Suite", () => {
  const testStorePath = path.join(process.cwd(), "test-memori-store.json");
  let testMemoryStore: MemoriSemanticMemoryStore;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    if (fs.existsSync(testStorePath)) {
      fs.unlinkSync(testStorePath);
    }
    testMemoryStore = new MemoriSemanticMemoryStore(testStorePath);

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (fs.existsSync(testStorePath)) {
      fs.unlinkSync(testStorePath);
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("memorizes user facts and extracts meaningful keywords", async () => {
    const memory = await testMemoryStore.memorize(
      "usr_test_101",
      "I am building a high-frequency trading bot on Celestia and Monad using Rust",
      "project_context",
      { framework: "rust" }
    );

    expect(memory.id).toMatch(/^mem_/);
    expect(memory.userId).toBe("usr_test_101");
    expect(memory.category).toBe("project_context");
    expect(memory.keywords).toContain("celestia");
    expect(memory.keywords).toContain("monad");
    expect(memory.keywords).toContain("rust");
  });

  it("recalls relevant memories based on semantic keyword overlap and prompt context", async () => {
    await testMemoryStore.memorize(
      "usr_test_102",
      "Prefers responses in concise technical English with Markdown tables",
      "style"
    );
    await testMemoryStore.memorize(
      "usr_test_102",
      "Company name is Dhaka Logistics and primary courier is Steadfast",
      "fact"
    );
    await testMemoryStore.memorize(
      "usr_test_102",
      "Interested in buying electric bicycles in Sylhet",
      "preference"
    );

    const recall = await testMemoryStore.recall(
      "usr_test_102",
      "Can you draft an invoice for Dhaka Logistics and dispatch on Steadfast?"
    );

    expect(recall.memories.length).toBeGreaterThan(0);
    expect(recall.memories[0].content).toContain("Dhaka Logistics");
    expect(recall.injectedPromptFragment).toContain("<user_semantic_memory>");
    expect(recall.injectedPromptFragment).toContain("Dhaka Logistics");
  });

  it("handles POST /api/memory/memorize via HTTP API", async () => {
    const res = await fetch(`${baseUrl}/api/memory/memorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_api_201",
        content: "Always use bKash tokenized checkout for payments",
        category: "preference",
      }),
    });

    expect(res.status).toBe(201);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.memory.content).toBe("Always use bKash tokenized checkout for payments");
  });

  it("handles POST /api/memory/recall and returns semantic matches", async () => {
    // Seed a memory first
    await fetch(`${baseUrl}/api/memory/memorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_api_202",
        content: "Primary warehouse is located in Uttara Sector 4, Dhaka",
        category: "fact",
      }),
    });

    const res = await fetch(`${baseUrl}/api/memory/recall`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_api_202",
        query: "What is my Uttara warehouse address?",
      }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.success).toBe(true);
    expect(json.data.memories.length).toBeGreaterThan(0);
    expect(json.data.memories[0].content).toContain("Uttara Sector 4");
    expect(json.data.injectedPromptFragment).toContain("Uttara Sector 4");
  });

  it("lists and deletes memories via HTTP API", async () => {
    const memRes = await fetch(`${baseUrl}/api/memory/memorize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "usr_api_203",
        content: "Temporary note to be deleted",
        category: "correction",
      }),
    });
    const memJson = (await memRes.json()) as any;
    const memoryId = memJson.memory.id;

    const listRes = await fetch(`${baseUrl}/api/memory/usr_api_203`);
    expect(listRes.status).toBe(200);
    const listJson = (await listRes.json()) as any;
    expect(listJson.count).toBe(1);

    const delRes = await fetch(`${baseUrl}/api/memory/usr_api_203/${memoryId}`, {
      method: "DELETE",
    });
    expect(delRes.status).toBe(200);
    const delJson = (await delRes.json()) as any;
    expect(delJson.success).toBe(true);

    const listAfterDel = await fetch(`${baseUrl}/api/memory/usr_api_203`);
    const listAfterJson = (await listAfterDel.json()) as any;
    expect(listAfterJson.count).toBe(0);
  });
});
