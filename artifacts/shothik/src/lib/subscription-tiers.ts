export type SubscriptionTier = "free" | "student" | "researcher" | "pro";

export type ToolName =
  | "plagiarism"
  | "ai_detector"
  | "paraphrase"
  | "grammar"
  | "humanize"
  | "summarize"
  | "translator"
  | "writing_studio"
  | "publishing";

export interface TierLimits {
  plagiarismChecks: number;
  aiDetectorScans: number;
  paraphraseUses: number;
  grammarChecks: number;
  humanizeUses: number;
  summarizeUses: number;
  translatorUses: number;
  maxProjects: number;
  writingStudioPro: boolean;
  publishingDistribution: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  description: string;
  pricing: {
    usd: { monthly: number; yearly: number };
    bdt: { monthly: number; yearly: number };
    inr: { monthly: number; yearly: number };
  };
  limits: TierLimits;
  features: string[];
  popular?: boolean;
  stripePriceIds?: {
    usd_monthly?: string;
    usd_yearly?: string;
    bdt_monthly?: string;
    bdt_yearly?: string;
    inr_monthly?: string;
    inr_yearly?: string;
  };
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: "free",
    name: "Free",
    description: "Get started with basic tools",
    pricing: {
      usd: { monthly: 0, yearly: 0 },
      bdt: { monthly: 0, yearly: 0 },
      inr: { monthly: 0, yearly: 0 },
    },
    limits: {
      plagiarismChecks: 5,
      aiDetectorScans: 5,
      paraphraseUses: 10,
      grammarChecks: 20,
      humanizeUses: 5,
      summarizeUses: 10,
      translatorUses: 20,
      maxProjects: 2,
      writingStudioPro: false,
      publishingDistribution: false,
      apiAccess: false,
      prioritySupport: false,
    },
    features: [
      "5 plagiarism checks/month",
      "5 AI detector scans/month",
      "10 paraphrase uses/month",
      "Basic grammar checking (20/month)",
      "Offline Story Bible HUD (#10) — 0 Credits",
      "2 projects",
    ],
  },
  student: {
    id: "student",
    name: "Student",
    description: "Perfect for university students & emerging writers",
    pricing: {
      usd: { monthly: 499, yearly: 4790 },
      bdt: { monthly: 9900, yearly: 95000 },
      inr: { monthly: 9900, yearly: 95000 },
    },
    limits: {
      plagiarismChecks: 30,
      aiDetectorScans: 30,
      paraphraseUses: 50,
      grammarChecks: 100,
      humanizeUses: 20,
      summarizeUses: 50,
      translatorUses: 100,
      maxProjects: 10,
      writingStudioPro: false,
      publishingDistribution: false,
      apiAccess: false,
      prioritySupport: false,
    },
    features: [
      "30 plagiarism checks/month",
      "30 AI detector scans/month",
      "50 paraphrase uses/month",
      "100 grammar checks/month",
      "InkOS Studio Lite (Story Bible #10, De-Slopper #3)",
      "10 projects",
      "Humanize GPT (20/month)",
    ],
  },
  researcher: {
    id: "researcher",
    name: "Researcher",
    description: "Built for STEM researchers, novelists & Pro Operators",
    popular: true,
    pricing: {
      usd: { monthly: 999, yearly: 9590 },
      bdt: { monthly: 19900, yearly: 191000 },
      inr: { monthly: 19900, yearly: 191000 },
    },
    limits: {
      plagiarismChecks: 100,
      aiDetectorScans: 100,
      paraphraseUses: 200,
      grammarChecks: -1,
      humanizeUses: 100,
      summarizeUses: 200,
      translatorUses: -1,
      maxProjects: 50,
      writingStudioPro: true,
      publishingDistribution: false,
      apiAccess: false,
      prioritySupport: true,
    },
    features: [
      "100 plagiarism checks/month",
      "100 AI detector scans/month",
      "200 paraphrase uses/month",
      "Unlimited grammar & translator",
      "InkOS 45-Capability Studio (24kHz Voice #11, Print #38)",
      "Webnovel bKash Paywall (#41) & Royalty Split (#44)",
      "50 projects & Priority support",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Full platform access for authors, founders & agencies",
    pricing: {
      usd: { monthly: 1999, yearly: 19190 },
      bdt: { monthly: 39900, yearly: 383000 },
      inr: { monthly: 39900, yearly: 383000 },
    },
    limits: {
      plagiarismChecks: -1,
      aiDetectorScans: -1,
      paraphraseUses: -1,
      grammarChecks: -1,
      humanizeUses: -1,
      summarizeUses: -1,
      translatorUses: -1,
      maxProjects: -1,
      writingStudioPro: true,
      publishingDistribution: true,
      apiAccess: true,
      prioritySupport: true,
    },
    features: [
      "Unlimited all tools",
      "Full 45-Capability InkOS Studio & BookTok Reels (#14)",
      "Publishing, Nilkhet Print & Boi Mela Distribution",
      "Venture Twin Autonomous Company & Courier/MFS Sync",
      "API access & Unlimited projects",
      "Priority support",
    ],
  },
};

export const TIER_ORDER: SubscriptionTier[] = ["free", "student", "researcher", "pro"];

export type PersonaLensId = "academic" | "author_inkos" | "venture_twin" | "enterprise_erp";

export type PackageSlug = "starter-pass" | "pro-operator" | "venture-twin" | "agency-scale";

export interface PersonaPackageOverride {
  description: string;
  features: string[];
}

export interface PersonaLensConfig {
  id: PersonaLensId;
  label: string;
  badge: string;
  tagline: string;
  packageOverrides: Record<PackageSlug, PersonaPackageOverride>;
}

export const PERSONA_LENSES: PersonaLensConfig[] = [
  {
    id: "academic",
    label: "🎓 Student & Researcher",
    badge: "Academic & STEM",
    tagline:
      "Turnitin-safe thesis verification, IEEE/APA citations, 16:9 defense slide decks, and grammar perfection.",
    packageOverrides: {
      "starter-pass": {
        description:
          "Ideal for university assignments, thesis Turnitin checks, and single defense slide deck creation.",
        features: [
          "50 Instant Task Credits",
          "Academic Plagiarism & Turnitin Check",
          "1 Full 16:9 Defense Slide Deck",
          "Bangla & English Grammar & Paraphrase",
          "IEEE / APA / MLA Auto-Citation",
        ],
      },
      "pro-operator": {
        description:
          "Built for MSc/PhD researchers, faculty authors, and high-volume thesis labs.",
        features: [
          "550 Workspace Credits",
          "100 Plagiarism & AI Detector Audits/mo",
          "Unlimited Grammar, Paraphrase & Translator",
          "5-Step 16:9 Academic Slide Studio",
          "LaTeX & Empirical Literature Synthesis",
        ],
      },
      "venture-twin": {
        description:
          "For university research labs, grant teams, and academic spin-off ventures.",
        features: [
          "1,500 Monthly Credits",
          "Unlimited Plagiarism & Turnitin Certificates",
          "Multi-Author Collaborative Lab Workspace",
          "Grant Financial Stress Lab (30 Scenarios)",
          "Priority DeepSeek R1 STEM Reasoning",
        ],
      },
      "agency-scale": {
        description:
          "Department-wide academic integrity, institutional repository auditing, and unlimited seats.",
        features: [
          "5,000 High-Speed Credits",
          "Unlimited Department & Lab Seats",
          "Bulk Thesis & Journal Plagiarism API",
          "Dedicated Hostinger VPS DeepSeek R1 Node",
          "24/7 Institutional Account Support",
        ],
      },
    },
  },
  {
    id: "author_inkos",
    label: "📚 Author & Creator (InkOS)",
    badge: "45 Studio Capabilities",
    tagline:
      "Write, voice-cast in 24kHz Bangla, typeset 6x9 Nilkhet/Boi Mela print PDFs, and monetize via bKash Webnovel paywalls.",
    packageOverrides: {
      "starter-pass": {
        description:
          "Try the InkOS Writing Studio for short stories, poetry collections, and instant prose de-slopping.",
        features: [
          "50 Instant Task Credits",
          "Offline Story Bible HUD (#10) — 0 Credits",
          "Semantic Prose De-Slopper (#3) & Tension EKG (#18)",
          "Narrative Forecast (#1) & Legal Defamation Shield (#45)",
          "Cryptographic Proof of Authorship Certificate",
        ],
      },
      "pro-operator": {
        description:
          "The complete 45-capability InkOS Studio for novelists, Boi Mela authors, and audiobook creators.",
        features: [
          "550 Workspace Credits",
          "24kHz Multi-Character Bangla Voice Cast (#11) & 3D Audio (#13)",
          "9:16 BookTok/Reels Video Teaser Generator (#14)",
          "6x9 Nilkhet/Boi Mela Print Preflight (#38) & 3D Jacket (#39)",
          "Webnovel bKash Paywall Slicer (#41) & Royalty Split (#44)",
        ],
      },
      "venture-twin": {
        description:
          "Run an independent publishing imprint, serialized webnovel studio, or multi-author anthology house.",
        features: [
          "1,500 Monthly Credits",
          "Autonomous Publishing Imprint & Nilkhet Print Dispatch",
          "Polyglot 6-Language Localization Matrix (#42)",
          "National Library CIP & ISBN Barcode Generator (#40)",
          "Automated bKash/Nagad Reader Paywall & Royalty Ledger",
        ],
      },
      "agency-scale": {
        description:
          "Enterprise publishing house, media production studio, and multi-title translation powerhouse.",
        features: [
          "5,000 High-Speed Credits",
          "Unlimited Co-Authors, Editors & Illustrators",
          "Bulk Audiobook & BookTok Production Pipeline",
          "Custom Webhook & Direct Press Distribution API",
          "Dedicated 24/7 Publisher Support",
        ],
      },
    },
  },
  {
    id: "venture_twin",
    label: "🚀 Founder & F-Commerce",
    badge: "Venture Twin & MFS",
    tagline:
      "Launch and automate your Bangladesh F-Commerce or startup with Steadfast/Pathao courier dispatch and bKash reconciliation.",
    packageOverrides: {
      "starter-pass": {
        description:
          "Validate a startup idea, stress-test unit economics, and generate an investor-ready pitch deck.",
        features: [
          "50 Instant Task Credits",
          "1 Full 16:9 Investor Pitch Deck",
          "Startup Unit Economics & Break-Even Audit",
          "Bangla & English Ad Copy & Product Descriptions",
          "Instant bKash / Nagad 1-Tap Activation",
        ],
      },
      "pro-operator": {
        description:
          "Most popular for solo founders, F-Commerce sellers, and growth marketers scaling daily orders.",
        features: [
          "550 Workspace Credits",
          "30-Scenario Financial Stress Lab & Cashflow Twin",
          "Viral 9:16 Product Reels & Campaign Copy Studio",
          "Automated Customer Reply & Catalog Localization",
          "Interactive Voice Presenter & Pitch Coach",
        ],
      },
      "venture-twin": {
        description:
          "Full Autonomous Company Slot automating F-Commerce sales, courier logistics, and MFS bookkeeping.",
        features: [
          "1,500 Monthly Credits",
          "1 Autonomous Company Slot (Venture Twin OPC)",
          "Tonight Engine Overnight Background Worker",
          "Steadfast & Pathao Courier Auto-Dispatch",
          "bKash & Nagad Merchant SMS TrxID Reconciliation",
        ],
      },
      "agency-scale": {
        description:
          "Multi-brand conglomerate, digital agency, or high-volume e-commerce operation with unlimited seats.",
        features: [
          "5,000 High-Speed Credits",
          "Multi-Brand Autonomous Venture Slots & Unlimited Seats",
          "High-Throughput Courier & MFS Webhook Automation",
          "Dedicated Hostinger VPS DeepSeek R1 Failover",
          "Dedicated 24/7 WhatsApp Account Support",
        ],
      },
    },
  },
  {
    id: "enterprise_erp",
    label: "🏢 Agency & Enterprise ERP",
    badge: "ERP, Tax & API",
    tagline:
      "Automated double-entry ledger, NBR VAT Mushak-6.3 compliance, multi-seat governance, and dedicated DeepSeek R1 nodes.",
    packageOverrides: {
      "starter-pass": {
        description:
          "Pilot Shothik's compliance, contract legal shield, and bilingual document automation for your team.",
        features: [
          "50 Instant Task Credits",
          "Legal Defamation & Contract Risk Shield (#45)",
          "Bilingual Bangla-English Official Document Drafting",
          "Cryptographic Document Audit Trail",
          "Instant MFS or Corporate Card Checkout",
        ],
      },
      "pro-operator": {
        description:
          "For boutique agencies, legal/accounting consultants, and SME operations teams.",
        features: [
          "550 Workspace Credits",
          "30-Scenario Financial Stress Lab & Ledger Export",
          "Smart Royalty & Revenue Split Contracts (#44)",
          "Unlimited Pro Search, Compliance & Policy Synthesis",
          "Priority Queue & Multi-Project Workspaces",
        ],
      },
      "venture-twin": {
        description:
          "Integrated SME ERP with automated bKash/Nagad reconciliation, courier dispatch, and overnight audits.",
        features: [
          "1,500 Monthly Credits",
          "Automated Double-Entry Ledger & MFS Reconciliation",
          "NBR VAT Mushak-6.3 & Tax Readiness Workflows",
          "Tonight Engine Overnight Compliance & Inventory Worker",
          "Steadfast & Pathao Enterprise Logistics Sync",
        ],
      },
      "agency-scale": {
        description:
          "High-throughput enterprise AI infrastructure, unlimited team seats, and custom ERP/webhook endpoints.",
        features: [
          "5,000 High-Speed Credits",
          "Unlimited Team Members & Role-Based Governance",
          "Dedicated Hostinger VPS DeepSeek R1 Failover",
          "Custom ERP API, SSO & Webhook Endpoints",
          "Dedicated 24/7 WhatsApp SLA Support",
        ],
      },
    },
  },
];

export interface OutcomeMicroPass {
  id: string;
  name: string;
  priceBdt: number;
  priceUsd: number;
  credits: number;
  outcome: string;
  badge: string;
  packageId: PackageSlug;
}

export const OUTCOME_MICRO_PASSES: OutcomeMicroPass[] = [
  {
    id: "THESIS_PLAGIARISM_PASS",
    name: "Thesis Defense & Plagiarism Pass",
    priceBdt: 49,
    priceUsd: 0.5,
    credits: 25,
    outcome:
      "1 Full Thesis Turnitin-Style Plagiarism Audit + AI Detector Scan + Citation Fix",
    badge: "🎓 Academic Bestseller",
    packageId: "starter-pass",
  },
  {
    id: "AUDIOBOOK_BOOKTOK_PASS",
    name: "Audiobook & Viral BookTok Pass",
    priceBdt: 149,
    priceUsd: 1.35,
    credits: 80,
    outcome:
      "24kHz Multi-Character Bangla Voice Chapter (#11) + 3D Soundscape (#13) + 9:16 BookTok Reel (#14)",
    badge: "🎧 Creator Favorite",
    packageId: "starter-pass",
  },
  {
    id: "BOI_MELA_PRINT_PASS",
    name: "Ekushey Boi Mela Print-Ready Pass",
    priceBdt: 199,
    priceUsd: 1.8,
    credits: 110,
    outcome:
      "6x9 Nilkhet/Boi Mela Print PDF Preflight (#38) + 3D Book Jacket (#39) + ISBN/CIP Barcode (#40)",
    badge: "📕 Boi Mela Special",
    packageId: "starter-pass",
  },
  {
    id: "PROJECT_VENTURE_PASS",
    name: "Startup Pitch & Venture Stress-Test Pass",
    priceBdt: 299,
    priceUsd: 2.7,
    credits: 160,
    outcome:
      "16:9 Investor Slide Deck + 30-Scenario Financial Stress Lab + Unit Economics Audit",
    badge: "🚀 Founder Pack",
    packageId: "starter-pass",
  },
  {
    id: "F_COMMERCE_MONTHLY_PASS",
    name: "F-Commerce & Steadfast Auto-Pilot Pass",
    priceBdt: 999,
    priceUsd: 8.5,
    credits: 550,
    outcome:
      "30-Day Pro Operator Access + Steadfast/Pathao Dispatch + bKash/Nagad SMS Reconciliation",
    badge: "⚡ Full Month Pro",
    packageId: "pro-operator",
  },
];

export function mapTierToPackageId(tier: SubscriptionTier): string {
  if (tier === "student") return "starter-pass";
  if (tier === "researcher") return "pro-operator";
  if (tier === "pro") return "venture-twin";
  return "starter-pass";
}

export function mapPackageToTier(pkgId: string): SubscriptionTier {
  if (pkgId === "starter-pass") return "student";
  if (pkgId === "pro-operator") return "researcher";
  if (pkgId === "venture-twin" || pkgId === "agency-scale") return "pro";
  return "free";
}

export type CurrencyCode = "usd" | "bdt" | "inr";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  stripeCurrency: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  usd: { code: "usd", symbol: "$", name: "US Dollar", stripeCurrency: "usd" },
  bdt: { code: "bdt", symbol: "৳", name: "Bangladeshi Taka", stripeCurrency: "bdt" },
  inr: { code: "inr", symbol: "₹", name: "Indian Rupee", stripeCurrency: "inr" },
};

export function getCurrencyForCountry(countryCode: string | null): CurrencyCode {
  if (!countryCode) return "usd";
  const code = countryCode.toUpperCase();
  if (code === "BD") return "bdt";
  if (code === "IN") return "inr";
  return "usd";
}

export function formatPrice(
  amountInCents: number,
  currency: CurrencyCode,
): string {
  const config = CURRENCIES[currency];
  const amount = amountInCents / 100;
  if (amount === 0) return "Free";
  return `${config.symbol}${amount.toFixed(currency === "usd" ? 2 : 0)}`;
}

export function getStripePriceId(
  tier: SubscriptionTier,
  currency: CurrencyCode,
  interval: "month" | "year",
): string | undefined {
  const envKey = `STRIPE_PRICE_${tier.toUpperCase()}_${currency.toUpperCase()}_${interval === "year" ? "YEARLY" : "MONTHLY"}`;
  const envValue = typeof process !== "undefined" && process.env ? process.env[envKey] : undefined;
  if (envValue) return envValue;

  const config = SUBSCRIPTION_TIERS[tier];
  const key = `${currency}_${interval === "year" ? "yearly" : "monthly"}` as keyof NonNullable<TierConfig["stripePriceIds"]>;
  return config.stripePriceIds?.[key];
}

export function getTierByStripePriceId(priceId: string): SubscriptionTier | null {
  for (const tier of Object.values(SUBSCRIPTION_TIERS)) {
    const priceIds = tier.stripePriceIds;
    if (priceIds && Object.values(priceIds).includes(priceId)) {
      return tier.id;
    }

    for (const currency of ["usd", "bdt", "inr"] as CurrencyCode[]) {
      for (const interval of ["month", "year"] as const) {
        const envPriceId = getStripePriceId(tier.id, currency, interval);
        if (envPriceId === priceId) {
          return tier.id;
        }
      }
    }
  }
  return null;
}

export function isHigherTier(
  current: SubscriptionTier,
  target: SubscriptionTier,
): boolean {
  return TIER_ORDER.indexOf(target) > TIER_ORDER.indexOf(current);
}

export type UsageLimitKey = keyof Omit<
  TierLimits,
  "maxProjects" | "writingStudioPro" | "publishingDistribution" | "apiAccess" | "prioritySupport"
>;

export const TOOL_TO_LIMIT_KEY: Record<string, UsageLimitKey> = {
  plagiarism: "plagiarismChecks",
  "plagiarism-checker": "plagiarismChecks",
  "ai-detector": "aiDetectorScans",
  ai_detector: "aiDetectorScans",
  paraphrase: "paraphraseUses",
  grammar: "grammarChecks",
  "grammar-checker": "grammarChecks",
  humanize: "humanizeUses",
  "humanize-gpt": "humanizeUses",
  summarize: "summarizeUses",
  translator: "translatorUses",
};
