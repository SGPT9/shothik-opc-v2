import { Router, Request, Response } from "express";
import { legalContractsEngine, ContractType } from "../lib/contracts/legal-contracts-engine.js";

export const legalContractsRouter = Router();

// GET /api/v1/contracts/summary
legalContractsRouter.get("/v1/contracts/summary", (_req: Request, res: Response) => {
  try {
    const summary = legalContractsEngine.getSummaryMetrics();
    return res.json({ ok: true, data: summary });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/contracts
legalContractsRouter.get("/v1/contracts", (_req: Request, res: Response) => {
  try {
    const contracts = legalContractsEngine.getContracts();
    return res.json({ ok: true, data: contracts });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/v1/contracts/:id
legalContractsRouter.get("/v1/contracts/:id", (req: Request, res: Response) => {
  try {
    const contractId = String(req.params.id);
    const contract = legalContractsEngine.getContractById(contractId);
    if (!contract) {
      return res.status(404).json({ ok: false, error: "Contract not found" });
    }
    return res.json({ ok: true, data: contract });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/contracts/calculate-stamp-duty
legalContractsRouter.post("/v1/contracts/calculate-stamp-duty", (req: Request, res: Response) => {
  try {
    const { type, contractValueBdt } = req.body;
    if (!type) {
      return res.status(400).json({ ok: false, error: "type is required" });
    }
    const stampDetails = legalContractsEngine.calculateStampDuty(type as ContractType, contractValueBdt);
    return res.json({ ok: true, data: stampDetails });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/contracts/generate
legalContractsRouter.post("/v1/contracts/generate", (req: Request, res: Response) => {
  try {
    const {
      type,
      firstParty,
      secondParty,
      contractValueBdt,
      durationMonths,
      effectiveDate,
      customTermsEn,
      customTermsBn,
    } = req.body;

    if (!type || !firstParty?.name || !secondParty?.name) {
      return res.status(400).json({
        ok: false,
        error: "type, firstParty (with name), and secondParty (with name) are required",
      });
    }

    const contract = legalContractsEngine.generateContract({
      type,
      firstParty,
      secondParty,
      contractValueBdt,
      durationMonths,
      effectiveDate,
      customTermsEn,
      customTermsBn,
    });

    return res.status(201).json({ ok: true, data: contract });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/v1/contracts/sign
legalContractsRouter.post("/v1/contracts/sign", (req: Request, res: Response) => {
  try {
    const { contractId, party, signerName, nidOrTin, otpCode, ipAddress } = req.body;

    if (!contractId || !party || !signerName || !nidOrTin || !otpCode) {
      return res.status(400).json({
        ok: false,
        error: "contractId, party, signerName, nidOrTin, and otpCode are required",
      });
    }

    const signedContract = legalContractsEngine.signContract({
      contractId,
      party,
      signerName,
      nidOrTin,
      otpCode,
      ipAddress,
    });

    return res.json({ ok: true, data: signedContract });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
