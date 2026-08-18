"use client";

import { useState } from "react";
import {
  Globe,
  Sparkles,
  Copy,
  Check,
  Search,
  FileCode,
  Share2,
  TrendingUp,
  BarChart,
  Code,
} from "lucide-react";
import { LiquidGlassCard } from "../LiquidGlassCard";
import { cn } from "@/lib/utils";

export function SeoContentArtifact() {
  const [keyword, setKeyword] = useState("Best Courier Service in Bangladesh for F-Commerce 2026");
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [copied, setCopied] = useState(false);

  const titleEn = "Top 5 Courier Services in Bangladesh for F-Commerce (2026 COD Guide)";
  const titleBn = "২০২৬ সালে বাংলাদেশে এফ-কমার্সের জন্য সেরা ৫টি কুরিয়ার সার্ভিস ও সিওডি গাইড";

  const metaDescEn =
    "Discover the most reliable courier services in Bangladesh for cash-on-delivery (COD) e-commerce. Compare Steadfast, Pathao, RedX, Paperfly, and eCourier rates & return ratios.";
  const metaDescBn =
    "বাংলাদেশের সেরা কুরিয়ার সার্ভিস ও ক্যাশ অন ডেলিভারি (সিওডি) পার্সেল ডেলিভারি রেট, রিটার্ন রেট ও মার্চেন্ট পেমেন্ট সুবিধা বিস্তারিত জানুন।";

  const articleContentEn = `## The Landscape of Emerging Market E-Commerce Logistics

In Bangladesh, over 80% of digital consumer retail transactions still rely on **Cash-on-Delivery (COD)**. For Facebook (F-Commerce) and independent WooCommerce / Shopify brands, selecting the right courier partner is the single most critical factor in controlling return rates and preserving operating margins.

### 1. Steadfast Courier
- **Strengths:** Next-day Dhaka delivery, robust API webhooks for automated order booking, lowest parcel loss rate (0.4%).
- **Payment Cycle:** Next-day bKash merchant auto-settlement.
- **Coverage:** 64 districts with deep sub-district (Thana) penetration.

### 2. Pathao Courier
- **Strengths:** High urban brand recognition, express same-day Dhaka delivery options, user-friendly merchant portal.
- **Best For:** High-ticket consumer electronics and urgent fashion deliveries.

### 3. RedX Delivery
- **Strengths:** Extensive nationwide hub network, large enterprise capacity.
- **Best For:** Bulk shipments and nationwide distribution campaigns.

---

### Key Takeaways for High-Margin Operations
1. Always implement **automated WhatsApp order confirmation** before dispatching COD parcels.
2. Integrate **real-time webhook tracking** into your dashboard to proactively alert customers via SMS.`;

  const articleContentBn = `## বাংলাদেশের এফ-কমার্স লজিস্টিকস ও কুরিয়ার নির্বাচন

বাংলাদেশে অনলাইন কেনাকাটায় ৮০% এর বেশি লেনদেন এখনও **ক্যাশ অন ডেলিভারি (COD)** এর মাধ্যমে সম্পন্ন হয়। ফেসবুক ও নিজস্ব ওয়েবসাইটের উদ্যোক্তাদের জন্য সঠিক কুরিয়ার পার্টনার নির্বাচন করা মুনাফা ধরে রাখার মূল চাবিকাঠি।

### ১. স্টিডফাস্ট কুরিয়ার (Steadfast Courier)
- **সুবিধা:** ঢাকা ও সারাদেশে দ্রুত ডেলিভারি, আধুনিক এপিআই ওয়েবহুক এবং পার্সেল ড্যামেজ রেট মাত্র ০.৪%।
- **পেমেন্ট সাইকেল:** পরবর্তী কার্যদিবসে স্বয়ংক্রিয় বিকাশ ও ব্যাংক পেমেন্ট।
- **কভারেজ:** ৬৪ জেলা এবং প্রত্যন্ত থানা পর্যায়ে সরাসরি হোম ডেলিভারি।

### ২. পাঠাও কুরিয়ার (Pathao Courier)
- **সুবিধা:** ঢাকায় সেম-ডে এক্সপ্রেস ডেলিভারি এবং আধুনিক রিয়েল-টাইম ট্র্যাকিং অ্যাপ।
- **উপযোগী:** জরুরি পার্সেল এবং প্রিমিয়াম গ্যাজেট ডেলিভারির জন্য।

---

### রিটার্ন কমানোর জরুরি টিপস
১. পার্সেল পাঠানোর আগে অবশ্যই স্বয়ংক্রিয় হোয়াটসঅ্যাপ ওটিপি বা ফোন কলের মাধ্যমে অর্ডার নিশ্চিত করুন।
২. ওয়েবসাইটে লাইভ পার্সেল ট্র্যাকিং সুবিধা যুক্ত করুন যাতে ক্রেতা সহজেই পার্সেলের অবস্থান দেখতে পায়।`;

  const schemaJson = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: language === "en" ? titleEn : titleBn,
      description: language === "en" ? metaDescEn : metaDescBn,
      keywords: ["courier service bangladesh", "f-commerce logistics", "steadfast courier review", "pathao courier rates"],
      inLanguage: language === "en" ? "en-BD" : "bn-BD",
      author: {
        "@type": "Organization",
        name: "Shothik Hermes SEO Engine",
      },
    },
    null,
    2
  );

  const handleCopy = () => {
    const text = `# ${language === "en" ? titleEn : titleBn}\n\n**Meta Description:** ${language === "en" ? metaDescEn : metaDescBn}\n\n${language === "en" ? articleContentEn : articleContentBn}\n\n\`\`\`json\n${schemaJson}\n\`\`\``;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* ── Header ── */}
      <div className="h-14 border-b border-border px-4 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <span>SEO Content & Schema Generator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
                Google BD Rank 98/100
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Bilingual long-form articles, SERP snippets, and JSON-LD structured data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switch */}
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
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border shadow-xs transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Markdown"}</span>
          </button>
        </div>
      </div>

      {/* ── Content Viewport ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* SERP Preview Card */}
          <div className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span>https://shothikaddress.com</span>
              <span>›</span>
              <span>blog</span>
              <span>›</span>
              <span>courier-guide-2026</span>
            </div>
            <h3 className="text-sm font-bold text-blue-500 hover:underline cursor-pointer">
              {language === "en" ? titleEn : titleBn}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {language === "en" ? metaDescEn : metaDescBn}
            </p>
          </div>

          {/* Long-Form Article Body */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <h1 className="text-lg font-bold text-foreground">
              {language === "en" ? titleEn : titleBn}
            </h1>
            <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {language === "en" ? articleContentEn : articleContentBn}
            </div>
          </div>

          {/* Schema.org Structured Data */}
          <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <div className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span>Schema.org JSON-LD Structured Snippet</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Google Rich Snippets Ready</span>
            </div>
            <pre className="p-3 rounded-xl bg-background border border-border text-[11px] font-mono text-muted-foreground overflow-x-auto">
              {schemaJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeoContentArtifact;
