import { Router, Request, Response } from "express";
import { z } from "zod";
import {
  DeedVerificationEngine,
  LandUnit,
  LandJurisdiction,
  LandPropertyType,
  SurveySurveyType,
} from "../lib/land-registry/deed-verification-engine.js";

export const landRegistryRouter = Router();

const convertAreaSchema = z.object({
  value: z.number().min(0, "Land area value cannot be negative"),
  fromUnit: z.enum([
    "shatangsho",
    "katha",
    "bigha",
    "chhotak",
    "acre",
    "sqft",
    "sqmeter",
  ]),
});

const calculateFeesSchema = z.object({
  considerationBdt: z.number().min(0, "Consideration value cannot be negative"),
  jurisdiction: z.enum([
    "dhaka_city",
    "chattogram_city",
    "pourashava",
    "union_parishad",
  ]),
  propertyType: z.enum(["commercial", "residential", "agricultural"]),
  mouzaRateBdtPerDecimal: z.number().optional(),
  landAreaShatangsho: z.number().optional(),
});

const deedTransferSchema = z.object({
  deedNumber: z.string().min(1, "Deed number is required"),
  deedDate: z.string().min(1, "Deed date is required"),
  surveyType: z.enum([
    "CS",
    "SA",
    "RS",
    "BS",
    "City_Survey",
    "Baya_Deed",
    "Current_Deed",
  ]),
  transferor: z.string().min(1, "Transferor (দাতা) is required"),
  transferee: z.string().min(1, "Transferee (গ্রহীতা) is required"),
  transactedAreaShatangsho: z.number().min(0, "Area cannot be negative"),
  hasOriginalDocument: z.boolean(),
  mouza: z.string().optional(),
  daagNumber: z.string().optional(),
  notes: z.string().optional(),
});

const auditChainSchema = z.object({
  transfers: z.array(deedTransferSchema).min(1, "At least one transfer record is required"),
  parentDaagAreaShatangsho: z.number().positive().optional(),
});

const mutationReadinessSchema = z.object({
  originalDeed: z.boolean(),
  bayaDeedsComplete: z.boolean(),
  rsKhatianPorcha: z.boolean(),
  bsCityKhatianPorcha: z.boolean(),
  dakhilaPaidCurrentYear: z.boolean(),
  warishanCertificateIfApplicable: z.boolean().default(false),
  nidCopiesVerified: z.boolean(),
  mouzaMapTraceAvailable: z.boolean().default(false),
});

const issueSealSchema = z.object({
  mouza: z.string().min(1, "Mouza is required"),
  jlNumber: z.string().min(1, "JL Number is required"),
  upazila: z.string().min(1, "Upazila is required"),
  district: z.string().min(1, "District is required"),
  khatianNumber: z.string().min(1, "Khatian number is required"),
  daagNumber: z.string().min(1, "Daag number is required"),
  landAreaShatangsho: z.number().positive("Land area must be greater than zero"),
  currentOwner: z.string().min(1, "Current owner name is required"),
  deedNumber: z.string().min(1, "Deed number is required"),
  considerationBdt: z.number().min(0, "Consideration value cannot be negative"),
});

/**
 * POST /api/v1/land-registry/convert-area
 * Convert land area across Bangladeshi traditional & standard units
 */
landRegistryRouter.post(
  [
    "/api/v1/land-registry/convert-area",
    "/v1/land-registry/convert-area",
    "/land-registry/convert-area",
  ],
  (req: Request, res: Response) => {
    try {
      const parse = convertAreaSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const conversions = DeedVerificationEngine.convertLandArea(
        parse.data.value,
        parse.data.fromUnit as LandUnit
      );

      return res.json({
        success: true,
        data: {
          input: {
            value: parse.data.value,
            unit: parse.data.fromUnit,
          },
          conversions,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to convert land area",
      });
    }
  }
);

/**
 * POST /api/v1/land-registry/calculate-fees
 * Calculate statutory stamp duty, registration fees, and source tax
 */
landRegistryRouter.post(
  [
    "/api/v1/land-registry/calculate-fees",
    "/v1/land-registry/calculate-fees",
    "/land-registry/calculate-fees",
  ],
  (req: Request, res: Response) => {
    try {
      const parse = calculateFeesSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const breakdown = DeedVerificationEngine.calculateRegistrationFees({
        considerationBdt: parse.data.considerationBdt,
        jurisdiction: parse.data.jurisdiction as LandJurisdiction,
        propertyType: parse.data.propertyType as LandPropertyType,
        mouzaRateBdtPerDecimal: parse.data.mouzaRateBdtPerDecimal,
        landAreaShatangsho: parse.data.landAreaShatangsho,
      });

      return res.json({
        success: true,
        data: breakdown,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to calculate registration fees",
      });
    }
  }
);

/**
 * POST /api/v1/land-registry/audit-chain
 * Audit chain of title (বায়া দলিল ধারাবাহিকতা) from CS to Current Deed
 */
landRegistryRouter.post(
  [
    "/api/v1/land-registry/audit-chain",
    "/v1/land-registry/audit-chain",
    "/land-registry/audit-chain",
  ],
  (req: Request, res: Response) => {
    try {
      const parse = auditChainSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const audit = DeedVerificationEngine.auditChainOfOwnership(
        parse.data.transfers.map((t) => ({
          ...t,
          surveyType: t.surveyType as SurveySurveyType,
        })),
        parse.data.parentDaagAreaShatangsho
      );

      return res.json({
        success: true,
        data: audit,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to audit chain of title",
      });
    }
  }
);

/**
 * POST /api/v1/land-registry/mutation-readiness
 * Evaluate AC Land E-Mutation readiness checklist & generate gap report
 */
landRegistryRouter.post(
  [
    "/api/v1/land-registry/mutation-readiness",
    "/v1/land-registry/mutation-readiness",
    "/land-registry/mutation-readiness",
  ],
  (req: Request, res: Response) => {
    try {
      const parse = mutationReadinessSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const evaluation = DeedVerificationEngine.evaluateMutationReadiness(
        parse.data
      );

      return res.json({
        success: true,
        data: evaluation,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to evaluate mutation readiness",
      });
    }
  }
);

/**
 * POST /api/v1/land-registry/issue-seal
 * Generate SHA-256 Title Search Audit Seal and QR payload
 */
landRegistryRouter.post(
  [
    "/api/v1/land-registry/issue-seal",
    "/v1/land-registry/issue-seal",
    "/land-registry/issue-seal",
  ],
  (req: Request, res: Response) => {
    try {
      const parse = issueSealSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({
          success: false,
          error: parse.error.errors.map((e) => e.message).join(", "),
        });
      }

      const seal = DeedVerificationEngine.generateTitleAuditSeal(parse.data);

      return res.json({
        success: true,
        data: seal,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to issue title audit seal",
      });
    }
  }
);
