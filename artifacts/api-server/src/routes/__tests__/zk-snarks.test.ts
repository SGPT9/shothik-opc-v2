import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';

describe('Autonomous Cross-Twin Epistemic ZK-SNARK Prover API (/api/v1/epistemic/zk)', () => {
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

  it('1. GET /api/v1/epistemic/zk/status returns curve parameters and prover metrics', async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/zk/status`);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.curve).toContain('BN254');
    expect(data.activeCircuitsCount).toBe(4);
    expect(data.totalProofsGenerated).toBeGreaterThan(0);
    expect(data.totalProofsVerified).toBeGreaterThan(0);
    expect(data.privacyLeakageScorePercent).toBe(0.0);
    expect(data.averageVerificationLatencyMs).toBeLessThan(5.0);
  });

  it('2. GET /api/v1/epistemic/zk/circuits lists all 4 pre-compiled ZK circuits', async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/zk/circuits`);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.circuits.length).toBe(4);

    const circuitIds = data.circuits.map((c: any) => c.id);
    expect(circuitIds).toContain('MERKLE_MEMBERSHIP_ZK');
    expect(circuitIds).toContain('SOLVENCY_RANGE_PROOF');
    expect(circuitIds).toContain('COURIER_TAX_COMPLIANCE');
    expect(circuitIds).toContain('ANONYMOUS_REPUTATION_ATTESTATION');
  });

  it('3. POST /api/v1/epistemic/zk/prove synthesizes valid Groth16 curve points for SOLVENCY_RANGE_PROOF', async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/zk/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circuitId: 'SOLVENCY_RANGE_PROOF',
        publicInputs: {
          minSolvencyThresholdBdt: 75000,
          currencyCode: 'BDT',
          epoch: 1420,
        },
        privateWitness: {
          actualTreasuryBalanceBdt: 245000,
          vaultCustodySalt: '0x94827be9201948ba',
          twinPrivateKey: '0xpriv_demo_twin_key',
        },
        proverTwinId: 'dhaka_organic_finance_twin',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.proof.circuitId).toBe('SOLVENCY_RANGE_PROOF');
    expect(data.proof.points.pi_a.x).toMatch(/^0x[a-f0-9]{64}$/);
    expect(data.proof.points.pi_b.x[0]).toMatch(/^0x[a-f0-9]{64}$/);
    expect(data.proof.points.pi_c.x).toMatch(/^0x[a-f0-9]{64}$/);
    expect(data.proof.commitmentHash).toBeDefined();
    expect(data.proof.proofHash).toBeDefined();
    expect(data.proof.provingDurationMs).toBeGreaterThan(0);
  });

  it('4. POST /api/v1/epistemic/zk/prove synthesizes valid proof for MERKLE_MEMBERSHIP_ZK', async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/zk/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circuitId: 'MERKLE_MEMBERSHIP_ZK',
        publicInputs: {
          merkleRoot: '0xbb478ec57fca49a59eb834ff7ca65e0cd9de2d6f70f9444fd09ecb40841f6d67',
          vaultHeight: 2,
          domainCode: 'DISTRIBUTED_SYSTEMS',
        },
        privateWitness: {
          claimText: 'Dhaka BDIX Edge local in-memory replication achieves 6.4ms P95 read latency',
          leafHash: '0xbb478ec57fca49a59eb834ff7ca65e0cd9de2d6f',
          auditPath: ['0x1111...', '0x2222...'],
        },
        proverTwinId: 'singapore_research_twin',
      }),
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.proof.circuitId).toBe('MERKLE_MEMBERSHIP_ZK');
    expect(data.proof.proofHash.length).toBe(64);
  });

  it('5. POST /api/v1/epistemic/zk/prove rejects missing parameters with 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/zk/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circuitId: 'SOLVENCY_RANGE_PROOF',
      }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.success).toBe(false);
  });

  it('6. POST /api/v1/epistemic/zk/verify executes pairing check and records ledger entry', async () => {
    // Generate proof first
    const proveRes = await fetch(`${baseUrl}/api/v1/epistemic/zk/prove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circuitId: 'COURIER_TAX_COMPLIANCE',
        publicInputs: {
          consignmentHash: '0x9928192837bc9102',
          vatRatePercent: 5.0,
          codLimitBdt: 100000,
        },
        privateWitness: {
          customerName: 'Secret VIP Buyer',
          customerPhone: '01712345678',
          exactOrderAmount: 2500,
          merchantVatPin: 'BIN_9981293',
        },
      }),
    });
    const { proof } = (await proveRes.json()) as any;

    // Verify proof
    const verifyRes = await fetch(`${baseUrl}/api/v1/epistemic/zk/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof }),
    });

    expect(verifyRes.status).toBe(200);
    const verifyData = (await verifyRes.json()) as any;
    expect(verifyData.success).toBe(true);
    expect(verifyData.verified).toBe(true);
    expect(verifyData.privacyLeakageScore).toBe(0.0);
    expect(verifyData.pairingCheck).toContain('VALID MATCH');
    expect(verifyData.verificationDurationMs).toBeGreaterThan(0);
  });

  it('7. POST /api/v1/epistemic/zk/verify rejects malformed proof with 400', async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/zk/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proof: { circuitId: 'INVALID' } }),
    });

    expect(res.status).toBe(400);
    const data = (await res.json()) as any;
    expect(data.success).toBe(false);
  });

  it('8. GET /api/v1/epistemic/zk/ledger retrieves immutable ledger of verified ZK statements', async () => {
    const res = await fetch(`${baseUrl}/api/v1/epistemic/zk/ledger`);
    expect(res.status).toBe(200);

    const data = (await res.json()) as any;
    expect(data.success).toBe(true);
    expect(data.ledger.length).toBeGreaterThanOrEqual(3);
    expect(data.ledger[0].proofHash).toBeDefined();
    expect(data.ledger[0].status).toBe('VERIFIED');
  });
});
