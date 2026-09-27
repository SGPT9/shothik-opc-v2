import { describe, it, expect } from "vitest";
import {
  DeedVerificationEngine,
  DeedTransferRecord,
  MutationChecklist,
  TitleDeedInfo,
} from "../deed-verification-engine.js";

describe("Slice 79: DeedVerificationEngine (Unit Tests)", () => {
  describe("AC-1: Area Unit Conversion", () => {
    it("converts 1 shatangsho (decimal) accurately to other units", () => {
      const res = DeedVerificationEngine.convertLandArea(1, "shatangsho");
      expect(res.shatangsho).toBe(1);
      expect(res.sqft).toBe(435.6);
      expect(res.acre).toBe(0.01);
      expect(res.katha).toBeCloseTo(0.605, 3);
    });

    it("converts 1 katha (720 sqft) accurately", () => {
      const res = DeedVerificationEngine.convertLandArea(1, "katha");
      expect(res.sqft).toBe(720);
      expect(res.shatangsho).toBeCloseTo(1.6529, 3);
      expect(res.chhotak).toBe(16);
    });

    it("converts 1 bigha (20 katha / 14,400 sqft) accurately", () => {
      const res = DeedVerificationEngine.convertLandArea(1, "bigha");
      expect(res.sqft).toBe(14400);
      expect(res.katha).toBe(20);
      expect(res.shatangsho).toBeCloseTo(33.0579, 3);
    });

    it("converts 1 acre (100 shatangsho / 43,560 sqft) accurately", () => {
      const res = DeedVerificationEngine.convertLandArea(1, "acre");
      expect(res.sqft).toBe(43560);
      expect(res.shatangsho).toBe(100);
      expect(res.bigha).toBeCloseTo(3.025, 3);
    });

    it("throws an error for negative land area values", () => {
      expect(() => DeedVerificationEngine.convertLandArea(-5, "katha")).toThrow(
        "Land area value cannot be negative"
      );
    });
  });

  describe("AC-3: Statutory Registration & Stamp Duty Calculator", () => {
    it("calculates fees for Dhaka City commercial land transaction (8% AIT)", () => {
      const fees = DeedVerificationEngine.calculateRegistrationFees({
        considerationBdt: 10_000_000, // 1 Crore BDT
        jurisdiction: "dhaka_city",
        propertyType: "commercial",
      });

      expect(fees.considerationBdt).toBe(10_000_000);
      expect(fees.registrationFeeBdt).toBe(100_000); // 1%
      expect(fees.stampDutyBdt).toBe(150_000); // 1.5%
      expect(fees.localGovtTaxBdt).toBe(300_000); // 3%
      expect(fees.sourceTaxAitBdt).toBe(800_000); // 8% Section 53FF
      expect(fees.eGovernanceFeeBdt).toBe(240);
      expect(fees.nFeeBdt).toBe(300);
      expect(fees.affidavitFeeBdt).toBe(300);
      expect(fees.totalGovtFeesBdt).toBe(1_350_840);
      expect(fees.effectiveTaxPercentage).toBeCloseTo(13.51, 2);
    });

    it("calculates fees for Union Parishad rural agricultural land (2% AIT, 2% local govt)", () => {
      const fees = DeedVerificationEngine.calculateRegistrationFees({
        considerationBdt: 1_000_000, // 10 Lakh BDT
        jurisdiction: "union_parishad",
        propertyType: "agricultural",
      });

      expect(fees.registrationFeeBdt).toBe(10_000); // 1%
      expect(fees.stampDutyBdt).toBe(15_000); // 1.5%
      expect(fees.localGovtTaxBdt).toBe(20_000); // 2%
      expect(fees.sourceTaxAitBdt).toBe(20_000); // 2%
      expect(fees.totalGovtFeesBdt).toBe(65_840);
      expect(fees.effectiveTaxPercentage).toBeCloseTo(6.58, 2);
    });

    it("enforces minimum registration fee of 100 BDT for nominal transactions", () => {
      const fees = DeedVerificationEngine.calculateRegistrationFees({
        considerationBdt: 5_000,
        jurisdiction: "pourashava",
        propertyType: "residential",
      });

      expect(fees.registrationFeeBdt).toBe(100);
    });
  });

  describe("AC-2: Chain-of-Ownership (বায়া দলিল) Sequence Auditor", () => {
    it("certifies a clean unbroken title chain from CS to Current Deed", () => {
      const chain: DeedTransferRecord[] = [
        {
          deedNumber: "CS-1940-001",
          deedDate: "1940-01-15",
          surveyType: "CS",
          transferor: "Rahim Ullah",
          transferee: "Kader Mia",
          transactedAreaShatangsho: 10,
          hasOriginalDocument: true,
        },
        {
          deedNumber: "SA-1962-045",
          deedDate: "1962-05-20",
          surveyType: "SA",
          transferor: "Kader Mia",
          transferee: "Zabbar Ali",
          transactedAreaShatangsho: 10,
          hasOriginalDocument: true,
        },
        {
          deedNumber: "RS-1988-112",
          deedDate: "1988-11-10",
          surveyType: "RS",
          transferor: "Zabbar Ali",
          transferee: "Farhana Begum",
          transactedAreaShatangsho: 10,
          hasOriginalDocument: true,
        },
        {
          deedNumber: "DEED-2024-998",
          deedDate: "2024-03-01",
          surveyType: "Current_Deed",
          transferor: "Farhana Begum",
          transferee: "Tanvir Ahmed",
          transactedAreaShatangsho: 10,
          hasOriginalDocument: true,
        },
      ];

      const result = DeedVerificationEngine.auditChainOfOwnership(chain, 15);
      expect(result.isValid).toBe(true);
      expect(result.riskLevel).toBe("LOW");
      expect(result.confidenceScore).toBe(100);
      expect(result.anomalies.length).toBe(0);
      expect(result.titleSeal).toBeDefined();
    });

    it("flags broken grantor-grantee chain where seller does not match prior buyer", () => {
      const chain: DeedTransferRecord[] = [
        {
          deedNumber: "CS-1950",
          deedDate: "1950-02-10",
          surveyType: "CS",
          transferor: "Monirul Islam",
          transferee: "Abul Kashem",
          transactedAreaShatangsho: 5,
          hasOriginalDocument: true,
        },
        {
          deedNumber: "RS-1990",
          deedDate: "1990-06-15",
          surveyType: "RS",
          transferor: "Different Person Unknown", // Broken link!
          transferee: "Shumon Mahmud",
          transactedAreaShatangsho: 5,
          hasOriginalDocument: true,
        },
      ];

      const result = DeedVerificationEngine.auditChainOfOwnership(chain);
      expect(result.isValid).toBe(false);
      expect(result.anomalies.some((a) => a.includes("Broken Linkage"))).toBe(true);
      expect(result.confidenceScore).toBeLessThan(100);
    });

    it("detects over-allocation where transacted parcel exceeds parent Daag area", () => {
      const chain: DeedTransferRecord[] = [
        {
          deedNumber: "DEED-2023-01",
          deedDate: "2023-01-01",
          surveyType: "Current_Deed",
          transferor: "A",
          transferee: "B",
          transactedAreaShatangsho: 25,
          hasOriginalDocument: true,
        },
      ];

      const result = DeedVerificationEngine.auditChainOfOwnership(chain, 20); // Parent daag only 20
      expect(result.anomalies.some((a) => a.includes("Over-Allocation"))).toBe(true);
      expect(result.confidenceScore).toBeLessThanOrEqual(60);
    });

    it("returns critical risk for empty chain", () => {
      const result = DeedVerificationEngine.auditChainOfOwnership([]);
      expect(result.isValid).toBe(false);
      expect(result.riskLevel).toBe("CRITICAL");
    });
  });

  describe("AC-4: E-Mutation Readiness Screener", () => {
    it("returns READY with 100% score when all documents are present", () => {
      const checklist: MutationChecklist = {
        originalDeed: true,
        bayaDeedsComplete: true,
        rsKhatianPorcha: true,
        bsCityKhatianPorcha: true,
        dakhilaPaidCurrentYear: true,
        warishanCertificateIfApplicable: true,
        nidCopiesVerified: true,
        mouzaMapTraceAvailable: true,
      };

      const result = DeedVerificationEngine.evaluateMutationReadiness(checklist);
      expect(result.readinessScorePercent).toBe(100);
      expect(result.status).toBe("READY");
      expect(result.missingRequirements.length).toBe(0);
      expect(result.recommendations.length).toBe(0);
    });

    it("flags missing mandatory documents and provides actionable filing recommendations", () => {
      const checklist: MutationChecklist = {
        originalDeed: true, // 25
        bayaDeedsComplete: false, // Missing (20)
        rsKhatianPorcha: true, // 15
        bsCityKhatianPorcha: true, // 15
        dakhilaPaidCurrentYear: false, // Missing (10)
        warishanCertificateIfApplicable: false,
        nidCopiesVerified: true, // 5
        mouzaMapTraceAvailable: false,
      };

      const result = DeedVerificationEngine.evaluateMutationReadiness(checklist);
      expect(result.status).toBe("ACTION_REQUIRED");
      expect(result.readinessScorePercent).toBe(60); // 25 + 15 + 15 + 5 = 60
      expect(result.missingRequirements).toContain(
        "ধারাবাহিক বায়া দলিল (Chain/Baya Deeds)"
      );
      expect(result.missingRequirements).toContain(
        "চলতি অর্থবছর পর্যন্ত দাখিলা (Updated Land Tax / Dakhila)"
      );
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("AC-5: Cryptographic Title Search Audit Seal", () => {
    it("generates deterministic SHA-256 seal and verification QR link", () => {
      const deedInfo: TitleDeedInfo = {
        mouza: "Tejgaon",
        jlNumber: "56",
        upazila: "Tejgaon",
        district: "Dhaka",
        khatianNumber: "4502",
        daagNumber: "1284",
        landAreaShatangsho: 5.5,
        currentOwner: "Mohammad Hossain",
        deedNumber: "REG-2024-8877",
        considerationBdt: 12_500_000,
      };

      const seal = DeedVerificationEngine.generateTitleAuditSeal(deedInfo);
      expect(seal.certificateNumber).toMatch(/^SHOTHIK_LAND_DHA_/);
      expect(seal.sealHash).toHaveLength(64);
      expect(seal.qrPayload).toContain("https://shothik.ai/verify/land-record/");
      expect(seal.timestamp).toBeDefined();
    });
  });
});
