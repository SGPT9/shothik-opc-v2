import React, { useState, useEffect } from "react";
import {
  FileText,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Download,
  Sparkles,
  X,
  CreditCard,
  Building2,
  Lock,
  Plus,
  ArrowRight,
  Stamp,
  UserCheck,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";

export interface LegalContractsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type ContractType =
  | "vendor_supply"
  | "property_lease"
  | "nda"
  | "founder_vesting"
  | "freelancer";

export interface SignerParty {
  name: string;
  designation?: string;
  companyName?: string;
  nidOrTin: string;
  phone: string;
  email?: string;
  address: string;
  signedAt?: string;
  signatureOtp?: string;
  ipAddress?: string;
}

export interface StampDutyDetails {
  stampValueBdt: number;
  statutoryArticle: string;
  stampCategory: "Non-Judicial Stamp";
  complianceNote: string;
  isCompliant: boolean;
}

export interface ContractRecord {
  id: string;
  contractNumber: string;
  type: ContractType;
  titleEn: string;
  titleBn: string;
  firstParty: SignerParty;
  secondParty: SignerParty;
  contractValueBdt: number;
  durationMonths: number;
  effectiveDate: string;
  expiryDate: string;
  governingLaw: string;
  disputeResolution: string;
  stampDuty: StampDutyDetails;
  clausesEn: string[];
  clausesBn: string[];
  status: "draft" | "partially_signed" | "executed" | "expired";
  digitalSealHash?: string;
  ictActCompliant: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryMetrics {
  totalContracts: number;
  executedContracts: number;
  pendingSignature: number;
  totalContractValueBdt: number;
  totalStampDutyPaidBdt: number;
  contractTypeBreakdown: Record<ContractType, number>;
}

type TabType = "contracts" | "draft" | "preview" | "schedule";

const DEFAULT_METRICS: SummaryMetrics = {
  totalContracts: 4,
  executedContracts: 3,
  pendingSignature: 1,
  totalContractValueBdt: 18200000,
  totalStampDutyPaidBdt: 10800,
  contractTypeBreakdown: {
    vendor_supply: 1,
    property_lease: 1,
    nda: 1,
    founder_vesting: 1,
    freelancer: 0,
  },
};

const INITIAL_CONTRACTS: ContractRecord[] = [
  {
    id: "CTR-2026-001",
    contractNumber: "SHOTHIK-LEG-2026-0811",
    type: "founder_vesting",
    titleEn: "Co-Founder Equity Vesting & Intellectual Property Assignment Agreement",
    titleBn: "সহ-প্রতিষ্ঠাতা শেয়ার অর্পণ ও মেধাস্বত্ব হস্তান্তর চুক্তি",
    firstParty: {
      name: "Tanvir Ahmed",
      designation: "Chief Executive Officer & Founder",
      companyName: "Shothik AI Technologies Ltd.",
      nidOrTin: "1992269548100021",
      phone: "+8801711000001",
      email: "tanvir@shothik.ai",
      address: "Gulshan-2, Dhaka-1212",
      signedAt: "2026-08-10T10:30:00.000Z",
      signatureOtp: "OTP-881923",
      ipAddress: "103.14.28.12",
    },
    secondParty: {
      name: "Raisul Islam",
      designation: "Chief Technology Officer & Co-Founder",
      companyName: "Shothik AI Technologies Ltd.",
      nidOrTin: "1994269548100099",
      phone: "+8801819000002",
      email: "raisul@shothik.ai",
      address: "Dhanmondi R/A, Dhaka-1205",
      signedAt: "2026-08-10T11:15:00.000Z",
      signatureOtp: "OTP-992144",
      ipAddress: "103.14.28.45",
    },
    contractValueBdt: 10000000,
    durationMonths: 48,
    effectiveDate: "2026-08-01",
    expiryDate: "2030-08-01",
    governingLaw: "Laws of the People's Republic of Bangladesh (Companies Act 1994, Contract Act 1872)",
    disputeResolution: "Arbitration in Dhaka under Bangladesh Arbitration Act, 2001",
    stampDuty: {
      stampValueBdt: 300,
      statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 5 & Article 23 - Share & IP Assignment)",
      stampCategory: "Non-Judicial Stamp",
      complianceNote: "৳300 Non-Judicial stamp duty required for equity covenant and IP assignment.",
      isCompliant: true,
    },
    clausesEn: [
      "1. VESTING SCHEDULE: 4-Year vesting schedule with a 1-year standard cliff (25% vesting at Month 12, remaining 75% monthly).",
      "2. IP ASSIGNMENT: All code, models, trade secrets, and patents created exclusively vest in Shothik AI Technologies Ltd.",
      "3. NON-COMPETE & NON-SOLICITATION: Restricted for 24 months post-departure across South Asian market operations.",
    ],
    clausesBn: [
      "১. শেয়ার অর্পণ নিয়মাবলী: ৪ বছরের ভেস্টিং মেয়াদ এবং ১ বছরের ক্লিফ পিরিয়ড (১২তম মাসে ২৫% এবং অবশিষ্ট ৭৫% প্রতি মাসে অর্পিত হবে)।",
      "২. মেধাস্বত্ব হস্তান্তর: সৃষ্ট সকল সোর্স কোড, এআই মডেল, এবং ট্রেড সিক্রেটস সম্পূর্ণভাবে কোম্পানীর একক মালিকানায় থাকবে।",
      "৩. গোপনীয়তা ও প্রতিযোগিতা নিষেধাজ্ঞা: প্রস্থান পরবর্তী ২৪ মাস পর্যন্ত সরাসরি প্রতিযোগিতামূলক ব্যবসায় নিষেধাজ্ঞা প্রযোজ্য হবে।",
    ],
    status: "executed",
    digitalSealHash: "e4a89fbcd02931a78bc541908ef12bc85012fa8901ebcf881023a9d8213bc541",
    ictActCompliant: true,
    createdAt: "2026-08-10T09:00:00.000Z",
    updatedAt: "2026-08-10T11:15:00.000Z",
  },
  {
    id: "CTR-2026-002",
    contractNumber: "SHOTHIK-LEG-2026-0819",
    type: "property_lease",
    titleEn: "Commercial Warehouse & Micro-Hub Lease Agreement",
    titleBn: "বাণিজ্যিক ওয়্যারহাউস ও মাইক্রো-হাব চুক্তিপত্র",
    firstParty: {
      name: "Haji Mohammad Yunus",
      designation: "Landlord / Property Owner",
      companyName: "Yunus Properties Ltd.",
      nidOrTin: "1968269548100555",
      phone: "+8801712000003",
      email: "yunus@properties.bd",
      address: "Tejgaon Industrial Area, Dhaka-1208",
      signedAt: "2026-08-18T14:20:00.000Z",
      signatureOtp: "OTP-334182",
      ipAddress: "103.221.25.10",
    },
    secondParty: {
      name: "Tanvir Ahmed",
      designation: "Managing Director",
      companyName: "Shothik Hyperlocal Hub Ltd.",
      nidOrTin: "1992269548100021",
      phone: "+8801711000001",
      email: "tanvir@shothik.ai",
      address: "Gulshan-2, Dhaka-1212",
      signedAt: "2026-08-18T15:00:00.000Z",
      signatureOtp: "OTP-551920",
      ipAddress: "103.14.28.12",
    },
    contractValueBdt: 1200000,
    durationMonths: 24,
    effectiveDate: "2026-09-01",
    expiryDate: "2028-09-01",
    governingLaw: "Premises Rent Control Act, 1991 & Transfer of Property Act, 1882",
    disputeResolution: "Courts of Dhaka, Bangladesh",
    stampDuty: {
      stampValueBdt: 10000,
      statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 35 - Lease exceeding 1 year)",
      stampCategory: "Non-Judicial Stamp",
      complianceNote: "Stamp duty of ৳10,000 (0.83% of annual rent ৳12,00,000) under Article 35.",
      isCompliant: true,
    },
    clausesEn: [
      "1. RENT & DEPOSIT: Monthly rent of ৳1,00,000 with 3-month refundable security deposit (৳3,00,000).",
      "2. COMMERCIAL USE: Exclusively permitted for automated fulfillment micro-hub and logistics sorting.",
      "3. TERMINATION NOTICE: 3 months prior written notice required for bilateral tenancy termination.",
    ],
    clausesBn: [
      "১. ভাড়া ও জামানত: মাসিক ভাড়া ১,০০,০০০ টাকা এবং ৩ মাসের ফেরতযোগ্য সিকিউরিটি ডিপোজিট ৩,০০,০০০ টাকা।",
      "২. বাণিজ্যিক ব্যবহার: শুধুমাত্র অটোমেটেড ডেলিভারি মাইক্রো-হাব ও লজিস্টিকস সর্টিং কাজে ব্যবহৃত হবে।",
      "৩. চুক্তি অবসান: চুক্তি বাতিলের ক্ষেত্রে উভয় পক্ষ থেকে ন্যূনতম ৩ মাসের লিখিত নোটিশ প্রদান বাধ্যতামূলক।",
    ],
    status: "executed",
    digitalSealHash: "f1b82a7c880129bc41235ea88910cdfa5912bc0914a821eef00192837bc991a2",
    ictActCompliant: true,
    createdAt: "2026-08-18T12:00:00.000Z",
    updatedAt: "2026-08-18T15:00:00.000Z",
  },
];

export const LegalContractsModal: React.FC<LegalContractsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>("contracts");
  const [contracts, setContracts] = useState<ContractRecord[]>(INITIAL_CONTRACTS);
  const [metrics, setMetrics] = useState<SummaryMetrics>(DEFAULT_METRICS);
  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(INITIAL_CONTRACTS[0]);
  const [languageMode, setLanguageMode] = useState<"en" | "bn">("en");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for New Contract
  const [contractType, setContractType] = useState<ContractType>("vendor_supply");
  const [contractValue, setContractValue] = useState<number>(450000);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [firstPartyName, setFirstPartyName] = useState<string>("Shothik Enterprise Ltd.");
  const [firstPartyNid, setFirstPartyNid] = useState<string>("1992269548100021");
  const [firstPartyPhone, setFirstPartyPhone] = useState<string>("+8801711000001");
  const [secondPartyName, setSecondPartyName] = useState<string>("Bengal Textile Mills Ltd.");
  const [secondPartyNid, setSecondPartyNid] = useState<string>("1988269548100777");
  const [secondPartyPhone, setSecondPartyPhone] = useState<string>("+8801819000099");
  const [customClause, setCustomClause] = useState<string>("Standard payment terms: 50% advance via bKash Corporate, 50% upon COD dispatch.");

  // Calculated stamp preview
  const [calculatedStamp, setCalculatedStamp] = useState<StampDutyDetails>({
    stampValueBdt: 500,
    statutoryArticle: "The Stamp Act, 1899 (Schedule 1, Article 5(c) - Service/Supply < ৳5L)",
    stampCategory: "Non-Judicial Stamp",
    complianceNote: "৳500 Non-Judicial stamp duty for commercial contracts with value under ৳5,00,000.",
    isCompliant: true,
  });

  useEffect(() => {
    // Dynamic recalculation of stamp duty
    let val = 300;
    let article = "The Stamp Act, 1899 (Schedule 1, Article 5 - Agreement / Affidavit)";
    let note = "Mandatory non-judicial stamp duty of ৳300 under Section 35.";

    if (contractType === "property_lease") {
      val = Math.max(1000, Math.round(contractValue * 0.01));
      article = "The Stamp Act, 1899 (Schedule 1, Article 35 - Lease exceeding 1 year)";
      note = `Stamp duty calculated at 1.0% of annual rent (৳${val.toLocaleString()}) under Article 35.`;
    } else if (contractType === "vendor_supply" || contractType === "freelancer") {
      if (contractValue >= 500000) {
        val = 1000;
        article = "The Stamp Act, 1899 (Schedule 1, Article 5(c) - Commercial Contracts >= ৳5L)";
        note = "৳1,000 Non-Judicial stamp duty for commercial agreements valued at ৳5,00,000 or above.";
      } else {
        val = 500;
        article = "The Stamp Act, 1899 (Schedule 1, Article 5(c) - Service/Supply < ৳5L)";
        note = "৳500 Non-Judicial stamp duty for commercial agreements valued under ৳5,00,000.";
      }
    }

    setCalculatedStamp({
      stampValueBdt: val,
      statutoryArticle: article,
      stampCategory: "Non-Judicial Stamp",
      complianceNote: note,
      isCompliant: true,
    });
  }, [contractType, contractValue]);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `CTR-2026-00${contracts.length + 1}`;
    const newContractNumber = `SHOTHIK-LEG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: ContractRecord = {
      id: newId,
      contractNumber: newContractNumber,
      type: contractType,
      titleEn:
        contractType === "vendor_supply"
          ? "Commercial Goods Supply & Delivery Agreement"
          : contractType === "freelancer"
          ? "Professional Software Developer & Services Agreement"
          : contractType === "nda"
          ? "Mutual Non-Disclosure & Confidentiality Agreement"
          : "Statutory Commercial Agreement",
      titleBn:
        contractType === "vendor_supply"
          ? "বাণিজ্যিক পণ্য সরবরাহ ও ডেলিভারি চুক্তিপত্র"
          : contractType === "freelancer"
          ? "সফটওয়্যার ডেভেলপার ও ফ্রিল্যান্সার চুক্তিপত্র"
          : contractType === "nda"
          ? "পারস্পরিক গোপনীয়তা রক্ষা চুক্তি (এনডিএ)"
          : "সংবিধিবদ্ধ বাণিজ্যিক চুক্তিপত্র",
      firstParty: {
        name: firstPartyName,
        nidOrTin: firstPartyNid,
        phone: firstPartyPhone,
        address: "Dhaka, Bangladesh",
        signedAt: new Date().toISOString(),
        signatureOtp: `OTP-${Math.floor(100000 + Math.random() * 900000)}`,
        ipAddress: "103.14.28.12",
      },
      secondParty: {
        name: secondPartyName,
        nidOrTin: secondPartyNid,
        phone: secondPartyPhone,
        address: "Bangladesh",
        signedAt: new Date().toISOString(),
        signatureOtp: `OTP-${Math.floor(100000 + Math.random() * 900000)}`,
        ipAddress: "103.14.28.88",
      },
      contractValueBdt: Number(contractValue),
      durationMonths: Number(durationMonths),
      effectiveDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + durationMonths * 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      governingLaw: "The Contract Act, 1872 & The Stamp Act, 1899 of Bangladesh",
      disputeResolution: "Arbitration in Dhaka under the Arbitration Act, 2001",
      stampDuty: calculatedStamp,
      clausesEn: [
        `1. SCOPE: Supply and delivery of services according to approved terms. ${customClause}`,
        "2. STATUTORY STAMP: Non-judicial e-stamp duty fully registered and verified under The Stamp Act 1899.",
        "3. DIGITAL SIGNATURES: Executed bilaterally with OTP cryptographic verification under Section 7 of the ICT Act 2006.",
      ],
      clausesBn: [
        `১. চুক্তির আওতা: অনুমোদিত শর্তাবলী অনুসারে পণ্য ও সেবা সরবরাহ। ${customClause}`,
        "২. সংবিধিবদ্ধ স্ট্যাম্প: স্ট্যাম্প অ্যাক্ট ১৮৯৯ এর অধীনে নন-জুডিশিয়াল স্ট্যাম্প ডিউটি প্রযোজ্য ও ভেরিফাইড।",
        "৩. ডিজিটাল স্বাক্ষর: আইসিটি অ্যাক্ট ২০০৬ এর ৭ ধারা অনুযায়ী উভয় পক্ষের ওটিপি ও ক্রিপ্টোগ্রাফিক যাচাইকরণ সম্পন্ন।",
      ],
      status: "executed",
      digitalSealHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      ictActCompliant: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContracts([newRecord, ...contracts]);
    setSelectedContract(newRecord);
    setMetrics((prev) => ({
      ...prev,
      totalContracts: prev.totalContracts + 1,
      executedContracts: prev.executedContracts + 1,
      totalContractValueBdt: prev.totalContractValueBdt + newRecord.contractValueBdt,
      totalStampDutyPaidBdt: prev.totalStampDutyPaidBdt + newRecord.stampDuty.stampValueBdt,
    }));
    setActiveTab("preview");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/70 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  AI Legal Contract & Stamp Duty Act 1899 Studio
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                  ICT Act 2006 Compliant
                </span>
                <span className="px-2 py-0.5 text-xs font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                  ⌘L
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automated bilingual contract generator, non-judicial e-stamp duty calculator & SHA-256 digital signature seal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 bg-slate-950/30 border-b border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-slate-400">Executed Contracts</div>
              <div className="text-base font-bold text-white">
                {metrics.executedContracts} <span className="text-xs text-slate-500 font-normal">/ {metrics.totalContracts}</span>
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-400">Total Portfolio Value</div>
              <div className="text-base font-bold text-emerald-400">
                ৳{(metrics.totalContractValueBdt / 100000).toFixed(1)} Lakh
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <Stamp className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">Stamp Duty Paid (Act 1899)</div>
              <div className="text-base font-bold text-amber-400">
                ৳{metrics.totalStampDutyPaidBdt.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-slate-400">e-Signature Admissibility</div>
              <div className="text-base font-bold text-cyan-400">100% (Sec 35 Admissible)</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-900/50">
          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "contracts"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Active Contracts ({contracts.length})
          </button>
          <button
            onClick={() => setActiveTab("draft")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "draft"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Plus className="w-4 h-4" />
            New Contract Drafter & Stamp Calculator
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Contract Preview & Digital Seal
          </button>
          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === "schedule"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Scale className="w-4 h-4" />
            Stamp Act 1899 Statutory Schedule
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          {/* TAB 1: Active Contracts */}
          {activeTab === "contracts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">Executed & In-Flight Statutory Agreements</h3>
                <button
                  onClick={() => setActiveTab("draft")}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Draft New Contract
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contracts.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedContract(c);
                      setActiveTab("preview");
                    }}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-800 text-amber-400 rounded">
                          {c.contractNumber}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-400">
                        ৳{c.contractValueBdt > 0 ? (c.contractValueBdt / 100000).toFixed(1) + "L" : "N/A"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mb-1 line-clamp-1">
                      {c.titleEn}
                    </h4>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-1">{c.titleBn}</p>

                    <div className="text-xs space-y-1 py-2 px-3 rounded-lg bg-slate-950/50 border border-slate-800/80 mb-3 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Party 1:</span>
                        <span className="font-medium text-slate-200">{c.firstParty.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Party 2:</span>
                        <span className="font-medium text-slate-200">{c.secondParty.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Stamp Duty:</span>
                        <span className="font-mono text-amber-400">৳{c.stampDuty.stampValueBdt} ({c.stampDuty.stampCategory})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-emerald-400 font-mono">
                        <Lock className="w-3 h-3" /> Seal: {c.digitalSealHash?.slice(0, 10)}...
                      </div>
                      <span className="flex items-center gap-1 text-amber-400 group-hover:translate-x-0.5 transition-transform">
                        View Dossier <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: New Contract Drafter */}
          {activeTab === "draft" && (
            <form onSubmit={handleCreateContract} className="space-y-6 max-w-4xl mx-auto">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-3">
                <Stamp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Statutory Stamp Duty & Legal Admissibility Guardrail:</span> Contracts generated via this engine automatically calculate mandatory non-judicial stamp duty under The Stamp Act 1899 and generate verifiable OTP e-signature seals conforming to Section 7 of The Information & Communication Technology (ICT) Act 2006.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contract Template & Category
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractType)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="vendor_supply">Commercial Vendor Supply Agreement (পণ্য সরবরাহ চুক্তি)</option>
                    <option value="property_lease">Commercial Warehouse / Office Lease (ভাড়া চুক্তিপত্র)</option>
                    <option value="nda">Mutual Non-Disclosure Agreement (গোপনীয়তা রক্ষা চুক্তি - NDA)</option>
                    <option value="founder_vesting">Founder Equity Vesting & IP Assignment (প্রতিষ্ঠাতা ভেস্টিং)</option>
                    <option value="freelancer">Software Developer / Freelancer Agreement (ফ্রিল্যান্সার চুক্তি)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Contract Value / Annual Value (BDT)
                  </label>
                  <input
                    type="number"
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    placeholder="e.g. 500000"
                  />
                </div>
              </div>

              {/* Dynamic Stamp Duty Estimation Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400">Statutory Stamp Requirement (Schedule 1, Act 1899)</div>
                  <div className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400 font-mono text-base">৳{calculatedStamp.stampValueBdt.toLocaleString()}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">
                      {calculatedStamp.statutoryArticle}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{calculatedStamp.complianceNote}</div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Legally Enforceable
                </div>
              </div>

              {/* Party Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> First Party (Discloser / Landlord / Client)
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Company / Individual Name</label>
                    <input
                      type="text"
                      value={firstPartyName}
                      onChange={(e) => setFirstPartyName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">National ID (NID) or TIN</label>
                    <input
                      type="text"
                      value={firstPartyNid}
                      onChange={(e) => setFirstPartyNid(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Mobile Phone (OTP verification)</label>
                    <input
                      type="text"
                      value={firstPartyPhone}
                      onChange={(e) => setFirstPartyPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" /> Second Party (Vendor / Tenant / Contractor)
                  </h4>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Company / Individual Name</label>
                    <input
                      type="text"
                      value={secondPartyName}
                      onChange={(e) => setSecondPartyName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">National ID (NID) or TIN</label>
                    <input
                      type="text"
                      value={secondPartyNid}
                      onChange={(e) => setSecondPartyNid(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Mobile Phone (OTP verification)</label>
                    <input
                      type="text"
                      value={secondPartyPhone}
                      onChange={(e) => setSecondPartyPhone(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Special Commercial Terms & Custom Operational Clauses
                </label>
                <textarea
                  value={customClause}
                  onChange={(e) => setCustomClause(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  placeholder="Enter specific deliverables, milestone dates, penalty terms..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("contracts")}
                  className="px-4 py-2 text-xs font-medium bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 hover:from-amber-400 hover:to-amber-300 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" /> Generate Bilingual Contract & Cryptographic Seal
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Contract Preview & Digital Seal */}
          {activeTab === "preview" && selectedContract && (
            <div className="space-y-4 max-w-4xl mx-auto">
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Language:</span>
                  <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                    <button
                      onClick={() => setLanguageMode("en")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        languageMode === "en" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguageMode("bn")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        languageMode === "bn" ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      বাংলা
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedContract, null, 2), "all")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                  >
                    {copiedId === "all" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy JSON
                  </button>
                  <button
                    onClick={() => handleCopy(selectedContract.digitalSealHash || "", "hash")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700"
                  >
                    {copiedId === "hash" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-400" />}
                    Copy Seal Hash
                  </button>
                </div>
              </div>

              {/* Statutory Legal Dossier Paper Simulation */}
              <div className="p-8 rounded-2xl bg-slate-900 border-2 border-slate-700/80 shadow-2xl text-slate-200 font-serif leading-relaxed">
                {/* Government Stamp Duty Banner */}
                <div className="p-4 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 mb-6 text-center">
                  <div className="text-[11px] font-sans tracking-widest text-amber-400 font-bold uppercase">
                    Non-Judicial E-Stamp Duty Ad Valorem • Govt of Bangladesh
                  </div>
                  <div className="text-xl font-bold font-sans text-white mt-0.5">
                    ৳{selectedContract.stampDuty.stampValueBdt.toLocaleString()} STAMP DUTY PAID
                  </div>
                  <div className="text-xs font-sans text-slate-400 mt-0.5">
                    {selectedContract.stampDuty.statutoryArticle}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h1 className="text-lg font-bold text-white uppercase tracking-wider font-sans">
                    {languageMode === "en" ? selectedContract.titleEn : selectedContract.titleBn}
                  </h1>
                  <p className="text-xs text-slate-400 font-sans mt-1">
                    Contract ID: {selectedContract.contractNumber} • Effective Date: {selectedContract.effectiveDate}
                  </p>
                </div>

                {/* Parties Preamble */}
                <div className="text-xs space-y-3 text-slate-300 mb-6 font-sans">
                  <p>
                    {languageMode === "en" ? (
                      <>
                        <strong>THIS AGREEMENT</strong> is entered into as of{" "}
                        <span className="text-amber-300">{selectedContract.effectiveDate}</span> by and between:
                      </>
                    ) : (
                      <>
                        <strong>এই চুক্তিপত্রটি</strong> নিম্নোক্ত তারিখ অনুযায়ী স্বাক্ষরিত ও কার্যকর হলো:{" "}
                        <span className="text-amber-300">{selectedContract.effectiveDate}</span>। পক্ষদ্বয়:
                      </>
                    )}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-amber-500/40">
                    <div>
                      <div className="font-bold text-white">First Party: {selectedContract.firstParty.name}</div>
                      <div className="text-slate-400">NID/TIN: {selectedContract.firstParty.nidOrTin}</div>
                      <div className="text-slate-400">Phone: {selectedContract.firstParty.phone}</div>
                    </div>
                    <div>
                      <div className="font-bold text-white">Second Party: {selectedContract.secondParty.name}</div>
                      <div className="text-slate-400">NID/TIN: {selectedContract.secondParty.nidOrTin}</div>
                      <div className="text-slate-400">Phone: {selectedContract.secondParty.phone}</div>
                    </div>
                  </div>
                </div>

                {/* Contract Clauses */}
                <div className="space-y-3 mb-8">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-sans border-b border-slate-800 pb-1">
                    Operative Statutory Clauses
                  </h3>
                  {(languageMode === "en" ? selectedContract.clausesEn : selectedContract.clausesBn).map(
                    (clause, idx) => (
                      <p key={idx} className="text-xs text-slate-300">
                        {clause}
                      </p>
                    )
                  )}
                  <p className="text-xs text-slate-300">
                    <strong>Governing Law:</strong> {selectedContract.governingLaw}.
                  </p>
                  <p className="text-xs text-slate-300">
                    <strong>Dispute Resolution:</strong> {selectedContract.disputeResolution}.
                  </p>
                </div>

                {/* Dual-Party Digital Signature Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 font-sans text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> First Party e-Signed
                    </div>
                    <div className="text-white font-semibold">{selectedContract.firstParty.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Timestamp: {selectedContract.firstParty.signedAt}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      OTP Ref: {selectedContract.firstParty.signatureOtp} • IP: {selectedContract.firstParty.ipAddress}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Second Party e-Signed
                    </div>
                    <div className="text-white font-semibold">{selectedContract.secondParty.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Timestamp: {selectedContract.secondParty.signedAt}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      OTP Ref: {selectedContract.secondParty.signatureOtp} • IP: {selectedContract.secondParty.ipAddress}
                    </div>
                  </div>
                </div>

                {/* Cryptographic Proof Seal Footer */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] font-sans text-slate-400">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      SHA-256 Seal:{" "}
                      <span className="font-mono text-slate-300">
                        {selectedContract.digitalSealHash?.slice(0, 32)}...
                      </span>
                    </span>
                  </div>
                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Valid under ICT Act 2006 (Sec 7)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Statutory Stamp Schedule */}
          {activeTab === "schedule" && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" /> The Stamp Act, 1899 Statutory Tariff Reference (Bangladesh)
                </h3>
                <p className="text-slate-400 mb-4">
                  Under Section 35 of The Stamp Act 1899, no instrument chargeable with duty shall be admitted in evidence in any court of law unless duly stamped. Below are statutory rates applied across OPC operations:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2 px-3">Agreement Type</th>
                        <th className="py-2 px-3">Statutory Article</th>
                        <th className="py-2 px-3">Stamp Value (BDT)</th>
                        <th className="py-2 px-3">Enforceability Requirement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Non-Disclosure Agreement (NDA)</td>
                        <td className="py-2.5 px-3">Schedule 1, Article 5</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">৳300</td>
                        <td className="py-2.5 px-3">Bilateral e-sign + Non-judicial stamp</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Founder Vesting & IP Assignment</td>
                        <td className="py-2.5 px-3">Article 5 & Article 23</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">৳300</td>
                        <td className="py-2.5 px-3">Company board resolution stamp</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Vendor Supply / Freelancer (&lt; ৳5L)</td>
                        <td className="py-2.5 px-3">Schedule 1, Article 5(c)</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">৳500</td>
                        <td className="py-2.5 px-3">Section 35 legal admissibility</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Commercial Contracts (&gt;= ৳5L)</td>
                        <td className="py-2.5 px-3">Schedule 1, Article 5(c)</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">৳1,000</td>
                        <td className="py-2.5 px-3">Commercial invoice / PO attachment</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-white">Commercial Property / Warehouse Lease</td>
                        <td className="py-2.5 px-3">Schedule 1, Article 35</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400">1.0% of Annual Rent</td>
                        <td className="py-2.5 px-3">Mandatory if lease &gt; 12 months</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalContractsModal;
