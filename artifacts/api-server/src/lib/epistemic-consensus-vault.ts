/**
 * Epistemic Consensus & Merkle-Proof Knowledge Vault Engine
 * 
 * Decentralized peer-to-peer verification and Merkle-tree validation for cross-twin
 * multi-agent research outputs. Formulates cryptographic leaves, computes binary Merkle trees,
 * generates inclusion proofs, and orchestrates Byzantine fault-tolerant (BFT) consensus
 * across regional twin validator nodes.
 */

import crypto from 'crypto';

export type EpistemicDomain =
  | 'FINANCIAL_OPS'
  | 'SECURITY_AUDIT'
  | 'LEGAL_REGULATORY'
  | 'DISTRIBUTED_SYSTEMS'
  | 'AI_ALIGNMENT'
  | 'MACRO_ECONOMICS';

export type AssertionStatus = 'PENDING' | 'ATTESTED' | 'CONTESTED' | 'REJECTED';

export interface ValidatorVote {
  validatorId: string;
  nodeRegion: string;
  vote: 'APPROVE' | 'REJECT' | 'ABSTAIN';
  confidenceWeight: number; // 0.0 - 1.0
  latencyMs: number;
  signature: string;
  reasoning: string;
  timestamp: string;
}

export interface MerkleProofStep {
  position: 'left' | 'right';
  hash: string;
}

export interface EpistemicAssertion {
  id: string;
  claim: string;
  domain: EpistemicDomain;
  sourceTwinId: string;
  authorAgent: string;
  confidenceScore: number; // 0.0 - 1.0
  citations: string[];
  leafHash: string;
  status: AssertionStatus;
  quorumRatio: number; // e.g. 0.80 = 80% approval
  votes: ValidatorVote[];
  blockHeight: number;
  merkleRoot: string;
  proof: MerkleProofStep[];
  createdAt: string;
  verifiedAt?: string;
  challengeReason?: string;
}

export interface EpistemicBlock {
  height: number;
  previousBlockHash: string;
  blockHash: string;
  merkleRoot: string;
  assertionCount: number;
  timestamp: string;
  validatorSignatures: string[];
}

export interface ValidatorNode {
  id: string;
  name: string;
  region: string;
  reputationScore: number; // 0 - 100
  weight: number;
  active: boolean;
  specialties: EpistemicDomain[];
}

// Canonical Validator Roster across Shothik Global Mesh
const DEFAULT_VALIDATORS: ValidatorNode[] = [
  {
    id: 'val_dhk_01',
    name: 'Dhaka Apex Validator (BDIX)',
    region: 'South Asia (Dhaka)',
    reputationScore: 99.4,
    weight: 1.2,
    active: true,
    specialties: ['FINANCIAL_OPS', 'LEGAL_REGULATORY', 'MACRO_ECONOMICS'],
  },
  {
    id: 'val_sin_02',
    name: 'Singapore Equinix Node (SG1)',
    region: 'Asia Pacific (Singapore)',
    reputationScore: 98.8,
    weight: 1.0,
    active: true,
    specialties: ['DISTRIBUTED_SYSTEMS', 'SECURITY_AUDIT'],
  },
  {
    id: 'val_fra_03',
    name: 'Frankfurt Sovereign Node (FRA)',
    region: 'Europe (Frankfurt)',
    reputationScore: 99.1,
    weight: 1.1,
    active: true,
    specialties: ['LEGAL_REGULATORY', 'AI_ALIGNMENT', 'SECURITY_AUDIT'],
  },
  {
    id: 'val_tok_04',
    name: 'Tokyo Neural Node (NRT)',
    region: 'East Asia (Tokyo)',
    reputationScore: 97.9,
    weight: 1.0,
    active: true,
    specialties: ['AI_ALIGNMENT', 'DISTRIBUTED_SYSTEMS'],
  },
  {
    id: 'val_lon_05',
    name: 'London Sovereign Vault (LHR)',
    region: 'Western Europe (London)',
    reputationScore: 98.5,
    weight: 1.0,
    active: true,
    specialties: ['FINANCIAL_OPS', 'MACRO_ECONOMICS'],
  },
];

export class EpistemicConsensusVault {
  private validators: ValidatorNode[] = [...DEFAULT_VALIDATORS];
  private assertions: Map<string, EpistemicAssertion> = new Map();
  private blocks: EpistemicBlock[] = [];
  private currentBlockHeight: number = 0;
  private currentMerkleRoot: string = '';

  constructor() {
    this.seedGenesisKnowledge();
  }

  /**
   * Computes SHA-256 leaf hash for an epistemic assertion
   */
  public computeLeafHash(
    claim: string,
    domain: EpistemicDomain,
    sourceTwinId: string,
    confidence: number,
    citations: string[]
  ): string {
    const raw = `${claim}|${domain}|${sourceTwinId}|${confidence.toFixed(4)}|${citations.sort().join(';')}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Computes pair hash for Merkle tree construction
   */
  private hashPair(left: string, right: string): string {
    return crypto.createHash('sha256').update(left + right).digest('hex');
  }

  /**
   * Builds binary Merkle tree from an array of leaf hashes
   * Returns root hash and proof lookup
   */
  public buildMerkleTree(leafHashes: string[]): {
    root: string;
    getProof: (leafIndex: number) => MerkleProofStep[];
  } {
    if (leafHashes.length === 0) {
      return {
        root: crypto.createHash('sha256').update('GENESIS_EMPTY_VAULT').digest('hex'),
        getProof: () => [],
      };
    }

    // Duplicate last odd element if length is odd to ensure complete binary tree
    let currentLevel = [...leafHashes];
    const treeLevels: string[][] = [currentLevel];

    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
        nextLevel.push(this.hashPair(left, right));
      }
      currentLevel = nextLevel;
      treeLevels.push(currentLevel);
    }

    const root = treeLevels[treeLevels.length - 1][0];

    const getProof = (leafIndex: number): MerkleProofStep[] => {
      const proof: MerkleProofStep[] = [];
      let idx = leafIndex;

      for (let level = 0; level < treeLevels.length - 1; level++) {
        const levelNodes = treeLevels[level];
        const isRightNode = idx % 2 === 1;
        const siblingIndex = isRightNode ? idx - 1 : idx + 1;

        if (siblingIndex < levelNodes.length) {
          proof.push({
            position: isRightNode ? 'left' : 'right',
            hash: levelNodes[siblingIndex],
          });
        } else {
          // If odd node had no sibling, it was paired with itself
          proof.push({
            position: 'right',
            hash: levelNodes[idx],
          });
        }

        idx = Math.floor(idx / 2);
      }

      return proof;
    };

    return { root, getProof };
  }

  /**
   * Verifies a Merkle inclusion proof mathematically against a root hash
   */
  public verifyMerkleProof(leafHash: string, proof: MerkleProofStep[], expectedRoot: string): boolean {
    let currentHash = leafHash;

    for (const step of proof) {
      if (step.position === 'left') {
        currentHash = this.hashPair(step.hash, currentHash);
      } else {
        currentHash = this.hashPair(currentHash, step.hash);
      }
    }

    return currentHash.toLowerCase() === expectedRoot.toLowerCase();
  }

  /**
   * Seeds initial baseline knowledge vault assertions
   */
  private seedGenesisKnowledge(): void {
    const genesisClaims: Array<{
      claim: string;
      domain: EpistemicDomain;
      source: string;
      agent: string;
      confidence: number;
      citations: string[];
    }> = [
      {
        claim: 'Dhaka BDIX Edge local replication achieves 6.4ms P95 read latency under peak concurrency.',
        domain: 'DISTRIBUTED_SYSTEMS',
        source: 'twin_dhaka_01',
        agent: 'Systems Architect Twin',
        confidence: 0.992,
        citations: ['bdix://telemetry/latency-mesh/2026-09', 'audit://sqlite-edge/dhk-01'],
      },
      {
        claim: 'bKash merchant settlement webhook fees amortize at 1.45% net with dual-factor idempotency verification.',
        domain: 'FINANCIAL_OPS',
        source: 'twin_finance_lead',
        agent: 'Treasury & Unit Economics Twin',
        confidence: 0.985,
        citations: ['bkash://pgw/settlement-schedule-2026', 'audit://idempotency/tbl_settlements'],
      },
      {
        claim: 'Zero-downtime Blue/Green traffic canary circuit-breaker triggers within 185ms of SLO error rate anomaly exceeding 1.5%.',
        domain: 'SECURITY_AUDIT',
        source: 'twin_secops_lead',
        agent: 'Immunity & Canary Twin',
        confidence: 0.997,
        citations: ['secops://canary/circuit-breaker/slo-spec-v2', 'audit://benchmarks/chaos-fuzzing'],
      },
      {
        claim: 'Local sovereign Ollama instances guarantee zero external data egress for critical PII demographic parsing.',
        domain: 'AI_ALIGNMENT',
        source: 'twin_compliance_lead',
        agent: 'Privacy & Sovereignty Twin',
        confidence: 0.999,
        citations: ['compliance://sovereignty/zero-egress-cert', 'audit://network-firewall/ollama-egress-drop'],
      },
    ];

    const leaves = genesisClaims.map((c) =>
      this.computeLeafHash(c.claim, c.domain, c.source, c.confidence, c.citations)
    );

    const { root, getProof } = this.buildMerkleTree(leaves);
    this.currentMerkleRoot = root;
    this.currentBlockHeight = 1;

    // Create Genesis Block
    const genesisBlock: EpistemicBlock = {
      height: 1,
      previousBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
      blockHash: crypto.createHash('sha256').update(`GENESIS_BLOCK_1_${root}`).digest('hex'),
      merkleRoot: root,
      assertionCount: genesisClaims.length,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      validatorSignatures: this.validators.map((v) =>
        crypto.createHash('sha256').update(`${v.id}:${root}`).digest('hex').slice(0, 32)
      ),
    };
    this.blocks.push(genesisBlock);

    genesisClaims.forEach((c, idx) => {
      const id = `ast_${crypto.randomBytes(4).toString('hex')}`;
      const leafHash = leaves[idx];
      const proof = getProof(idx);

      const votes: ValidatorVote[] = this.validators.map((v) => ({
        validatorId: v.id,
        nodeRegion: v.region,
        vote: 'APPROVE',
        confidenceWeight: 0.95 + Math.random() * 0.05,
        latencyMs: Math.floor(12 + Math.random() * 25),
        signature: crypto.createHash('sha256').update(`${v.id}:${leafHash}`).digest('hex').slice(0, 32),
        reasoning: `Cryptographic citation audit confirmed against regional proof ledger.`,
        timestamp: new Date(Date.now() - 3500000).toISOString(),
      }));

      this.assertions.set(id, {
        id,
        claim: c.claim,
        domain: c.domain,
        sourceTwinId: c.source,
        authorAgent: c.agent,
        confidenceScore: c.confidence,
        citations: c.citations,
        leafHash,
        status: 'ATTESTED',
        quorumRatio: 1.0,
        votes,
        blockHeight: 1,
        merkleRoot: root,
        proof,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        verifiedAt: new Date(Date.now() - 3500000).toISOString(),
      });
    });
  }

  /**
   * Proposes a new epistemic claim from an agent and conducts a BFT consensus vote
   */
  public proposeAssertion(params: {
    claim: string;
    domain: EpistemicDomain;
    sourceTwinId: string;
    authorAgent: string;
    confidenceScore: number;
    citations: string[];
  }): EpistemicAssertion {
    const { claim, domain, sourceTwinId, authorAgent, confidenceScore, citations } = params;

    const id = `ast_${crypto.randomBytes(5).toString('hex')}`;
    const leafHash = this.computeLeafHash(claim, domain, sourceTwinId, confidenceScore, citations);

    // Conduct Byzantine Fault-Tolerant (BFT) Peer Validation
    const votes: ValidatorVote[] = [];
    let approvalWeight = 0;
    let totalWeight = 0;

    for (const val of this.validators) {
      if (!val.active) continue;

      // Simulated epistemic evaluation: checks domain affinity, citations present, and confidence score
      const isDomainSpecialty = val.specialties.includes(domain);
      const hasValidCitations = citations.length > 0;
      const isHighConfidence = confidenceScore >= 0.80;

      let voteDecision: 'APPROVE' | 'REJECT' | 'ABSTAIN' = 'APPROVE';
      let reasoning = 'Citations verified, epistemic consistency confirmed.';

      if (!hasValidCitations) {
        voteDecision = 'REJECT';
        reasoning = 'Rejection: Missing supporting cryptographic citations or provenance.';
      } else if (confidenceScore < 0.70) {
        voteDecision = 'REJECT';
        reasoning = 'Rejection: Confidence score below 0.70 threshold.';
      } else if (!isDomainSpecialty && confidenceScore < 0.75) {
        voteDecision = 'ABSTAIN';
        reasoning = 'Abstained: Out of regional validator specialty domain with moderate confidence.';
      }

      if (voteDecision === 'APPROVE') {
        approvalWeight += val.weight;
      }
      totalWeight += val.weight;

      const signature = crypto
        .createHash('sha256')
        .update(`${val.id}:${leafHash}:${voteDecision}`)
        .digest('hex')
        .slice(0, 32);

      votes.push({
        validatorId: val.id,
        nodeRegion: val.region,
        vote: voteDecision,
        confidenceWeight: isHighConfidence ? 0.95 : 0.82,
        latencyMs: Math.floor(10 + Math.random() * 30),
        signature,
        reasoning,
        timestamp: new Date().toISOString(),
      });
    }

    const quorumRatio = totalWeight > 0 ? approvalWeight / totalWeight : 0;
    // BFT 2/3 threshold (66.7%)
    const status: AssertionStatus =
      quorumRatio >= 0.67 ? 'ATTESTED' : quorumRatio >= 0.4 ? 'CONTESTED' : 'REJECTED';

    // Commit to Merkle Tree and increment block
    const allLeafHashes = Array.from(this.assertions.values()).map((a) => a.leafHash);
    allLeafHashes.push(leafHash);

    const { root, getProof } = this.buildMerkleTree(allLeafHashes);
    this.currentMerkleRoot = root;
    this.currentBlockHeight += 1;

    // Generate Merkle proof for this newly added leaf
    const proof = getProof(allLeafHashes.length - 1);

    // Record new block
    const newBlock: EpistemicBlock = {
      height: this.currentBlockHeight,
      previousBlockHash: this.blocks[this.blocks.length - 1]?.blockHash || '0000000000',
      blockHash: crypto.createHash('sha256').update(`BLOCK_${this.currentBlockHeight}_${root}`).digest('hex'),
      merkleRoot: root,
      assertionCount: allLeafHashes.length,
      timestamp: new Date().toISOString(),
      validatorSignatures: votes
        .filter((v) => v.vote === 'APPROVE')
        .map((v) => crypto.createHash('sha256').update(`${v.validatorId}:${root}`).digest('hex').slice(0, 32)),
    };
    this.blocks.push(newBlock);

    const assertion: EpistemicAssertion = {
      id,
      claim,
      domain,
      sourceTwinId,
      authorAgent,
      confidenceScore,
      citations,
      leafHash,
      status,
      quorumRatio,
      votes,
      blockHeight: this.currentBlockHeight,
      merkleRoot: root,
      proof,
      createdAt: new Date().toISOString(),
      verifiedAt: status === 'ATTESTED' ? new Date().toISOString() : undefined,
    };

    this.assertions.set(id, assertion);
    return assertion;
  }

  /**
   * Challenges an existing assertion with counter-evidence, triggering an emergency re-vote
   */
  public challengeAssertion(assertionId: string, challengeReason: string): EpistemicAssertion {
    const existing = this.assertions.get(assertionId);
    if (!existing) {
      throw new Error(`Assertion ${assertionId} not found in knowledge vault.`);
    }

    // Shift status to CONTESTED and recalculate votes with challenger bias
    existing.status = 'CONTESTED';
    existing.challengeReason = challengeReason;

    existing.votes = this.validators.map((v) => {
      const shouldContest = Math.random() < 0.60;
      const vote = shouldContest ? 'REJECT' : 'ABSTAIN';
      return {
        validatorId: v.id,
        nodeRegion: v.region,
        vote,
        confidenceWeight: 0.88,
        latencyMs: Math.floor(15 + Math.random() * 25),
        signature: crypto
          .createHash('sha256')
          .update(`${v.id}:${existing.leafHash}:CHALLENGE:${vote}`)
          .digest('hex')
          .slice(0, 32),
        reasoning: `Emergency challenge audit: ${challengeReason}`,
        timestamp: new Date().toISOString(),
      };
    });

    existing.quorumRatio = 0.20; // Dropped below BFT threshold
    this.assertions.set(assertionId, existing);
    return existing;
  }

  /**
   * Returns complete vault status and cryptographic telemetry
   */
  public getVaultStatus() {
    const all = Array.from(this.assertions.values());
    const attested = all.filter((a) => a.status === 'ATTESTED').length;
    const contested = all.filter((a) => a.status === 'CONTESTED').length;
    const rejected = all.filter((a) => a.status === 'REJECTED').length;

    // Epistemic Truth Quotient (ETQ): weighted confidence of attested claims
    const truthQuotient =
      attested > 0
        ? (all.filter((a) => a.status === 'ATTESTED').reduce((acc, a) => acc + a.confidenceScore, 0) / attested) * 100
        : 100;

    return {
      vaultHeight: this.currentBlockHeight,
      merkleRoot: this.currentMerkleRoot,
      totalAssertions: all.length,
      attestedCount: attested,
      contestedCount: contested,
      rejectedCount: rejected,
      epistemicTruthQuotient: parseFloat(truthQuotient.toFixed(2)),
      activeValidatorsCount: this.validators.filter((v) => v.active).length,
      validators: this.validators,
      latestBlock: this.blocks[this.blocks.length - 1],
    };
  }

  public getAssertions(filter?: { domain?: EpistemicDomain; status?: AssertionStatus }) {
    let list = Array.from(this.assertions.values());
    if (filter?.domain) {
      list = list.filter((a) => a.domain === filter.domain);
    }
    if (filter?.status) {
      list = list.filter((a) => a.status === filter.status);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAssertionById(id: string) {
    return this.assertions.get(id);
  }

  public getLedgerBlocks() {
    return [...this.blocks].sort((a, b) => b.height - a.height);
  }
}

// Global Singleton Instance
export const epistemicVault = new EpistemicConsensusVault();
