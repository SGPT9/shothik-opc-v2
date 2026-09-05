/**
 * Epistemic Consensus & Knowledge Vault REST Routes
 */

import { Router, Request, Response } from 'express';
import { epistemicVault, EpistemicDomain, AssertionStatus } from '../lib/epistemic-consensus-vault.js';

export const epistemicConsensusRouter = Router();

/**
 * GET /api/v1/epistemic/vault/status
 * Returns current vault state, block height, Merkle root, ETQ, and validator roster
 */
epistemicConsensusRouter.get('/v1/epistemic/vault/status', (_req: Request, res: Response) => {
  try {
    const status = epistemicVault.getVaultStatus();
    return res.json({
      success: true,
      ...status,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/epistemic/vault/propose
 * Proposes a new epistemic claim, executes BFT validator consensus, and commits to Merkle tree
 */
epistemicConsensusRouter.post('/v1/epistemic/vault/propose', (req: Request, res: Response) => {
  try {
    const { claim, domain, sourceTwinId, authorAgent, confidenceScore, citations } = req.body;

    if (!claim || typeof claim !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid claim' });
    }

    if (!domain) {
      return res.status(400).json({ success: false, error: 'Missing assertion domain' });
    }

    const assertion = epistemicVault.proposeAssertion({
      claim,
      domain: domain as EpistemicDomain,
      sourceTwinId: sourceTwinId || 'twin_client_proposer',
      authorAgent: authorAgent || 'Research Swarm Agent',
      confidenceScore: typeof confidenceScore === 'number' ? confidenceScore : 0.92,
      citations: Array.isArray(citations) ? citations : [],
    });

    return res.status(201).json({
      success: true,
      assertion,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/epistemic/vault/assertions
 * Lists epistemic assertions with optional domain and status filtering
 */
epistemicConsensusRouter.get('/v1/epistemic/vault/assertions', (req: Request, res: Response) => {
  try {
    const { domain, status } = req.query;
    const assertions = epistemicVault.getAssertions({
      domain: domain as EpistemicDomain | undefined,
      status: status as AssertionStatus | undefined,
    });

    return res.json({
      success: true,
      count: assertions.length,
      assertions,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/epistemic/vault/assertions/:assertionId
 * Retrieves an individual assertion with its cryptographic Merkle proof
 */
epistemicConsensusRouter.get('/v1/epistemic/vault/assertions/:assertionId', (req: Request, res: Response) => {
  try {
    const assertionId = String(req.params.assertionId);
    const assertion = epistemicVault.getAssertionById(assertionId);

    if (!assertion) {
      return res.status(404).json({ success: false, error: 'Assertion not found' });
    }

    return res.json({
      success: true,
      assertion,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/epistemic/vault/verify-proof
 * Cryptographically validates a Merkle inclusion proof against a specified or current Merkle root
 */
epistemicConsensusRouter.post('/v1/epistemic/vault/verify-proof', (req: Request, res: Response) => {
  try {
    const { leafHash, proof, expectedRoot } = req.body;

    if (!leafHash || !Array.isArray(proof)) {
      return res.status(400).json({ success: false, error: 'leafHash and proof array are required' });
    }

    const targetRoot = expectedRoot || epistemicVault.getVaultStatus().merkleRoot;
    const isValid = epistemicVault.verifyMerkleProof(leafHash, proof, targetRoot);

    return res.json({
      success: true,
      verified: isValid,
      leafHash,
      targetRoot,
      proofDepth: proof.length,
      explanation: isValid
        ? 'Cryptographic Merkle proof is mathematically sound and verified against vault root.'
        : 'Verification failed: calculated root hash does not match target Merkle root.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/epistemic/vault/challenge
 * Challenges an attested assertion by presenting counter-evidence and triggering emergency validator re-vote
 */
epistemicConsensusRouter.post('/v1/epistemic/vault/challenge', (req: Request, res: Response) => {
  try {
    const { assertionId, challengeReason } = req.body;

    if (!assertionId || !challengeReason) {
      return res.status(400).json({ success: false, error: 'assertionId and challengeReason are required' });
    }

    const updated = epistemicVault.challengeAssertion(String(assertionId), String(challengeReason));

    return res.json({
      success: true,
      assertion: updated,
      message: 'Assertion challenged and placed into CONTESTED state pending peer audit.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/epistemic/vault/ledger
 * Retrieves chronological block ledger of committed knowledge state
 */
epistemicConsensusRouter.get('/v1/epistemic/vault/ledger', (_req: Request, res: Response) => {
  try {
    const blocks = epistemicVault.getLedgerBlocks();
    return res.json({
      success: true,
      totalBlocks: blocks.length,
      blocks,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
