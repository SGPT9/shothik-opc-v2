import { describe, it, expect } from "vitest";
import { FreelancerIncentiveEngine } from "./freelancer-incentive-engine.js";

describe("FreelancerIncentiveEngine (freelancer-incentive-engine.ts)", () => {
  it("calculates 4% statutory cash subsidy for individual ICT freelancer correctly", () => {
    const calc = FreelancerIncentiveEngine.calculateIncentive({
      foreignCurrency: "USD",
      foreignAmount: 2000,
      exporterCategory: "ict_freelancer_individual",
      customExchangeRate: 122.50,
    });

    expect(calc.grossAmountBdt).toBe(245000); // 2000 * 122.50
    expect(calc.incentivePercent).toBe(4.0);
    expect(calc.incentiveAmountBdt).toBe(9800); // 245000 * 4%
    expect(calc.sourceTaxBdt).toBe(0); // 0% tax holiday
    expect(calc.netDisbursedBdt).toBe(254550); // 245000 + 9800 - 250 fee
  });

  it("calculates 10% statutory cash subsidy for BASIS registered IT exporter", () => {
    const calc = FreelancerIncentiveEngine.calculateIncentive({
      foreignCurrency: "EUR",
      foreignAmount: 5000,
      exporterCategory: "basis_registered_it_firm",
      customExchangeRate: 130.00,
    });

    expect(calc.grossAmountBdt).toBe(650000); // 5000 * 130
    expect(calc.incentivePercent).toBe(10.0);
    expect(calc.incentiveAmountBdt).toBe(65000); // 650000 * 10%
    expect(calc.netDisbursedBdt).toBe(714750); // 650000 + 65000 - 250
  });

  it("records new inward remittance and generates Form-C reference", () => {
    const record = FreelancerIncentiveEngine.recordRemittance({
      transactionRef: "FT_TEST_99014",
      channel: "wise",
      sourceCountry: "United Kingdom",
      remitterName: "DevCraft Studio Ltd.",
      beneficiaryName: "Shothik Freelance Ops",
      beneficiaryAccountNo: "1102938475601",
      beneficiaryBank: "City Bank PLC",
      foreignCurrency: "GBP",
      foreignAmount: 1500,
      exporterCategory: "ict_freelancer_individual",
    });

    expect(record.remittanceId).toMatch(/^REM_WIS_/);
    expect(record.grossAmountBdt).toBeGreaterThan(0);
    expect(record.incentiveAmountBdt).toBeGreaterThan(0);
    expect(record.formCNumber).toMatch(/^FC-BB-/);
    expect(record.auditHash).toBeDefined();
  });

  it("generates verified Bangladesh Bank Form-C declaration with SHA-256 seal", () => {
    const formC = FreelancerIncentiveEngine.generateFormC({
      beneficiaryName: "Kazi Nazrul",
      beneficiaryAccountNo: "1234567890",
      beneficiaryNidOrPassport: "1994269104882190",
      tinNumber: "789123456712",
      freelancerIdOrBasisNo: "FL-ICT-88210",
      adBankName: "BRAC Bank PLC",
      adBranchName: "Banani Branch",
      adRoutingNumber: "060260481",
      foreignCurrency: "USD",
      foreignAmount: 3000,
      sendingCountry: "United States",
      remitterName: "Silicon Cloud Inc.",
      descriptionOfWork: "Fullstack React & Next.js Web App Development",
      exporterCategory: "ict_freelancer_individual",
    });

    expect(formC.declarationId).toMatch(/^DECL_FC_/);
    expect(formC.purposeOfInward.bopCategory).toContain("9801");
    expect(formC.verificationSeal.signature).toHaveLength(64);
    expect(formC.statutoryIncentiveClaimed.claimedAmountBdt).toBe(14700); // 3000 * 122.50 = 367,500 * 4%
  });

  it("generates milestone escrow contract with integrity hash", () => {
    const contract = FreelancerIncentiveEngine.generateEscrowContract({
      contractTitle: "Enterprise SaaS API Gateway",
      clientName: "Global FinTech Corp",
      clientCountry: "Singapore",
      freelancerName: "Tanvir Ahmed",
      freelancerAddress: "Dhaka, Bangladesh",
      scopeOfWork: ["Architecture Design", "API Implementation", "Integration Testing"],
      totalValueCurrency: "USD",
      milestones: [
        { title: "Milestone 1 - Swagger & DB Schema", amount: 1000 },
        { title: "Milestone 2 - Core Microservices", amount: 2000 },
        { title: "Milestone 3 - Staging Deployment", amount: 1000 },
      ],
    });

    expect(contract.contractId).toMatch(/^CTR_ESCROW_/);
    expect(contract.totalValueAmount).toBe(4000);
    expect(contract.milestones).toHaveLength(3);
    expect(contract.contractHash).toHaveLength(64);
  });
});
