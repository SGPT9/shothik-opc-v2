"use client";

import React, { useState } from "react";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Printer, 
  Share2, 
  Sparkles, 
  Layers, 
  Check, 
  FileText, 
  Globe 
} from "lucide-react";
import { LiquidGlassCard } from "../chat/LiquidGlassCard.js";

export interface BookChapter {
  id: string;
  titleBn: string;
  titleEn: string;
  content: string[];
}

export interface BoiMelaBookData {
  titleBn: string;
  titleEn: string;
  authorBn: string;
  authorEn: string;
  isbn?: string;
  coverColor?: string;
  chapters: BookChapter[];
}

const DEFAULT_SAMPLE_BOOK: BoiMelaBookData = {
  titleBn: "ডিজিটাল অমর একুশে: এআই যুগে বাংলা সাহিত্য",
  titleEn: "Digital Amar Ekushey: Bangla Literature in the AI Era",
  authorBn: "ড. সাইফুর রহমান",
  authorEn: "Dr. Saifur Rahman",
  isbn: "978-984-95432-1-0",
  coverColor: "#4f46e5",
  chapters: [
    {
      id: "ch-1",
      titleBn: "প্রথম অধ্যায়: শব্দ ও অ্যালগরিদমের মেলবন্ধন",
      titleEn: "Chapter 1: The Harmony of Words & Algorithms",
      content: [
        "অমর একুশে বইমেলার ধুলাবালিমাখা বিকেলে যখন নতুন বইয়ের সুবাস ছড়িয়ে পড়ে, তখন প্রযুক্তির স্পর্শে বাংলা সাহিত্যের প্রকাশনা শিল্পে এক নতুন দিগন্ত উন্মোচিত হয়েছে।",
        "আজকের কৃত্রিম বুদ্ধিমত্তা কেবল তথ্য প্রক্রিয়াকরণেই সীমাবদ্ধ নয়; বরং বাংলা ভাষার সমৃদ্ধ রূপতত্ত্ব, ব্যাকরণ ও সাহিত্যের রূপক সৃষ্টিতেও এক অনন্য ভূমিকা রাখছে।",
        "আমরা যখন একটি ৬×৯ ইঞ্চি মাপের মুদ্রিত বইয়ের পৃষ্ঠা স্পর্শ করি, তখন তা কেবল অক্ষরের সমাহার থাকে না, হয়ে ওঠে চিন্তা ও অনুভূতির এক শাশ্বত দলিল।"
      ],
    },
    {
      id: "ch-2",
      titleBn: "দ্বিতীয় অধ্যায়: প্রকাশনা স্বত্ব ও বিকেন্দ্রীভূত জ্ঞান",
      titleEn: "Chapter 2: Copyright & Decentralized Knowledge",
      content: [
        "ডিজিটাল যুগে স্বত্বাধিকার সংরক্ষণ ও রয়্যালটি ব্যবস্থাপনা অত্যন্ত সংবেদনশীল। লেখকদের মেধা ও শ্রমের ন্যায্য মূল্যায়ন নিশ্চিত করতেই তৈরি হয়েছে ডিজিটাল প্রোভেন্যান্স প্রোটোকল।",
        "রকমারি, বইবাজার এবং লোকাল প্রেসের সঙ্গে স্বয়ংক্রিয় এপিআই ইন্টিগ্রেশনের মাধ্যমে লেখক এখন নিমেষেই নিজের পাণ্ডুলিপি প্রিন্ট-রেডি ফরম্যাটে রূপান্তর করতে পারেন।"
      ],
    },
    {
      id: "ch-3",
      titleBn: "তৃতীয় অধ্যায়: ভবিষ্যতের বইমেলা",
      titleEn: "Chapter 3: The Future of Boi Mela",
      content: [
        "ভবিষ্যতের বইমেলা কেবল কাগজের পাতায় সীমাবদ্ধ থাকবে না। ইন্টারেক্টিভ অডিও-বুক, এআই ভয়েস টুইন এবং থ্রিডি রিডিং অভিজ্ঞতার মাধ্যমে নতুন প্রজন্ম বাংলা সাহিত্যের প্রতি আরও গভীরভাবে আকৃষ্ট হবে।"
      ],
    },
  ],
};

// Bengali numeral converter
const toBengaliNumber = (num: number): string => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map((d) => bnDigits[parseInt(d, 10)] || d).join("");
};

export function BoiMela3DPageFlipPreview({
  book = DEFAULT_SAMPLE_BOOK,
  className = "",
}: {
  book?: BoiMelaBookData;
  className?: string;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"book_view" | "spec_view">("book_view");

  const totalPages = book.chapters.length + 1; // 0 = Cover, 1..N = Chapters

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-foreground p-4 overflow-y-auto ${className}`}>
      {/* ── Top Header & Mode Toggle ── */}
      <div className="flex items-center justify-between pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-sm font-bold tracking-tight">বইমেলা প্রকাশনা স্টুডিও (6×9 Print Studio)</h2>
            <p className="text-[11px] text-muted-foreground">অমর একুশে স্ট্যান্ডার্ড &middot; 300 DPI CMYK গাইড</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => setViewMode("book_view")}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              viewMode === "book_view" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            3D প্রিভিউ
          </button>
          <button
            onClick={() => setViewMode("spec_view")}
            className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              viewMode === "spec_view" ? "bg-indigo-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            প্রিন্ট স্পেক্স
          </button>
        </div>
      </div>

      {/* ── Main Work Area ── */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        {viewMode === "book_view" ? (
          <div className="relative w-full max-w-md perspective-1000 flex flex-col items-center">
            {/* 3D 6x9 Book Stage */}
            <div 
              className="relative w-72 h-[432px] rounded-r-xl rounded-l-sm shadow-2xl transition-transform duration-500 transform-style-3d border border-white/15 overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: currentPage === 0 ? book.coverColor || "#4f46e5" : "#fcfbf7",
                color: currentPage === 0 ? "#ffffff" : "#1e293b",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), -10px 0 20px -5px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* Left Spine Shadow / Book Crease */}
              <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/40 via-black/15 to-transparent pointer-events-none z-20" />

              {currentPage === 0 ? (
                /* ── Book Cover Page ── */
                <div className="flex-1 flex flex-col justify-between p-6 text-center relative z-10">
                  <div className="pt-8">
                    <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 rounded-full bg-white/20">
                      অমর একুশে সংস্করণ
                    </span>
                    <h1 className="text-xl font-black mt-6 leading-snug">{book.titleBn}</h1>
                    <p className="text-xs opacity-80 mt-1 font-sans">{book.titleEn}</p>
                  </div>

                  <div className="pb-4">
                    <div className="w-12 h-0.5 bg-white/40 mx-auto my-3" />
                    <p className="text-sm font-semibold">{book.authorBn}</p>
                    <p className="text-[11px] opacity-75 font-mono mt-1">ISBN: {book.isbn}</p>
                  </div>
                </div>
              ) : (
                /* ── Chapter Content Page ── */
                <div className="flex-1 flex flex-col justify-between p-7 text-slate-800 relative z-10 font-serif">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pb-3 border-b border-slate-200">
                      <span className="truncate max-w-[160px]">{book.titleBn}</span>
                      <span className="font-mono">পৃষ্ঠা {toBengaliNumber(currentPage)}</span>
                    </div>

                    {/* Chapter Title */}
                    <h3 className="text-base font-bold text-slate-900 mt-4 mb-3 leading-snug">
                      {book.chapters[currentPage - 1].titleBn}
                    </h3>

                    {/* Chapter Paragraphs with Drop Cap on First */}
                    <div className="space-y-2.5 text-[12px] leading-relaxed text-slate-700 text-justify">
                      {book.chapters[currentPage - 1].content.map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-400">
                    — {toBengaliNumber(currentPage)} —
                  </div>
                </div>
              )}
            </div>

            {/* ── Page Navigation Controls ── */}
            <div className="flex items-center justify-between w-72 mt-5">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-white disabled:opacity-30 hover:bg-slate-800 transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono text-muted-foreground">
                {currentPage === 0 ? "প্রচ্ছদ (Cover)" : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages - 1)}`}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 text-white disabled:opacity-30 hover:bg-slate-800 transition cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* ── Print Spec View ── */
          <div className="w-full max-w-md space-y-3">
            <LiquidGlassCard intensity="subtle" className="p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Printer className="w-4 h-4" />
                <span>অমর একুশে প্রিন্ট স্পেসিফিকেশন</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-muted-foreground block">কাগজের সাইজ:</span>
                  <span className="font-semibold">6.0 × 9.0 ইঞ্চি (Royal Demy)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-muted-foreground block">কালার প্রোফাইল:</span>
                  <span className="font-semibold">CMYK (300 DPI)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-muted-foreground block">ইনার মার্জিন (Gutter):</span>
                  <span className="font-semibold">0.75 ইঞ্চি (বন্ডিং সহ)</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <span className="text-muted-foreground block">আউটার ব্লিড:</span>
                  <span className="font-semibold">0.125 ইঞ্চি</span>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="subtle" className="p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Globe className="w-4 h-4" />
                <span>বিতরণ চ্যানেল সংযোগ (Distribution Channels)</span>
              </div>
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <span>রকমারি ডট কম (Rokomari API)</span>
                  <span className="text-emerald-400 font-mono">🟢 রেডি</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <span>বইবাজার প্রকাশনা (BoiBazar)</span>
                  <span className="text-emerald-400 font-mono">🟢 রেডি</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-white/5">
                  <span>লুমফিড ডিজিটাল এডিশন (Loomfeed)</span>
                  <span className="text-indigo-400 font-mono">⚡ সিঙ্কড</span>
                </div>
              </div>
            </LiquidGlassCard>
          </div>
        )}
      </div>

      {/* ── Bottom Action Controls ── */}
      <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-3">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
        >
          {isExporting ? (
            <span>পিডিএফ জেনারেট হচ্ছে...</span>
          ) : exportSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>৬×৯ প্রিন্ট পিডিএফ ডাউনলোড সম্পন্ন!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>৬×৯ প্রিন্ট-রেডি পিডিএফ ডাউনলোড</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
