import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app";

describe("Demography-Aware API Gateway Routes", () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  async function post(path: string, body: unknown) {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { status: res.status, body: json };
  }

  describe("POST /api/v1/mfs/verify-trx", () => {
    it("successfully verifies a valid 10-digit bKash TrxID and credits the wallet", async () => {
      const payload = {
        trxId: "BK99281729",
        provider: "bkash",
        senderMobileNumber: "01712345678",
        tier: "micro_100_bdt",
        amountBdt: 100,
        userId: "usr_test_101",
      };

      const { status, body } = await post("/api/v1/mfs/verify-trx", payload);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.status).toBe("verified");
      expect(body.creditedAmount).toBe(80);
      expect(body.newBalance).toBe(630);
      expect(body.ledgerId).toContain("LEDGER_BKASH_BK99281729");
    });

    it("rejects payments where amount is less than the tier price", async () => {
      const payload = {
        trxId: "BK99281730",
        provider: "bkash",
        senderMobileNumber: "01712345678",
        tier: "student_350_bdt",
        amountBdt: 50, // Less than 350 BDT
        userId: "usr_test_102",
      };

      const { status, body } = await post("/api/v1/mfs/verify-trx", payload);

      expect(status).toBe(400);
      expect(body.status).toBe("invalid_amount");
      expect(body.creditedAmount).toBe(0);
    });
  });

  describe("POST /api/v1/logistics/steadfast/book", () => {
    it("generates Steadfast consignment and tracking URL for Dhaka delivery", async () => {
      const payload = {
        provider: "steadfast",
        order: {
          source: "whatsapp_dm",
          customerName: "Rahim Chowdhury",
          customerPhone: "01812345678",
          deliveryAddress: "House 12, Road 4, Dhanmondi",
          city: "Dhaka",
          items: [{ sku: "SKU-COTTON-PANJABI", title: "Embroidered Panjabi", quantity: 1, unitPriceBdt: 1850 }],
          codAmountBdt: 1850,
        },
        autoSendWhatsAppConfirmation: true,
      };

      const { status, body } = await post("/api/v1/logistics/steadfast/book", payload);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.trackingCode).toContain("BD_STEADFAST_");
      expect(body.deliveryFeeBdt).toBe(60);
      expect(body.whatsappNotificationStatus).toBe("sent");
    });
  });

  describe("POST /api/v1/mesh/dispatch", () => {
    it("routes low-RAM 2GB devices to Tier 0 Cactus Needle edge engine", async () => {
      const payload = {
        sourceProtocol: "openai_chat",
        targetBackend: "ollama_local",
        prompt: "Book parcel for customer Rahim",
        deviceMemoryGb: 2,
        isOffline: false,
      };

      const { status, body } = await post("/api/v1/mesh/dispatch", payload);

      expect(status).toBe(200);
      expect(body.selectedTier).toBe("tier0_needle_edge");
      expect(body.engine).toContain("Cactus Needle 2");
      expect(body.costUsd).toBe(0.0);
    });

    it("routes free tasks to Tier 2 Colibri VPS engine", async () => {
      const payload = {
        sourceProtocol: "openai_chat",
        targetBackend: "colibri_vps",
        prompt: "Check grammar in this paragraph",
        deviceMemoryGb: 8,
        isOffline: false,
      };

      const { status, body } = await post("/api/v1/mesh/dispatch", payload);

      expect(status).toBe(200);
      expect(body.selectedTier).toBe("tier2_colibri_vps");
      expect(body.engine).toContain("Colibri C Engine");
      expect(body.costUsd).toBe(0.0);
    });
  });

  describe("POST /api/v1/scraper/extract", () => {
    it("extracts structured markdown via Scrapling with anti-bot bypass", async () => {
      const payload = {
        url: "https://example.com/products/panjabi",
        engine: "scrapling",
        bypassAntiBot: true,
      };

      const { status, body } = await post("/api/v1/scraper/extract", payload);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.engineUsed).toBe("scrapling");
      expect(body.cleanMarkdown).toContain("Extracted Content");
    });
  });

  describe("POST /api/v1/gatekeeper/evaluate-tool", () => {
    it("blocks destructive shell commands and creates a security interception approval item", async () => {
      const payload = {
        toolName: "bash",
        args: { command: "rm -rf /var/lib/important-data" },
        riskLevel: "DESTRUCTIVE",
      };

      const { status, body } = await post("/api/v1/gatekeeper/evaluate-tool", payload);

      expect(status).toBe(200);
      expect(body.allowed).toBe(false);
      expect(body.requiresUserConfirmation).toBe(true);
      expect(body.reason).toContain("Blocked by Security Guardrail");
      expect(body.approvalId).toContain("APP-SEC-");
      expect(body.item.type).toBe("SECURITY_GUARDRAIL_INTERCEPTION");
    });

    it("allows safe read-only commands through without requiring confirmation", async () => {
      const payload = {
        toolName: "read_file",
        args: { path: "src/index.ts" },
        riskLevel: "READ_ONLY",
      };

      const { status, body } = await post("/api/v1/gatekeeper/evaluate-tool", payload);

      expect(status).toBe(200);
      expect(body.allowed).toBe(true);
      expect(body.reason).toContain("Safe execution path");
    });
  });

  describe("Speculative Decoding & Hardware Benchmark Routes", () => {
    it("POST /api/v1/mesh/speculative-benchmark returns draft acceptance speedup and TTFT", async () => {
      const payload = {
        prompt: "Write a high performance quicksort algorithm in Rust",
        draftTokens: 5,
      };

      const { status, body } = await post("/api/v1/mesh/speculative-benchmark", payload);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.hardwareTarget.gpuWorkerPort).toBe(11434);
      expect(body.hardwareTarget.targetModel).toBe("deepseek-r1:8b");
      expect(body.benchmark.speedupFactor).toBeGreaterThan(1.5);
      expect(body.benchmark.acceptanceRatePercent).toBeGreaterThanOrEqual(70);
    });

    it("POST /api/v1/mesh/saturation-test engages circuit breaker failover during GPU saturation", async () => {
      const payload = {
        simulateSaturated: true,
        prompt: "Execute high throughput inference",
      };

      const { status, body } = await post("/api/v1/mesh/saturation-test", payload);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.failoverEngaged).toBe(true);
      expect(body.activeNode).toBe("deepseek-r1:8b");
    });
  });

  describe("Production Container Health & Telemetry Verification", () => {
    it("GET /healthz returns HTTP 200 with uptime and status OK", async () => {
      const res = await fetch(`${baseUrl}/healthz`);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe("OK");
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });

    it("POST /api/telemetry ingests client feedback events", async () => {
      const payload = {
        event: "user_copied_assistant_response",
        properties: { msgId: "msg_test_99", length: 120 },
      };

      const { status, body } = await post("/api/telemetry", payload);

      expect(status).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
