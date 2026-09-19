import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  FranchiseMultiBranchEngine,
  type BranchType,
} from "../lib/franchise/franchise-engine.js";

export const franchiseRouter = Router();

const createBranchSchema = z.object({
  branchName: z.string().min(1, "branchName is required"),
  territory: z.string().min(1, "territory is required"),
  address: z.string().min(1, "address is required"),
  type: z.enum(["central_hub", "franchise_outlet", "regional_warehouse", "pop_up"]).optional().default("franchise_outlet"),
  managerName: z.string().min(1, "managerName is required"),
  managerPhone: z.string().min(1, "managerPhone is required"),
  subMerchantWallet: z.string().min(1, "subMerchantWallet is required"),
  royaltyRatePct: z.number().nonnegative().max(100),
  initialStock: z.record(z.number().int().nonnegative()).optional(),
});

const recordSaleSchema = z.object({
  branchId: z.string().min(1, "branchId is required"),
  sku: z.string().min(1, "sku is required"),
  productName: z.string().min(1, "productName is required"),
  quantity: z.number().int().positive("quantity must be positive"),
  unitCostPriceBdt: z.number().nonnegative(),
  unitSellingPriceBdt: z.number().positive(),
  paymentMethod: z.enum(["cash_pos", "bkash_sub_merchant", "nagad", "card"]).optional().default("bkash_sub_merchant"),
});

const initiateTransferSchema = z.object({
  sku: z.string().min(1, "sku is required"),
  productName: z.string().min(1, "productName is required"),
  quantity: z.number().int().positive("quantity must be positive"),
  sourceBranchId: z.string().min(1, "sourceBranchId is required"),
  destinationBranchId: z.string().min(1, "destinationBranchId is required"),
  courierProvider: z.enum(["internal_van", "steadfast", "pathao_courier"]).optional().default("internal_van"),
  notes: z.string().optional(),
});

const receiveTransferSchema = z.object({
  transferId: z.string().min(1, "transferId is required"),
  verificationCode: z.string().min(1, "verificationCode is required"),
});

const disburseSettlementSchema = z.object({
  branchId: z.string().min(1, "branchId is required"),
  amountBdt: z.number().positive("amountBdt must be positive"),
});

/**
 * GET /v1/franchise/branches
 */
franchiseRouter.get("/v1/franchise/branches", (_req: Request, res: Response) => {
  try {
    const branches = FranchiseMultiBranchEngine.listBranches();
    return res.status(200).json({
      success: true,
      count: branches.length,
      branches,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list franchise branches",
    });
  }
});

/**
 * POST /v1/franchise/branches/create
 */
franchiseRouter.post("/v1/franchise/branches/create", (req: Request, res: Response) => {
  try {
    const parse = createBranchSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const branch = FranchiseMultiBranchEngine.registerBranch(parse.data);
    return res.status(201).json({
      success: true,
      branch,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to create franchise branch",
    });
  }
});

/**
 * POST /v1/franchise/sales/record
 */
franchiseRouter.post("/v1/franchise/sales/record", (req: Request, res: Response) => {
  try {
    const parse = recordSaleSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const sale = FranchiseMultiBranchEngine.recordSale(parse.data);
    return res.status(201).json({
      success: true,
      sale,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error?.message || "Failed to record franchise sale",
    });
  }
});

/**
 * GET /v1/franchise/sales/ledger
 */
franchiseRouter.get("/v1/franchise/sales/ledger", (req: Request, res: Response) => {
  try {
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    const sales = FranchiseMultiBranchEngine.listSales(branchId);
    return res.status(200).json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to retrieve sales ledger",
    });
  }
});

/**
 * POST /v1/franchise/transfers/initiate
 */
franchiseRouter.post("/v1/franchise/transfers/initiate", (req: Request, res: Response) => {
  try {
    const parse = initiateTransferSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const transfer = FranchiseMultiBranchEngine.initiateTransfer(parse.data);
    return res.status(201).json({
      success: true,
      transfer,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error?.message || "Failed to initiate stock transfer",
    });
  }
});

/**
 * POST /v1/franchise/transfers/receive
 */
franchiseRouter.post("/v1/franchise/transfers/receive", (req: Request, res: Response) => {
  try {
    const parse = receiveTransferSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const result = FranchiseMultiBranchEngine.receiveTransfer(parse.data);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to receive transfer",
    });
  }
});

/**
 * GET /v1/franchise/transfers
 */
franchiseRouter.get("/v1/franchise/transfers", (_req: Request, res: Response) => {
  try {
    const transfers = FranchiseMultiBranchEngine.listTransfers();
    return res.status(200).json({
      success: true,
      count: transfers.length,
      transfers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to list stock transfers",
    });
  }
});

/**
 * POST /v1/franchise/settlement/disburse
 */
franchiseRouter.post("/v1/franchise/settlement/disburse", (req: Request, res: Response) => {
  try {
    const parse = disburseSettlementSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        error: parse.error.errors.map(e => e.message).join(", "),
      });
    }

    const disbursement = FranchiseMultiBranchEngine.disburseSettlement(parse.data);
    return res.status(200).json({
      success: true,
      disbursement,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error?.message || "Failed to disburse royalty settlement",
    });
  }
});
