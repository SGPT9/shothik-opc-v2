"use client";

import { useState } from "react";
import {
  Scale,
  FileCheck,
  Download,
  Copy,
  Check,
  Shield,
  Stamp,
  Printer,
  FileText,
  Building,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export interface ContractClause {
  id: string;
  titleEn: string;
  titleBn: string;
  contentEn: string;
  contentBn: string;
}

export interface LegalContract {
  id: string;
  type: string;
  titleEn: string;
  titleBn: string;
  partyA: { name: string; title: string; organization: string; address: string };
  partyB: { name: string; title: string; organization: string; address: string };
  effectiveDate: string;
  governingLaw: string;
  clauses: ContractClause[];
}

const DEFAULT_CONTRACT: LegalContract = {
  id: "contract-001",
  type: "Software Development & IP Assignment Agreement",
  titleEn: "Software Development & Intellectual Property Assignment Agreement",
  titleBn: "সফটওয়্যার ডেভেলপমেন্ট ও মেধা-স্বত্ব হস্তান্তর চুক্তিপত্র",
  partyA: {
    name: "তানভীর আহমেদ (Tanvir Ahmed)",
    title: "Managing Director",
    organization: "Shothik Hermes Technologies Ltd.",
    address: "Level 8, Concord Tower, Gulshan-2, Dhaka-1212, Bangladesh",
  },
  partyB: {
    name: "রাফসান ইসলাম (Rafsan Islam)",
    title: "Lead Engineering Contractor",
    organization: "Apex Digital Solutions",
    address: "House 14, Road 5, Dhanmondi, Dhaka-1205, Bangladesh",
  },
  effectiveDate: "August 18, 2026",
  governingLaw: "Laws of the People's Republic of Bangladesh (ICT Act 2006 & Contract Act 1872)",
  clauses: [
    {
      id: "c-1",
      titleEn: "1. Scope of Services & Deliverables",
      titleBn: "১. সেবার পরিধি ও কাজের বিবরণ",
      contentEn:
        "The Contractor agrees to design, engineer, and deploy high-performance full-stack web applications, carrier webhook microservices, and tokenized payment gateway integrations according to the project specifications agreed upon by both parties.",
      contentBn:
        "চুক্তিকারী পক্ষ উভয় পক্ষের সম্মতিক্রমে নির্ধারিত প্রজেক্ট স্পেসিফিকেশন অনুযায়ী উচ্চ ক্ষমতাসম্পন্ন ফুল-স্ট্যাক ওয়েব অ্যাপ্লিকেশন, কুরিয়ার ওয়েবহুক ও পেমেন্ট গেটওয়ে ইন্টিগ্রেশন সম্পন্ন করতে সম্মত হচ্ছেন।",
    },
    {
      id: "c-2",
      titleEn: "2. Intellectual Property (IP) Ownership",
      titleBn: "২. মেধাস্বত্ব ও মালিকানা স্বত্ব",
      contentEn:
        "All source code, design assets, database schemas, algorithms, and documentation created during the engagement shall remain the sole and exclusive intellectual property of the Client upon settlement of agreed consideration.",
      contentBn:
        "কাজের মেয়াদে তৈরি সকল সোর্স কোড, ডিজাইন, ডাটাবেজ স্কিমা এবং অ্যালগরিদমের নিরঙ্কুশ মেধাস্বত্ব ও বাণিজ্যিক মালিকানা নির্ধারিত পারিশ্রমিক পরিশোধ সাপেক্ষে সম্পূর্ণরূপে ক্লায়েন্ট কোম্পানির অধীনে সংরক্ষিত থাকবে।",
    },
    {
      id: "c-3",
      titleEn: "3. Payment Terms & bKash / Bank Settlement",
      titleBn: "৩. পারিশ্রমিক ও পেমেন্ট মাধ্যম",
      contentEn:
        "Total project milestone remuneration shall be disbursed in Bangladeshi Taka (BDT) via scheduled BEFTN / NPSB bank transfer or verified corporate bKash merchant gateway within 5 business days of milestone sign-off.",
      contentBn:
        "প্রজেক্টের নির্ধারিত মাইলস্টোন পারিশ্রমিক বাংলাদেশি টাকা (BDT) মাধ্যমে ব্যাংক ট্রান্সফার বা ভেরিফাইড কর্পোরেট বিকাশ পেমেন্ট গেটওয়ের মাধ্যমে ৫ কার্যদিবসের মধ্যে পরিশোধ করা হবে।",
    },
    {
      id: "c-4",
      titleEn: "4. Dispute Resolution & Jurisdiction",
      titleBn: "৪. বিরোধ নিষ্পত্তি ও বিচারিক এখতিয়ার",
      contentEn:
        "Any dispute arising from or related to this Agreement shall be settled amicably through arbitration in accordance with the Arbitration Act 2001, subject to the exclusive jurisdiction of the competent courts of Dhaka, Bangladesh.",
      contentBn:
        "চুক্তি সম্পর্কিত যেকোনো বিরোধ প্রথমত আলোচনার মাধ্যমে নিষ্পত্তির চেষ্টা করা হবে এবং প্রয়োজনে সালিশি আইন ২০০১ মোতাবেক ঢাকা আদালতের একচ্ছত্র এখতিয়ারাধীন থাকবে।",
    },
  ],
};

export function LegalContractArtifact() {
  const [contract, setContract] = useState<LegalContract>(DEFAULT_CONTRACT);
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [copied, setCopied] = useState(false);
  const [signedDate, setSignedDate] = useState<string | null>("2026-08-18");

  const handleCopyMarkdown = () => {
    const md = `# ${language === "en" ? contract.titleEn : contract.titleBn}
**Governing Law:** ${contract.governingLaw}
**Effective Date:** ${contract.effectiveDate}

---

### **First Party (Client):**
- **Name:** ${contract.partyA.name}
- **Organization:** ${contract.partyA.organization}
- **Address:** ${contract.partyA.address}

### **Second Party (Contractor):**
- **Name:** ${contract.partyB.name}
- **Organization:** ${contract.partyB.organization}
- **Address:** ${contract.partyB.address}

---

## 📜 Agreement Clauses
${contract.clauses
  .map(
    (c) => `### ${language === "en" ? c.titleEn : c.titleBn}
${language === "en" ? c.contentEn : c.contentBn}`
  )
  .join("\n\n")}

---

**Signed By:**
- ${contract.partyA.name} (Client Signature Authenticated)
- ${contract.partyB.name} (Contractor Signature Authenticated)
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Top Header Toolbar ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>Legal Contract & Compliance Studio</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                Bangladesh Contract Act 1872
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Dual English & Bengali legal drafts with ৳300 Non-Judicial Stamp mockup & digital signatures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border text-xs">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                language === "en" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={cn(
                "px-2.5 py-1 rounded-md font-semibold transition cursor-pointer",
                language === "bn" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              বাংলা
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground border border-border transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy MD"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Stamp Paper</span>
          </button>
        </div>
      </div>

      {/* ── Main Scrollable Contract Viewport ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto bg-[#faf8f5] dark:bg-[#12161f] border border-amber-500/30 rounded-2xl p-6 sm:p-10 shadow-2xl text-slate-900 dark:text-slate-100 space-y-6">
          {/* ৳300 BDT Non-Judicial Stamp Header Mockup */}
          <div className="border-4 border-double border-amber-600/40 p-4 rounded-xl text-center space-y-1 bg-amber-500/5">
            <div className="flex items-center justify-center gap-2">
              <Stamp className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-black tracking-widest uppercase font-mono text-amber-600 dark:text-amber-400">
                GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH
              </span>
            </div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              NON-JUDICIAL STAMP · VALUE: ৳300 BDT · BANGLADESH STAMP ACT 1899
            </div>
          </div>

          {/* Contract Title */}
          <div className="text-center space-y-1 border-b border-border/60 pb-4">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              {language === "en" ? contract.titleEn : contract.titleBn}
            </h1>
            <p className="text-xs text-muted-foreground">
              Effective as of {contract.effectiveDate} · Governing Law: {contract.governingLaw}
            </p>
          </div>

          {/* Parties Involved */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-amber-500 block">First Party (Client)</span>
              <div className="font-semibold">{contract.partyA.name}</div>
              <div className="text-muted-foreground">{contract.partyA.title} · {contract.partyA.organization}</div>
              <div className="text-[11px] text-muted-foreground/80">{contract.partyA.address}</div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-indigo-400 block">Second Party (Contractor)</span>
              <div className="font-semibold">{contract.partyB.name}</div>
              <div className="text-muted-foreground">{contract.partyB.title} · {contract.partyB.organization}</div>
              <div className="text-[11px] text-muted-foreground/80">{contract.partyB.address}</div>
            </div>
          </div>

          {/* Clauses List */}
          <div className="space-y-4 pt-2">
            {contract.clauses.map((clause) => (
              <div key={clause.id} className="space-y-1.5 text-xs leading-relaxed">
                <h3 className="font-bold text-foreground">
                  {language === "en" ? clause.titleEn : clause.titleBn}
                </h3>
                <p className="text-muted-foreground pl-3 border-l-2 border-amber-500/40">
                  {language === "en" ? clause.contentEn : clause.contentBn}
                </p>
              </div>
            ))}
          </div>

          {/* Signatures & Verification Block */}
          <div className="border-t border-border/60 pt-6 grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-2">
              <div className="h-12 border-b border-dashed border-border flex items-end justify-center pb-1">
                <span className="font-serif italic text-sm text-emerald-500 font-bold">Tanvir Ahmed</span>
              </div>
              <div className="text-center font-semibold">{contract.partyA.name}</div>
              <div className="text-center text-[10px] text-muted-foreground">Digital Signature Verified (bKash Corporate OTP)</div>
            </div>

            <div className="space-y-2">
              <div className="h-12 border-b border-dashed border-border flex items-end justify-center pb-1">
                <span className="font-serif italic text-sm text-indigo-400 font-bold">Rafsan Islam</span>
              </div>
              <div className="text-center font-semibold">{contract.partyB.name}</div>
              <div className="text-center text-[10px] text-muted-foreground">Digital Signature Verified (NID / Smart ID)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalContractArtifact;
