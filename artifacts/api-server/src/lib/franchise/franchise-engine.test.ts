import { describe, it, expect } from "vitest";
import { FranchiseMultiBranchEngine } from "./franchise-engine.js";

describe("FranchiseMultiBranchEngine", () => {
  it("registers new franchise branches and lists stock matrix", () => {
    const branch = FranchiseMultiBranchEngine.registerBranch({
      branchId: "BRANCH_TEST_SYLHET",
      branchName: "Sylhet Zindabazar Outlet",
      territory: "Sylhet Metro",
      address: "Zindabazar Tower, Sylhet",
      managerName: "Mahbub Alom",
      managerPhone: "+8801755667788",
      subMerchantWallet: "+8801755667788",
      royaltyRatePct: 12,
      initialStock: {
        "SKU-PANJABI-BLK": 30,
        "SKU-EARBUDS-TWS": 50,
      },
    });

    expect(branch.branchId).toBe("BRANCH_TEST_SYLHET");
    expect(branch.royaltyRatePct).toBe(12);
    expect(branch.stockHoldings["SKU-PANJABI-BLK"]).toBe(30);

    const branches = FranchiseMultiBranchEngine.listBranches();
    expect(branches.some(b => b.branchId === "BRANCH_TEST_SYLHET")).toBe(true);
  });

  it("calculates 3-way commission split accurately upon franchise sale", () => {
    // Branch with 15% royalty
    const sale = FranchiseMultiBranchEngine.recordSale({
      branchId: "BRANCH_DHK_DHANMONDI",
      sku: "SKU-PANJABI-BLK",
      productName: "Royal Platinum Silk Panjabi",
      quantity: 2,
      unitCostPriceBdt: 1800,
      unitSellingPriceBdt: 3500,
      paymentMethod: "bkash_sub_merchant",
    });

    expect(sale.grossTotalBdt).toBe(7000); // 3500 * 2
    expect(sale.cogsTotalBdt).toBe(3600); // 1800 * 2
    expect(sale.grossProfitBdt).toBe(3400); // 7000 - 3600
    // Royalty 15% of 3400 = 510
    expect(sale.masterRoyaltyBdt).toBe(510);
    // Franchisee Net Profit = 3400 - 510 = 2890
    expect(sale.franchiseeNetProfitBdt).toBe(2890);

    const branch = FranchiseMultiBranchEngine.getBranch("BRANCH_DHK_DHANMONDI");
    expect(branch?.stockHoldings["SKU-PANJABI-BLK"]).toBe(43); // 45 - 2
    expect(branch?.totalRoyaltyOwedBdt).toBeGreaterThanOrEqual(510);
  });

  it("executes atomic Inter-Branch Stock Transfers (IBST) with OTP verification", () => {
    const srcBefore = FranchiseMultiBranchEngine.getBranch("BRANCH_DHK_CENTRAL")?.stockHoldings["SKU-CHARGER-65W"] || 0;
    const dstBefore = FranchiseMultiBranchEngine.getBranch("BRANCH_DHK_DHANMONDI")?.stockHoldings["SKU-CHARGER-65W"] || 0;

    const transfer = FranchiseMultiBranchEngine.initiateTransfer({
      sku: "SKU-CHARGER-65W",
      productName: "65W GaN Fast Charger",
      quantity: 50,
      sourceBranchId: "BRANCH_DHK_CENTRAL",
      destinationBranchId: "BRANCH_DHK_DHANMONDI",
      courierProvider: "internal_van",
    });

    expect(transfer.status).toBe("in_transit");
    expect(transfer.verificationCode).toBeDefined();

    // Source stock immediately decremented
    const srcAfter = FranchiseMultiBranchEngine.getBranch("BRANCH_DHK_CENTRAL")?.stockHoldings["SKU-CHARGER-65W"] || 0;
    expect(srcAfter).toBe(srcBefore - 50);

    // Destination stock not yet incremented
    const dstMid = FranchiseMultiBranchEngine.getBranch("BRANCH_DHK_DHANMONDI")?.stockHoldings["SKU-CHARGER-65W"] || 0;
    expect(dstMid).toBe(dstBefore);

    // Receive transfer with verification code
    const receiveRes = FranchiseMultiBranchEngine.receiveTransfer({
      transferId: transfer.transferId,
      verificationCode: transfer.verificationCode,
    });

    expect(receiveRes.success).toBe(true);
    expect(receiveRes.transfer?.status).toBe("received");

    // Destination stock incremented
    const dstAfter = FranchiseMultiBranchEngine.getBranch("BRANCH_DHK_DHANMONDI")?.stockHoldings["SKU-CHARGER-65W"] || 0;
    expect(dstAfter).toBe(dstBefore + 50);
  });

  it("handles bKash sub-merchant royalty settlement disbursements", () => {
    const branch = FranchiseMultiBranchEngine.getBranch("BRANCH_DHK_DHANMONDI");
    expect(branch).toBeDefined();
    if (!branch) return;

    const owed = branch.totalRoyaltyOwedBdt - branch.totalRoyaltyPaidBdt;
    if (owed > 0) {
      const disb = FranchiseMultiBranchEngine.disburseSettlement({
        branchId: "BRANCH_DHK_DHANMONDI",
        amountBdt: owed,
      });

      expect(disb.amountBdt).toBe(owed);
      expect(disb.mfsTrxId).toBeDefined();
      expect(disb.status).toBe("completed");
      expect(branch.totalRoyaltyPaidBdt).toBe(branch.totalRoyaltyOwedBdt);
    }
  });
});
