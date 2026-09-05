import { Router, Request, Response } from 'express';
import { zkSnarkProverEngine, ZkCircuitId } from '../lib/zk-snark-prover';
import { logger } from '../lib/logger';

export const zkSnarksRouter = Router();

/**
 * GET /api/v1/epistemic/zk/status
 * Returns zero-knowledge prover engine status, curve parameters, and metrics
 */
zkSnarksRouter.get('/v1/epistemic/zk/status', (_req: Request, res: Response) => {
  try {
    const status = zkSnarkProverEngine.getStatus();
    return res.status(200).json(status);
  } catch (error: any) {
    logger.error({ error: error.message }, '[zkSnarksRouter] Failed to get status');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/epistemic/zk/circuits
 * Returns available pre-compiled ZK circuits and proving key schemas
 */
zkSnarksRouter.get('/v1/epistemic/zk/circuits', (_req: Request, res: Response) => {
  try {
    const circuits = zkSnarkProverEngine.getCircuits();
    return res.status(200).json({
      success: true,
      circuits,
      total: circuits.length,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '[zkSnarksRouter] Failed to list circuits');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/epistemic/zk/prove
 * Generates a Groth16 / Plonk succinct zero-knowledge proof
 */
zkSnarksRouter.post('/v1/epistemic/zk/prove', (req: Request, res: Response) => {
  try {
    const { circuitId, publicInputs, privateWitness, proverTwinId } = req.body || {};

    if (!circuitId || typeof circuitId !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid circuitId' });
    }

    if (!publicInputs || typeof publicInputs !== 'object') {
      return res.status(400).json({ success: false, error: 'publicInputs must be a valid object' });
    }

    if (!privateWitness || typeof privateWitness !== 'object') {
      return res.status(400).json({ success: false, error: 'privateWitness must be a valid object' });
    }

    const proof = zkSnarkProverEngine.generateProof(
      circuitId as ZkCircuitId,
      publicInputs,
      privateWitness,
      typeof proverTwinId === 'string' ? proverTwinId : 'opc_twin_local'
    );

    return res.status(201).json({
      success: true,
      proof,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '[zkSnarksRouter] Failed to generate proof');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/v1/epistemic/zk/verify
 * Mathematically verifies pairing equations of a submitted zero-knowledge proof
 */
zkSnarksRouter.post('/v1/epistemic/zk/verify', (req: Request, res: Response) => {
  try {
    const { proof } = req.body || {};

    if (!proof || typeof proof !== 'object' || !proof.circuitId || !proof.points) {
      return res.status(400).json({ success: false, error: 'Malformed proof object for verification' });
    }

    const result = zkSnarkProverEngine.verifyProof(proof);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '[zkSnarksRouter] Failed to verify proof');
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/v1/epistemic/zk/ledger
 * Returns chronological ledger of verified zero-knowledge statements
 */
zkSnarksRouter.get('/v1/epistemic/zk/ledger', (_req: Request, res: Response) => {
  try {
    const ledger = zkSnarkProverEngine.getLedger();
    return res.status(200).json({
      success: true,
      ledger,
      count: ledger.length,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, '[zkSnarksRouter] Failed to get ledger');
    return res.status(500).json({ success: false, error: error.message });
  }
});
