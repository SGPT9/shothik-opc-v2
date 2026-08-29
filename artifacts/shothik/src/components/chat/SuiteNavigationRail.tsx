import React, { useState } from "react";
import {
  FileSpreadsheet,
  Presentation,
  FileText,
  Mail,
  Code2,
  Layout,
  Database,
  MessageSquare,
  Image,
  Video,
  Mic,
  Users,
  ChevronDown,
  Sparkles,
  Layers,
  CheckCircle2,
  Plug,
} from "lucide-react";
import { Link } from "@/lib/navigation";

interface SuiteNavigationRailProps {
  onNavigateTab?: (tab: "sheet" | "slides" | "research" | "code" | "chat") => void;
}

export default function SuiteNavigationRail({ onNavigateTab }: SuiteNavigationRailProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleDropdownToggle = (key: string) => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto my-4 px-2">
      {/* ── GenSpark-Style Multi-Suite Strip ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 rounded-2xl bg-card/60 dark:bg-zinc-900/60 border border-border/70 backdrop-blur-xl shadow-xs">
        {/* 1. AI TEAM */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">
            AI Team
          </span>
          <Link
            href="/twin"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <div className="p-1 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 group-hover:scale-105 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-foreground group-hover:text-orange-500 transition-colors">
              Twin Co-Founder
            </span>
          </Link>
        </div>

        <div className="h-4 w-px bg-border/80 hidden md:block" />

        {/* 2. OFFICE SUITE (With Mega Menu) */}
        <div className="relative flex items-center gap-1.5">
          <button
            onClick={() => handleDropdownToggle("office")}
            className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors mr-1 cursor-pointer"
          >
            <span>Office Suite</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Quick Icons */}
          <Link
            href="/agents/sheet"
            onClick={() => onNavigateTab?.("sheet")}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-emerald-500 transition-colors">
              AI Sheets
            </span>
          </Link>

          <Link
            href="/agents/slides"
            onClick={() => onNavigateTab?.("slides")}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Presentation className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-amber-500 transition-colors">
              AI Slides
            </span>
          </Link>

          <Link
            href="/writing-studio"
            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <div className="p-1 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-cyan-500 transition-colors">
              AI Docs
            </span>
          </Link>

          {/* Office Mega Menu Dropdown */}
          {activeDropdown === "office" && (
            <div className="absolute top-full left-0 mt-2 w-80 p-3 rounded-2xl bg-card border border-border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                GenOffice Native Engines
              </div>
              <div className="space-y-1">
                <Link
                  href="/agents/sheet"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">AI Spreadsheets</div>
                      <div className="text-[10px] text-muted-foreground">Formulas, Smart Charts, 2D Pivot Tables</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">.XLSX</span>
                </Link>

                <Link
                  href="/agents/slides"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">AI Pitch Decks</div>
                      <div className="text-[10px] text-muted-foreground">Vector slide masters & typography</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">.PPTX</span>
                </Link>

                <Link
                  href="/writing-studio"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-500" />
                    <div>
                      <div className="text-xs font-semibold text-foreground">AI Writing & Book Typesetting</div>
                      <div className="text-[10px] text-muted-foreground">Nilkhet print-ready & APA 7 manuscripts</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded">.DOCX</span>
                </Link>
              </div>

              <div className="border-t border-border my-2 pt-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                  Ecosystem Compatibility
                </div>
                <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>100% Microsoft 365 & Google Workspace compatible</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border/80 hidden md:block" />

        {/* 3. BUILD SUITE */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">
            Build Suite
          </span>
          <button
            onClick={() => onNavigateTab?.("code")}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <div className="p-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 group-hover:scale-105 transition-transform">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-blue-500 transition-colors">
              Code Sandbox
            </span>
          </button>

          <Link
            href="/connectors"
            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
          >
            <div className="p-1 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <Plug className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-medium text-foreground group-hover:text-purple-500 transition-colors">
              Connectors
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
