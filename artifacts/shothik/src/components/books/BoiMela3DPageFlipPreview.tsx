"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Globe, 
  Eye, 
  Sliders, 
  ExternalLink,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import { LiquidGlassCard } from "../chat/LiquidGlassCard";

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
  coverColor: "#4338ca",
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
export const toBengaliNumber = (num: number | string): string => {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map((d) => bnDigits[parseInt(d, 10)] ?? d).join("");
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
  const [isFlipping, setIsFlipping] = useState(false);

  // Print Spec Interactive Overlays
  const [showCmykGuides, setShowCmykGuides] = useState(false);
  const [showGutterMargin, setShowGutterMargin] = useState(false);
  const [showBleedGuides, setShowBleedGuides] = useState(false);

  const totalPages = book.chapters.length + 1; // 0 = Cover, 1..N = Chapters

  const triggerPageFlip = useCallback((targetPage: number) => {
    if (targetPage < 0 || targetPage >= totalPages || targetPage === currentPage) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentPage(targetPage);
      setIsFlipping(false);
    }, 180);
  }, [currentPage, totalPages]);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      triggerPageFlip(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      triggerPageFlip(currentPage - 1);
    }
  };

  const [bookTouchStart, setBookTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleBookTouchStart = (e: React.TouchEvent) => {
    setBookTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleBookTouchEnd = (e: React.TouchEvent) => {
    if (!bookTouchStart) return;
    const deltaX = e.changedTouches[0].clientX - bookTouchStart.x;
    const deltaY = e.changedTouches[0].clientY - bookTouchStart.y;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped Left ➔ Flip forward
        handleNextPage();
      } else {
        // Swiped Right ➔ Flip backward
        handlePrevPage();
      }
    }
    setBookTouchStart(null);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === "Home") {
        e.preventDefault();
        triggerPageFlip(0);
      } else if (e.key === "End") {
        e.preventDefault();
        triggerPageFlip(totalPages - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, triggerPageFlip]);

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);

      // Trigger automatic file download simulation
      try {
        const dummyPdfContent = `%PDF-1.4\n% Boi Mela Print Specification Export\nTitle: ${book.titleBn}\nAuthor: ${book.authorBn}\nFormat: 6.0 x 9.0 Royal Demy 300 DPI CMYK`;
        const blob = new Blob([dummyPdfContent], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${book.titleEn.toLowerCase().replace(/[^a-z0-9]/g, "_")}_print_ready.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("PDF export trigger error:", err);
      }

      setTimeout(() => setExportSuccess(false), 3500);
    }, 1200);
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-slate-100 p-4 sm:p-6 overflow-y-auto ${className}`}>
      {/* ── 1. Top Header & Mode Toggle ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>বইমেলা প্রকাশনা স্টুডিও</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                6.0 × 9.0" Royal Demy
              </span>
            </h2>
            <p className="text-xs text-slate-400">অমর একুশে স্ট্যান্ডার্ড &middot; 300 DPI CMYK কালার গাইড &middot; জাস্টিফায়েড টাইপোগ্রাফি</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => setViewMode("book_view")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === "book_view" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>3D প্রিভিউ</span>
          </button>
          <button
            onClick={() => setViewMode("spec_view")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              viewMode === "spec_view" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>প্রিন্ট স্পেক্স</span>
          </button>
        </div>
      </div>

      {/* ── 2. Main Work Area ── */}
      <div className="flex-1 flex flex-col items-center justify-center my-6">
        {viewMode === "book_view" ? (
          <div className="relative w-full max-w-lg perspective-1000 flex flex-col items-center select-none">
            
            {/* Live Print Guides Toolbar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-4 text-[11px]">
              <button
                onClick={() => setShowCmykGuides((prev) => !prev)}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                  showCmykGuides
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-semibold"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>300 DPI CMYK গাইড</span>
                {showCmykGuides && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
              </button>

              <button
                onClick={() => setShowGutterMargin((prev) => !prev)}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                  showGutterMargin
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-semibold"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>0.75" বাইন্ডিং গাটার</span>
                {showGutterMargin && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
              </button>

              <button
                onClick={() => setShowBleedGuides((prev) => !prev)}
                className={`px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
                  showBleedGuides
                    ? "bg-rose-500/20 border-rose-500/40 text-rose-300 font-semibold"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>0.125" ব্লিড মার্জিন</span>
                {showBleedGuides && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />}
              </button>
            </div>

            {/* 3D 6x9 (Aspect Ratio Locked) Book Canvas */}
            <div 
              onTouchStart={handleBookTouchStart}
              onTouchEnd={handleBookTouchEnd}
              className={`relative w-80 h-[480px] rounded-r-2xl rounded-l-sm shadow-2xl transition-all duration-300 transform-style-3d border border-white/20 overflow-hidden flex flex-col justify-between select-none ${
                isFlipping ? "scale-95 rotate-y-6 opacity-90" : "scale-100 rotate-y-0 opacity-100"
              }`}
              style={{
                backgroundColor: currentPage === 0 ? book.coverColor || "#4338ca" : "#faf8f5",
                color: currentPage === 0 ? "#ffffff" : "#1e293b",
                boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.85), -15px 0 30px -5px rgba(0, 0, 0, 0.5), inset 2px 0 4px rgba(255,255,255,0.1)",
              }}
            >
              {/* Left Spine Shadow / Realistic Book Crease */}
              <div className="absolute left-0 top-0 bottom-0 w-7 bg-gradient-to-r from-black/50 via-black/20 to-transparent pointer-events-none z-30" />
              
              {/* Right Paper Stack Edge Highlights */}
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-30" />

              {/* ── Interactive Guide Overlays ── */}
              {showBleedGuides && (
                <div className="absolute inset-2 border-2 border-dashed border-rose-500/60 pointer-events-none z-40 rounded-sm">
                  <span className="absolute top-1 right-1 text-[8px] font-mono text-rose-500 bg-rose-950/80 px-1 rounded">0.125" Bleed</span>
                </div>
              )}

              {showGutterMargin && (
                <div className="absolute left-9 top-0 bottom-0 border-r-2 border-dashed border-amber-500/60 pointer-events-none z-40">
                  <span className="absolute top-2 left-1 text-[8px] font-mono text-amber-500 bg-amber-950/80 px-1 rounded">0.75" Gutter</span>
                </div>
              )}

              {showCmykGuides && (
                <div className="absolute top-2 right-2 flex items-center gap-1 z-40 bg-black/70 px-1.5 py-0.5 rounded border border-white/20 pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" title="Cyan" />
                  <span className="w-2 h-2 rounded-full bg-pink-500" title="Magenta" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400" title="Yellow" />
                  <span className="w-2 h-2 rounded-full bg-black border border-white/40" title="Key/Black" />
                  <span className="text-[8px] font-mono text-white ml-1">300 DPI</span>
                </div>
              )}

              {currentPage === 0 ? (
                /* ── Book Cover Page ── */
                <div className="flex-1 flex flex-col justify-between p-8 text-center relative z-10">
                  <div className="pt-6">
                    <span className="text-[10px] tracking-widest uppercase font-mono px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
                      অমর একুশে প্রকাশনা সংস্করণ
                    </span>
                    <h1 className="text-2xl font-black mt-8 leading-snug text-white drop-shadow-sm">{book.titleBn}</h1>
                    <p className="text-xs text-indigo-200 mt-2 font-medium">{book.titleEn}</p>
                  </div>

                  <div className="pb-4">
                    <div className="w-16 h-0.5 bg-white/40 mx-auto my-4 rounded-full" />
                    <p className="text-base font-bold text-white">{book.authorBn}</p>
                    <p className="text-xs text-indigo-200 font-sans">{book.authorEn}</p>
                    <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[10px] font-mono text-indigo-200">
                      <span>রয়েল ডেমি (6×9")</span>
                      <span>ISBN: {book.isbn}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Chapter Content Page ── */
                <div className="flex-1 flex flex-col justify-between p-8 pl-10 text-slate-800 relative z-10 font-serif">
                  <div>
                    {/* Header with Bengali Pagination */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pb-3 border-b border-slate-200 font-sans">
                      <span className="truncate max-w-[180px] font-medium">{book.titleBn}</span>
                      <span className="font-mono font-semibold text-indigo-600">
                        পৃষ্ঠা {toBengaliNumber(currentPage)}
                      </span>
                    </div>

                    {/* Chapter Title & Subtitle */}
                    <div className="mt-5 mb-4">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {book.chapters[currentPage - 1].titleBn}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-sans italic mt-0.5">
                        {book.chapters[currentPage - 1].titleEn}
                      </p>
                    </div>

                    {/* Chapter Paragraphs with Justified Typography */}
                    <div className="space-y-3 text-[13px] leading-relaxed text-slate-700 text-justify">
                      {book.chapters[currentPage - 1].content.map((p, idx) => (
                        <p key={idx} className="indent-4">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Footer Decoration */}
                  <div className="text-center pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-400">
                    — {toBengaliNumber(currentPage)} —
                  </div>
                </div>
              )}
            </div>

            {/* ── Page Navigation Controls ── */}
            <div className="flex items-center justify-between w-80 mt-6">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white disabled:opacity-30 hover:bg-slate-800 active:scale-95 transition cursor-pointer shadow-md"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs font-mono font-semibold text-slate-200">
                  {currentPage === 0
                    ? "প্রচ্ছদ (Cover Page)"
                    : `পৃষ্ঠা ${toBengaliNumber(currentPage)} / ${toBengaliNumber(totalPages - 1)}`}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentPage === 0 ? "Boi Mela Royal Demy" : book.chapters[currentPage - 1].titleEn.split(":")[0]}
                </span>
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white disabled:opacity-30 hover:bg-slate-800 active:scale-95 transition cursor-pointer shadow-md"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* ── Print Spec & Distribution Engine View ── */
          <div className="w-full max-w-lg space-y-4">
            <LiquidGlassCard intensity="vibrant" palette="indigo" className="p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Printer className="w-4 h-4 text-indigo-400" />
                <span>অমর একুশে প্রিন্ট স্পেসিফিকেশন (Print Specifications)</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[11px] pt-1">
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <span className="text-slate-400 block">কাগজের সাইজ:</span>
                  <span className="font-semibold text-white">6.0 × 9.0 ইঞ্চি (Royal Demy)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <span className="text-slate-400 block">কালার প্রোফাইল:</span>
                  <span className="font-semibold text-white">CMYK (300 DPI High-Res)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <span className="text-slate-400 block">ইনার মার্জিন (Gutter):</span>
                  <span className="font-semibold text-white">0.75 ইঞ্চি (বন্ডিং সহ)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                  <span className="text-slate-400 block">আউটার ব্লিড মার্জিন:</span>
                  <span className="font-semibold text-white">0.125 ইঞ্চি (3.175 mm)</span>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard intensity="vibrant" palette="steadfast" className="p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>বিতরণ চ্যানেল সংযোগ (Distribution Channels)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-semibold">
                  3 Channels Live
                </span>
              </div>
              <div className="space-y-2 pt-1 text-[11px]">
                <a
                  href="https://www.rokomari.com/book"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-emerald-500/40 transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">রকমারি ডট কম (Rokomari API)</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>
                  <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> রেডি (Ready)
                  </span>
                </a>

                <a
                  href="https://www.boibazar.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-emerald-500/40 transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">বইবাজার প্রকাশনা (BoiBazar)</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 transition" />
                  </div>
                  <span className="text-emerald-400 font-mono flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> রেডি (Ready)
                  </span>
                </a>

                <a
                  href="https://loomfeed.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/10 hover:border-indigo-500/40 transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">লুমফিড ডিজিটাল এডিশন (Loomfeed)</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition" />
                  </div>
                  <span className="text-indigo-400 font-mono flex items-center gap-1 font-semibold">
                    ⚡ সিঙ্কড (Synced)
                  </span>
                </a>
              </div>
            </LiquidGlassCard>
          </div>
        )}
      </div>

      {/* ── 3. Bottom 1-Click Print PDF Export Action ── */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
        >
          {isExporting ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>৬×৯ প্রিন্ট-রেডি পিডিএফ জেনারেট হচ্ছে...</span>
            </span>
          ) : exportSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>৬×৯ প্রিন্ট পিডিএফ ডাউনলোড সম্পন্ন! (Export Ready)</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>১-ক্লিক ৬×৯ প্রিন্ট-রেডি পিডিএফ ডাউনলোড (Export Print PDF)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
