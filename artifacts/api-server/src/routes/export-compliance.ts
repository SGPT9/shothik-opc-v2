import { Router, Request, Response } from 'express';
import {
  exportComplianceEngine,
  FormExpStatus,
  FormExpRecord,
} from '../lib/export/export-compliance-engine.js';

export const exportComplianceRouter = Router();

/**
 * POST /api/v1/export-compliance/form-exp/generate
 * Generates and certifies Bangladesh Bank Online Form-EXP export declaration
 */
exportComplianceRouter.post('/v1/export-compliance/form-exp/generate', (req: Request, res: Response) => {
  try {
    const input: Partial<FormExpRecord> = req.body || {};
    const record = exportComplianceEngine.generateFormExp(input);

    return res.status(200).json({
      ok: true,
      data: record,
      message: `Form-EXP #${record.expNumber} generated successfully and certified for customs clearance.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to generate Form-EXP declaration.',
    });
  }
});

/**
 * GET /api/v1/export-compliance/form-exp/list
 * Lists active and completed Form-EXP filings
 */
exportComplianceRouter.get('/v1/export-compliance/form-exp/list', (req: Request, res: Response) => {
  try {
    const status = req.query.status as FormExpStatus | undefined;
    const records = exportComplianceEngine.listFormExp({ status });

    return res.status(200).json({
      ok: true,
      data: records,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to list Form-EXP records.',
    });
  }
});

/**
 * GET /api/v1/export-compliance/form-exp/:expNumber
 * Retrieves individual Form-EXP packet with ASYCUDA tariff details
 */
exportComplianceRouter.get('/v1/export-compliance/form-exp/:expNumber', (req: Request, res: Response) => {
  try {
    const expNumber = String(req.params.expNumber);
    const record = exportComplianceEngine.getFormExpByNumber(expNumber);

    if (!record) {
      return res.status(404).json({
        ok: false,
        error: `Form-EXP #${expNumber} not found.`,
      });
    }

    return res.status(200).json({
      ok: true,
      data: record,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to fetch Form-EXP record.',
    });
  }
});

/**
 * POST /api/v1/export-compliance/validate-erc
 * Validates Export Registration Certificate (ERC) with CCI&E and BIN requirements
 */
exportComplianceRouter.post('/v1/export-compliance/validate-erc', (req: Request, res: Response) => {
  try {
    const { ercNumber, bin } = req.body || {};
    const validation = exportComplianceEngine.validateErc(ercNumber, bin);

    return res.status(200).json({
      ok: true,
      data: validation,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to validate ERC certificate.',
    });
  }
});

/**
 * POST /api/v1/export-compliance/lc/update
 * Updates Letter of Credit milestone or foreign exchange inward realization
 */
exportComplianceRouter.post('/v1/export-compliance/lc/update', (req: Request, res: Response) => {
  try {
    const { expNumber, status, realizedUsd, shipmentDate } = req.body || {};

    if (!expNumber || !status) {
      return res.status(400).json({
        ok: false,
        error: 'Both expNumber and status are required fields.',
      });
    }

    const updated = exportComplianceEngine.updateLcMilestone(
      expNumber,
      status as FormExpStatus,
      realizedUsd,
      shipmentDate
    );

    return res.status(200).json({
      ok: true,
      data: updated,
      message: `LC milestone and repatriation status updated for Form-EXP #${expNumber}.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to update LC milestone.',
    });
  }
});

/**
 * GET /api/v1/export-compliance/summary
 * Retrieves overall export turnover, pending repatriation, and cash subsidies
 */
exportComplianceRouter.get('/v1/export-compliance/summary', (_req: Request, res: Response) => {
  try {
    const summary = exportComplianceEngine.getSummaryMetrics();
    return res.status(200).json({
      ok: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to calculate export summary metrics.',
    });
  }
});
