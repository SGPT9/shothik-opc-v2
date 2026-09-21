import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  FreelancerIncentiveEngine,
  ForeignCurrency,
  InwardChannel,
  ExporterCategory,
  OFFICIAL_FX_RATES,
} from "../lib/remittance/freelancer-incentive-engine.js";

export const remittanceIncentiveRouter = Router();

const calculateIncentiveSchema = z.object({
  foreignCurrency: z.enum(["USD", "EUR", "GBP", "AUD", "CAD", "SGD"]),
  foreignAmount: z.number().positive("Foreign amount must be positive"),
  exporterCategory: z.enum(["ict_freelancer_individual", "basis_registered_it_firm", "general_digital_service"]).optional(),
  customExchangeRate: z.number().positive().optional(),
  channel: z.enum(["wise", "payoneer", "swift_wire", "upwork", "fiverr", "direct_ach"]).optional(),
});

const recordRemittanceSchema = z.object({
  transactionRef: z.string().min(1, "transactionRef is required"),
  channel: z.enum(["wise", "payoneer", "swift_wire", "upwork", "fiverr", "direct_ach"]),
  sourceCountry: z.string().min(1, "sourceCountry is required"),
  remitterName: z.string().min(1, "remitterName is required"),
  beneficiaryName: z.string().min(1, "beneficiaryName is required"),
  beneficiaryAccountNo: z.string().min(1, "beneficiaryAccountNo is required"),
  beneficiaryBank: z.string().min(1, "beneficiaryBank is required"),
  foreignCurrency: z.enum(["USD", "EUR", "GBP", "AUD", "CAD", "SGD"]),
  foreignAmount: z.number().positive("foreignAmount must be positive"),
  exporterCategory: z.enum(["ict_freelancer_individual", "basis_registered_it_firm", "general_digital_service"]).optional(),
  customExchangeRate: z.number().positive().optional(),
  purposeCode: z.string().optional(),
});

const generateFormCSchema = z.object({
  remittanceId: z.string().optional(),
  beneficiaryName: z.string().min(1, "beneficiaryName is required"),
  beneficiaryAccountNo: z.string().min(1, "beneficiaryAccountNo is required"),
  beneficiaryNidOrPassport: z.string().min(1, "beneficiaryNidOrPassport is required"),
  tinNumber: z.string().min(1, "tinNumber is required"),
  freelancerIdOrBasisNo: z.string().optional(),
  adBankName: z.string().min(1, "adBankName is required"),
  adBranchName: z.string().min(1, "adBranchName is required"),
  adRoutingNumber: z.string().min(1, "adRoutingNumber is required"),
  foreignCurrency: z.enum(["USD", "EUR", "GBP", "AUD", "CAD", "SGD"]),
  foreignAmount: z.number().positive("foreignAmount must be positive"),
  sendingCountry: z.string().min(1, "sendingCountry is required"),
  remitterName: z.string().min(1, "remitterName is required"),
  descriptionOfWork: z.string().min(1, "descriptionOfWork is required"),
  exporterCategory: z.enum(["ict_freelancer_individual", "basis_registered_it_firm", "general_digital_service"]).optional(),
});

const generateContractSchema = z.object({
  contractTitle: z.string().min(1, "contractTitle is required"),
  clientName: z.string().min(1, "clientName is required"),
  clientCountry: z.string().min(1, "clientCountry is required"),
  freelancerName: z.string().min(1, "freelancerName is required"),
  freelancerAddress: z.string().min(1, "freelancerAddress is required"),
  scopeOfWork: z.array(z.string()).min(1, "At least one scope item is required"),
  totalValueCurrency: z.enum(["USD", "EUR", "GBP", "AUD", "CAD", "SGD"]),
  milestones: z.array(
    z.object({
      title: z.string().min(1, "milestone title required"),
      amount: z.number().positive("milestone amount must be positive"),
    })
  ).min(1, "At least one milestone is required"),
});

/**
 * POST /v1/remittance/incentive/calculate
 */
remittanceIncentiveRouter.post("/v1/remittance/incentive/calculate", (req: Request, res: Response) => {
  try {
    const parse = calculateIncentiveSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const calculation = FreelancerIncentiveEngine.calculateIncentive({
      foreignCurrency: parse.data.foreignCurrency as ForeignCurrency,
      foreignAmount: parse.data.foreignAmount,
      exporterCategory: (parse.data.exporterCategory || "ict_freelancer_individual") as ExporterCategory,
      customExchangeRate: parse.data.customExchangeRate,
      channel: parse.data.channel as InwardChannel,
    });

    return res.status(200).json({
      success: true,
      calculation,
      ...calculation,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to calculate remittance incentive",
    });
  }
});

/**
 * GET /v1/remittance/rates
 */
remittanceIncentiveRouter.get("/v1/remittance/rates", (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    rates: OFFICIAL_FX_RATES,
    effectiveDate: new Date().toISOString().split("T")[0],
  });
});

/**
 * POST /v1/remittance/transactions/record
 */
remittanceIncentiveRouter.post("/v1/remittance/transactions/record", (req: Request, res: Response) => {
  try {
    const parse = recordRemittanceSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const record = FreelancerIncentiveEngine.recordRemittance({
      transactionRef: parse.data.transactionRef,
      channel: parse.data.channel as InwardChannel,
      sourceCountry: parse.data.sourceCountry,
      remitterName: parse.data.remitterName,
      beneficiaryName: parse.data.beneficiaryName,
      beneficiaryAccountNo: parse.data.beneficiaryAccountNo,
      beneficiaryBank: parse.data.beneficiaryBank,
      foreignCurrency: parse.data.foreignCurrency as ForeignCurrency,
      foreignAmount: parse.data.foreignAmount,
      exporterCategory: parse.data.exporterCategory as ExporterCategory,
      customExchangeRate: parse.data.customExchangeRate,
      purposeCode: parse.data.purposeCode,
    });

    return res.status(201).json({
      success: true,
      remittance: record,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to record remittance",
    });
  }
});

/**
 * GET /v1/remittance/transactions
 */
remittanceIncentiveRouter.get("/v1/remittance/transactions", (_req: Request, res: Response) => {
  try {
    const remittances = FreelancerIncentiveEngine.listRemittances();
    return res.status(200).json({
      success: true,
      count: remittances.length,
      remittances,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list remittances",
    });
  }
});

/**
 * POST /v1/remittance/form-c/generate
 */
remittanceIncentiveRouter.post("/v1/remittance/form-c/generate", (req: Request, res: Response) => {
  try {
    const parse = generateFormCSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const declaration = FreelancerIncentiveEngine.generateFormC({
      remittanceId: parse.data.remittanceId,
      beneficiaryName: parse.data.beneficiaryName,
      beneficiaryAccountNo: parse.data.beneficiaryAccountNo,
      beneficiaryNidOrPassport: parse.data.beneficiaryNidOrPassport,
      tinNumber: parse.data.tinNumber,
      freelancerIdOrBasisNo: parse.data.freelancerIdOrBasisNo,
      adBankName: parse.data.adBankName,
      adBranchName: parse.data.adBranchName,
      adRoutingNumber: parse.data.adRoutingNumber,
      foreignCurrency: parse.data.foreignCurrency as ForeignCurrency,
      foreignAmount: parse.data.foreignAmount,
      sendingCountry: parse.data.sendingCountry,
      remitterName: parse.data.remitterName,
      descriptionOfWork: parse.data.descriptionOfWork,
      exporterCategory: parse.data.exporterCategory as ExporterCategory,
    });

    return res.status(200).json({
      success: true,
      declaration,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate Form-C declaration",
    });
  }
});

/**
 * POST /v1/remittance/contracts/generate
 */
remittanceIncentiveRouter.post("/v1/remittance/contracts/generate", (req: Request, res: Response) => {
  try {
    const parse = generateContractSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map((e) => e.message).join(", "),
      });
    }

    const contract = FreelancerIncentiveEngine.generateEscrowContract({
      contractTitle: parse.data.contractTitle,
      clientName: parse.data.clientName,
      clientCountry: parse.data.clientCountry,
      freelancerName: parse.data.freelancerName,
      freelancerAddress: parse.data.freelancerAddress,
      scopeOfWork: parse.data.scopeOfWork,
      totalValueCurrency: parse.data.totalValueCurrency as ForeignCurrency,
      milestones: parse.data.milestones,
    });

    return res.status(201).json({
      success: true,
      contract,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate escrow contract",
    });
  }
});

/**
 * POST /v1/remittance/prc/reconcile
 */
remittanceIncentiveRouter.post("/v1/remittance/prc/reconcile", (req: Request, res: Response) => {
  try {
    const remittanceId = String(req.body.remittanceId || "");
    if (!remittanceId) {
      return res.status(400).json({ success: false, error: "remittanceId is required" });
    }

    const result = FreelancerIncentiveEngine.reconcilePrc(remittanceId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to reconcile PRC",
    });
  }
});
