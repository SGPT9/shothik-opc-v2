import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "../../app.js";

describe("Epistemic Consensus & Merkle Vault API (/api/v1/epistemic/vault)", () => {
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

  it("1. GET /api/v1/epistemic/vault/status returns current vault state and validator roster", async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/vault/status`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.vaultHeight).toBeGreaterThanOrEqual(1);
    expect(typeof data.merkleRoot).toBe("string");
    expect(data.merkleRoot.length).toBe(64);
    expect(data.totalAssertions).toBeGreaterThanOrEqual(4);
    expect(data.attestedCount).toBeGreaterThanOrEqual(4);
    expect(data.epistemicTruthQuotient).toBeGreaterThan(90);
    expect(data.validators.length).toBe(5);
  });

  it("2. GET /api/v1/epistemic/vault/assertions returns assertions list and supports domain filter", async () => {
    const resAll = await fetch(`${baseUrl}/api/v1/epistemic/vault/assertions`);
    expect(resAll.status).toBe(200);
    const allData = (await resAll.json()) as any;
    expect(allData.success).toBe(true);
    expect(allData.count).toBeGreaterThanOrEqual(4);

    const resFiltered = await fetch(`${baseUrl}/api/v1/epistemic/vault/assertions?domain=DISTRIBUTED_SYSTEMS`);
    expect(resFiltered.status).toBe(200);
    const filteredData = (await resFiltered.json()) as any;
    expect(filteredData.success).toBe(true);
    filteredData.assertions.forEach((a: any) => {
      expect(a.domain).toBe("DISTRIBUTED_SYSTEMS");
    });
  });

  it("3. POST /api/v1/epistemic/vault/propose accepts new research assertion and executes BFT consensus", async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/vault/propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claim: "Autonomous WebGPU BGE-m3 embedding acceleration reduces semantic retrieval latency to 2.1ms on client.",
        domain: "AI_ALIGNMENT",
        sourceTwinId: "twin_client_edge",
        authorAgent: "Neural Retrieval Twin",
        confidenceScore: 0.965,
        citations: ["webgpu://bge-m3/client-perf-v1", "audit://neural/zero-latency-benchmark"],
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.assertion.status).toBe("ATTESTED");
    expect(data.assertion.quorumRatio).toBeGreaterThanOrEqual(0.67);
    expect(data.assertion.votes.length).toBe(5);
    expect(data.assertion.leafHash.length).toBe(64);
    expect(data.assertion.proof.length).toBeGreaterThan(0);
  });

  it("4. POST /api/v1/epistemic/vault/propose rejects missing claim or domain", async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/vault/propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        confidenceScore: 0.90,
      }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.success).toBe(false);
  });

  it("5. POST /api/v1/epistemic/vault/verify-proof mathematically verifies valid Merkle proof", async () => {
    const propRes = await fetch(`${baseUrl}/api/v1/epistemic/vault/propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claim: "Dhaka-Singapore inter-region hybrid vector clock synchronization converges within 32ms.",
        domain: "DISTRIBUTED_SYSTEMS",
        sourceTwinId: "twin_mesh_lead",
        authorAgent: "CRDT Mesh Twin",
        confidenceScore: 0.98,
        citations: ["mesh://vector-clock/sync-rtt", "audit://crdt/deterministic-merge"],
      }),
    });

    const propData = (await propRes.json()) as any;
    const assertion = propData.assertion;

    const verifyRes = await fetch(`${baseUrl}/api/v1/epistemic/vault/verify-proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leafHash: assertion.leafHash,
        proof: assertion.proof,
        expectedRoot: assertion.merkleRoot,
      }),
    });

    expect(verifyRes.status).toBe(200);
    const verifyData = (await verifyRes.json()) as any;
    expect(verifyData.success).toBe(true);
    expect(verifyData.verified).toBe(true);
  });

  it("6. POST /api/v1/epistemic/vault/verify-proof detects tampered leaf hash", async () => {
    const fakeLeaf = "1111111111111111111111111111111111111111111111111111111111111111";
    const fakeProof = [{ position: "left", hash: "2222222222222222222222222222222222222222222222222222222222222222" }];

    const verifyRes = await fetch(`${baseUrl}/api/v1/epistemic/vault/verify-proof`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leafHash: fakeLeaf,
        proof: fakeProof,
        expectedRoot: "3333333333333333333333333333333333333333333333333333333333333333",
      }),
    });

    expect(verifyRes.status).toBe(200);
    const verifyData = (await verifyRes.json()) as any;
    expect(verifyData.verified).toBe(false);
  });

  it("7. POST /api/v1/epistemic/vault/challenge transitions assertion to CONTESTED state", async () => {
    const propRes = await fetch(`${baseUrl}/api/v1/epistemic/vault/propose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        claim: "Contestable Claim for Epistemic Re-vote Testing.",
        domain: "MACRO_ECONOMICS",
        sourceTwinId: "twin_test_challenger",
        authorAgent: "Economic Modeler",
        confidenceScore: 0.85,
        citations: ["macro://survey/preliminary-sample"],
      }),
    });

    const propData = (await propRes.json()) as any;
    const assertionId = propData.assertion.id;

    const challengeRes = await fetch(`${baseUrl}/api/v1/epistemic/vault/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assertionId,
        challengeReason: "Contradictory data observed in Q3 central bank audit report.",
      }),
    });

    expect(challengeRes.status).toBe(200);
    const challengeData = (await challengeRes.json()) as any;
    expect(challengeData.success).toBe(true);
    expect(challengeData.assertion.status).toBe("CONTESTED");
    expect(challengeData.assertion.challengeReason).toContain("Contradictory data");
  });

  it("8. GET /api/v1/epistemic/vault/ledger returns chronological block ledger", async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/vault/ledger`);
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.totalBlocks).toBeGreaterThanOrEqual(1);
    expect(data.blocks[0].height).toBeGreaterThanOrEqual(1);
    expect(data.blocks[0].merkleRoot.length).toBe(64);
  });
});
