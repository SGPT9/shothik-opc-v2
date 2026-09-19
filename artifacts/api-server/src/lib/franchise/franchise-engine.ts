/**
 * Shothik Multi-Tenant Franchise & Multi-Branch Stock Allocation Engine
 * 
 * Capabilities:
 * 1. Multi-Branch Inventory Matrix & Stock Rebalancing
 * 2. Deterministic 3-Way Commission Split (COGS + Central Royalty % + Franchisee Net Profit Margin)
 * 3. Inter-Branch Stock Transfers (IBST) with Verification Code confirmation
 * 4. Decentralized bKash / Nagad Sub-Merchant Settlement Ledger
 */

import crypto from "crypto";
import { logger } from "../logger.js";

export type BranchType = "central_hub" | "franchise_outlet" | "regional_warehouse" | "pop_up";

export interface FranchiseBranch {
  branchId: string;
  branchName: string;
  territory: string;
  address: string;
  type: BranchType;
  managerName: string;
  managerPhone: string;
  subMerchantWallet: string;
  royaltyRatePct: number;
  status: "active" | "inactive" | "suspended";
  stockHoldings: Record<string, number>; // sku -> quantity
  totalSalesVolumeBdt: number;
  totalRoyaltyOwedBdt: number;
  totalRoyaltyPaidBdt: number;
}

export interface InterBranchTransfer {
  transferId: string;
  sku: string;
  productName: string;
  quantity: number;
  sourceBranchId: string;
  sourceBranchName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  status: "pending_dispatch" | "in_transit" | "received" | "rejected";
  courierProvider: "internal_van" | "steadfast" | "pathao_courier";
  trackingCode?: string;
  verificationCode: string;
  initiatedAt: string;
  completedAt?: string;
  notes?: string;
}

export interface FranchiseSaleRecord {
  saleId: string;
  branchId: string;
  branchName: string;
  sku: string;
  productName: string;
  quantity: number;
  unitCostPriceBdt: number;
  unitSellingPriceBdt: number;
  grossTotalBdt: number;
  cogsTotalBdt: number;
  grossProfitBdt: number;
  masterRoyaltyBdt: number;
  franchiseeNetProfitBdt: number;
  paymentMethod: "cash_pos" | "bkash_sub_merchant" | "nagad" | "card";
  recordedAt: string;
}

export interface SettlementDisbursement {
  disbursementId: string;
  branchId: string;
  branchName: string;
  amountBdt: number;
  recipientWallet: string;
  mfsTrxId: string;
  disbursedAt: string;
  status: "completed" | "failed";
}

export class FranchiseMultiBranchEngine {
  private static branches = new Map<string, FranchiseBranch>();
  private static transfers = new Map<string, InterBranchTransfer>();
  private static sales = new Map<string, FranchiseSaleRecord>();
  private static settlements = new Map<string, SettlementDisbursement>();

  static {
    // Seed standard Central Hub & Franchise Nodes
    this.registerBranch({
      branchId: "BRANCH_DHK_CENTRAL",
      branchName: "Tejgaon Central Fulfillment Hub",
      territory: "Dhaka Central",
      address: "128/A Tejgaon I/A, Dhaka-1208",
      type: "central_hub",
      managerName: "Master Operations Lead",
      managerPhone: "+8801700000001",
      subMerchantWallet: "+8801700000001",
      royaltyRatePct: 0,
      initialStock: {
        "SKU-PANJABI-BLK": 500,
        "SKU-EARBUDS-TWS": 1200,
        "SKU-CHARGER-65W": 800,
        "SKU-SAREE-SILK": 350,
      },
    });

    this.registerBranch({
      branchId: "BRANCH_DHK_DHANMONDI",
      branchName: "Dhanmondi 27 Outlet",
      territory: "Dhaka West",
      address: "House 14, Road 27, Dhanmondi, Dhaka",
      type: "franchise_outlet",
      managerName: "Tanvir Hossain",
      managerPhone: "+8801711223344",
      subMerchantWallet: "+8801711223344",
      royaltyRatePct: 15,
      initialStock: {
        "SKU-PANJABI-BLK": 45,
        "SKU-EARBUDS-TWS": 80,
        "SKU-CHARGER-65W": 30,
        "SKU-SAREE-SILK": 18,
      },
    });

    this.registerBranch({
      branchId: "BRANCH_DHK_BANANI",
      branchName: "Banani Road 11 Boutique",
      territory: "Dhaka North",
      address: "Plot 52, Road 11, Block D, Banani, Dhaka",
      type: "franchise_outlet",
      managerName: "Nusrat Jahan",
      managerPhone: "+8801822334455",
      subMerchantWallet: "+8801822334455",
      royaltyRatePct: 18,
      initialStock: {
        "SKU-PANJABI-BLK": 60,
        "SKU-EARBUDS-TWS": 40,
        "SKU-CHARGER-65W": 25,
        "SKU-SAREE-SILK": 35,
      },
    });

    this.registerBranch({
      branchId: "BRANCH_CTG_GEC",
      branchName: "Chittagong GEC Circle Node",
      territory: "Chittagong Metro",
      address: "GEC Circle, CDA Avenue, Chittagong",
      type: "regional_warehouse",
      managerName: "Farhan Karim",
      managerPhone: "+8801844556677",
      subMerchantWallet: "+8801844556677",
      royaltyRatePct: 12,
      initialStock: {
        "SKU-PANJABI-BLK": 85,
        "SKU-EARBUDS-TWS": 150,
        "SKU-CHARGER-65W": 90,
        "SKU-SAREE-SILK": 40,
      },
    });
  }

  /**
   * Registers a new franchise outlet or warehouse node
   */
  public static registerBranch(params: {
    branchId?: string;
    branchName: string;
    territory: string;
    address: string;
    type?: BranchType;
    managerName: string;
    managerPhone: string;
    subMerchantWallet: string;
    royaltyRatePct: number;
    initialStock?: Record<string, number>;
  }): FranchiseBranch {
    const branchId = params.branchId || `BRANCH_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const branch: FranchiseBranch = {
      branchId,
      branchName: params.branchName,
      territory: params.territory,
      address: params.address,
      type: params.type || "franchise_outlet",
      managerName: params.managerName,
      managerPhone: params.managerPhone,
      subMerchantWallet: params.subMerchantWallet,
      royaltyRatePct: params.royaltyRatePct,
      status: "active",
      stockHoldings: params.initialStock || {},
      totalSalesVolumeBdt: 0,
      totalRoyaltyOwedBdt: 0,
      totalRoyaltyPaidBdt: 0,
    };

    this.branches.set(branchId, branch);
    logger.info({ branchId, branchName: branch.branchName }, "[franchise] Registered franchise branch node");
    return branch;
  }

  /**
   * Lists all branches
   */
  public static listBranches(): FranchiseBranch[] {
    return Array.from(this.branches.values());
  }

  /**
   * Retrieves a specific branch
   */
  public static getBranch(branchId: string): FranchiseBranch | undefined {
    return this.branches.get(branchId);
  }

  /**
   * Records a franchise point-of-sale transaction with 3-way commission split
   */
  public static recordSale(params: {
    branchId: string;
    sku: string;
    productName: string;
    quantity: number;
    unitCostPriceBdt: number;
    unitSellingPriceBdt: number;
    paymentMethod?: "cash_pos" | "bkash_sub_merchant" | "nagad" | "card";
  }): FranchiseSaleRecord {
    const branch = this.branches.get(params.branchId);
    if (!branch) {
      throw new Error(`Branch ${params.branchId} not found`);
    }

    const currentStock = branch.stockHoldings[params.sku] || 0;
    if (currentStock < params.quantity) {
      throw new Error(`Insufficient stock for SKU ${params.sku} at ${branch.branchName}. Available: ${currentStock}, Requested: ${params.quantity}`);
    }

    // Decrement stock
    branch.stockHoldings[params.sku] = currentStock - params.quantity;

    // Financial calculations
    const grossTotalBdt = params.unitSellingPriceBdt * params.quantity;
    const cogsTotalBdt = params.unitCostPriceBdt * params.quantity;
    const grossProfitBdt = Math.max(0, grossTotalBdt - cogsTotalBdt);
    
    // Master brand royalty calculation
    const masterRoyaltyBdt = Math.round(grossProfitBdt * (branch.royaltyRatePct / 100));
    const franchiseeNetProfitBdt = grossProfitBdt - masterRoyaltyBdt;

    // Update branch metrics
    branch.totalSalesVolumeBdt += grossTotalBdt;
    branch.totalRoyaltyOwedBdt += masterRoyaltyBdt;

    const saleId = `SALE_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const record: FranchiseSaleRecord = {
      saleId,
      branchId: params.branchId,
      branchName: branch.branchName,
      sku: params.sku,
      productName: params.productName,
      quantity: params.quantity,
      unitCostPriceBdt: params.unitCostPriceBdt,
      unitSellingPriceBdt: params.unitSellingPriceBdt,
      grossTotalBdt,
      cogsTotalBdt,
      grossProfitBdt,
      masterRoyaltyBdt,
      franchiseeNetProfitBdt,
      paymentMethod: params.paymentMethod || "bkash_sub_merchant",
      recordedAt: new Date().toISOString(),
    };

    this.sales.set(saleId, record);
    logger.info({ saleId, branchId: params.branchId, gross: grossTotalBdt, royalty: masterRoyaltyBdt }, "[franchise] Sale recorded and commission split executed");
    return record;
  }

  /**
   * Lists sales records
   */
  public static listSales(branchId?: string): FranchiseSaleRecord[] {
    const list = Array.from(this.sales.values());
    if (branchId) {
      return list.filter(s => s.branchId === branchId);
    }
    return list;
  }

  /**
   * Initiates an Inter-Branch Stock Transfer (IBST)
   */
  public static initiateTransfer(params: {
    sku: string;
    productName: string;
    quantity: number;
    sourceBranchId: string;
    destinationBranchId: string;
    courierProvider?: "internal_van" | "steadfast" | "pathao_courier";
    notes?: string;
  }): InterBranchTransfer {
    const src = this.branches.get(params.sourceBranchId);
    const dst = this.branches.get(params.destinationBranchId);

    if (!src) throw new Error(`Source branch ${params.sourceBranchId} not found`);
    if (!dst) throw new Error(`Destination branch ${params.destinationBranchId} not found`);
    if (params.sourceBranchId === params.destinationBranchId) {
      throw new Error("Source and destination branches cannot be the same");
    }

    const currentSrcStock = src.stockHoldings[params.sku] || 0;
    if (currentSrcStock < params.quantity) {
      throw new Error(`Source branch ${src.branchName} has insufficient stock for SKU ${params.sku}. Available: ${currentSrcStock}, Requested: ${params.quantity}`);
    }

    // Atomic decrement at source
    src.stockHoldings[params.sku] = currentSrcStock - params.quantity;

    const transferId = `IBST_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP

    const transfer: InterBranchTransfer = {
      transferId,
      sku: params.sku,
      productName: params.productName,
      quantity: params.quantity,
      sourceBranchId: params.sourceBranchId,
      sourceBranchName: src.branchName,
      destinationBranchId: params.destinationBranchId,
      destinationBranchName: dst.branchName,
      status: "in_transit",
      courierProvider: params.courierProvider || "internal_van",
      trackingCode: `TRX-IBST-${transferId.slice(-6)}`,
      verificationCode,
      initiatedAt: new Date().toISOString(),
      notes: params.notes,
    };

    this.transfers.set(transferId, transfer);
    logger.info({ transferId, sku: params.sku, qty: params.quantity, from: src.branchName, to: dst.branchName }, "[franchise] Inter-branch transfer initiated");
    return transfer;
  }

  /**
   * Receives and verifies stock at the destination branch
   */
  public static receiveTransfer(params: {
    transferId: string;
    verificationCode: string;
  }): { success: boolean; transfer?: InterBranchTransfer; message: string } {
    const transfer = this.transfers.get(params.transferId);
    if (!transfer) {
      return { success: false, message: `Transfer ${params.transferId} not found` };
    }

    if (transfer.status !== "in_transit") {
      return { success: false, message: `Transfer is ${transfer.status} and cannot be received` };
    }

    if (transfer.verificationCode !== params.verificationCode) {
      return { success: false, message: "Invalid verification code" };
    }

    const dst = this.branches.get(transfer.destinationBranchId);
    if (!dst) {
      return { success: false, message: `Destination branch ${transfer.destinationBranchId} not found` };
    }

    // Atomic increment at destination
    dst.stockHoldings[transfer.sku] = (dst.stockHoldings[transfer.sku] || 0) + transfer.quantity;
    transfer.status = "received";
    transfer.completedAt = new Date().toISOString();

    logger.info({ transferId: params.transferId, destination: dst.branchName }, "[franchise] Transfer received and verified");
    return {
      success: true,
      transfer,
      message: `Stock transfer received successfully at ${dst.branchName}!`,
    };
  }

  /**
   * Lists all inter-branch stock transfers
   */
  public static listTransfers(): InterBranchTransfer[] {
    return Array.from(this.transfers.values());
  }

  /**
   * Disburses bKash sub-merchant royalty payout
   */
  public static disburseSettlement(params: {
    branchId: string;
    amountBdt: number;
  }): SettlementDisbursement {
    const branch = this.branches.get(params.branchId);
    if (!branch) throw new Error(`Branch ${params.branchId} not found`);

    const outstandingRoyalty = branch.totalRoyaltyOwedBdt - branch.totalRoyaltyPaidBdt;
    if (params.amountBdt > outstandingRoyalty) {
      throw new Error(`Disbursement amount (৳${params.amountBdt}) exceeds outstanding royalty (৳${outstandingRoyalty})`);
    }

    branch.totalRoyaltyPaidBdt += params.amountBdt;

    const disbursementId = `DISB_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const mfsTrxId = `BK_TRX_${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

    const disbursement: SettlementDisbursement = {
      disbursementId,
      branchId: params.branchId,
      branchName: branch.branchName,
      amountBdt: params.amountBdt,
      recipientWallet: branch.subMerchantWallet,
      mfsTrxId,
      disbursedAt: new Date().toISOString(),
      status: "completed",
    };

    this.settlements.set(disbursementId, disbursement);
    logger.info({ disbursementId, branch: branch.branchName, amt: params.amountBdt }, "[franchise] Royalty payout disbursed");
    return disbursement;
  }
}
