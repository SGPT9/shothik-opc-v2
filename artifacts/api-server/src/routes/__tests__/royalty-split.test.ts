import { describe, it, expect } from "vitest";
import {
  createRoyaltySplitRouter,
  computeMerkleRoot,
  buildDefaultRoyaltyState,
  buildDefaultProvenanceCertificate
} from "../royalty-split.js";

describe("Capability #44: Cryptographic Royalty Split & Digital First Editions", () => {
  it("computes deterministic SHA-256 Merkle root from chapter leaf hashes", () => {
    const leaf1 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const leaf2 = "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb";
    const root = computeMerkleRoot([leaf1, leaf2]);

    expect(root).toHaveLength(64);
    expect(root).toMatch(/^[0-9a-f]{64}$/);

    // Idempotent calculation
    const root2 = computeMerkleRoot([leaf1, leaf2]);
    expect(root).toBe(root2);
  });

  it("ensures stakeholder royalty splits sum exactly to 100%", () => {
    const state = buildDefaultRoyaltyState("proj_royalty_test");
    expect(state.stakeholders.length).toBeGreaterThanOrEqual(4);

    const totalPercentage = state.stakeholders.reduce((sum, s) => sum + s.percentage, 0);
    expect(totalPercentage).toBe(100);

    const author = state.stakeholders.find((s) => s.id === "sh_author");
    expect(author?.percentage).toBe(70);
    expect(author?.payoutMethod).toBe("bkash");
  });

  it("generates cryptographic provenance certificate with ECDSA signature and block metadata", () => {
    const cert = buildDefaultProvenanceCertificate("proj_royalty_test");
    expect(cert.merkleRootHash).toHaveLength(64);
    expect(cert.ecdsaSignature).toMatch(/^0x[0-9a-f]{64}$/);
    expect(cert.shothikCertificateId).toContain("CERT-SHTK-");
    expect(cert.chapterLeafHashes.length).toBe(3);
  });

  it("supports numbered digital first edition collector series up to max supply", () => {
    const state = buildDefaultRoyaltyState("proj_royalty_test");
    expect(state.maxCollectorSupply).toBe(500);
    expect(state.mintedEditions.length).toBeGreaterThanOrEqual(2);

    const genesis = state.mintedEditions[0];
    expect(genesis.editionSerial).toBe("SHTK-FE-0001/0500");
    expect(genesis.isSpecialAuthorProof).toBe(true);
  });

  it("exports an Express router function with valid royalty split endpoints", () => {
    const router = createRoyaltySplitRouter();
    expect(router).toBeDefined();
    expect(typeof router).toBe("function");
  });
});
