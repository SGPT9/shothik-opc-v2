"use client";

import React, { useState } from "react";
import {
  Sparkles,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Zap,
  Copy,
  Check,
  RefreshCw,
  BookOpen,
  Eye,
  Layers,
  ChevronRight,
  Bookmark,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ForecastBeat {
  chapter: number;
  title: string;
  summary: string;
}

export interface ForecastCharacterDecision {
  character: string;
  decision: string;
  irreversible: boolean;
}

export interface ForecastRisk {
  kind: "continuity" | "causality" | "character";
  status: "pass" | "caution" | "safe";
  description: string;
}

export interface ForecastBranch {
  branchId: string;
  title: string;
  tagline: string;
  premise: string;
  intentAlignment: number; // 0-100
  intentRationale: string;
  beats: ForecastBeat[];
  characterDecisions: ForecastCharacterDecision[];
  projectedChanges: {
    characters: string[];
    relationships: string[];
    world: string[];
    suspenseHooks: string[];
  };
  risks: ForecastRisk[];
}

interface NarrativeForecastViewProps {
  initialTopic?: string;
  currentChapter?: number;
  onAdoptBranch?: (branch: ForecastBranch) => void;
  onClose?: () => void;
}

export function NarrativeForecastView({
  initialTopic = "Amar Ekushey Boi Mela: AI Literary Renaissance in Dhaka",
  currentChapter = 3,
  onAdoptBranch,
  onClose,
}: NarrativeForecastViewProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("branch-1");
  const [isForecasting, setIsForecasting] = useState(false);
  const [adoptedBranchId, setAdoptedBranchId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const branches: ForecastBranch[] = [
    {
      branchId: "branch-1",
      title: "Branch A — Canonical Continuation",
      tagline: "Natural Literary Progression & Institutional Acceptance",
      premise: "The protagonist collaborates with Dhaka's legacy publishers at Bangla Academy, merging AI prose synthesis with authentic classical meter.",
      intentAlignment: 96,
      intentRationale: "Aligns 100% with the core brief of respectful cultural synthesis without disruptive shock value.",
      beats: [
        { chapter: currentChapter + 1, title: "The Sovereign Meter", summary: "Refining the algorithmic meter under the mentorship of a veteran Nilkhet typographer." },
        { chapter: currentChapter + 2, title: "Demy 6x9 Proof", summary: "First physical proof printing on 80 GSM Munken paper passes guild scrutiny." },
        { chapter: currentChapter + 3, title: "Ekushey Dawn", summary: "Opening day reception at Suhrawardy Udyan with record-breaking physical book sales." },
      ],
      characterDecisions: [
        { character: "Tanvir (Author)", decision: "Accepts co-authorship attribution with the veteran guild typographer.", irreversible: true },
        { character: "Zubair (Editor)", decision: "Enforces a strict human-in-the-loop review policy for all published stanzas.", irreversible: false },
      ],
      projectedChanges: {
        characters: ["Tanvir gains literary guild standing", "Publisher shifts from skeptical to ally"],
        relationships: ["Mentorship bond solidifies between Tanvir and Master Rafiq"],
        world: ["Bangla Academy officially sanctions hybrid AI typography guidelines"],
        suspenseHooks: ["A mysterious rival imprint announces a counter-monograph at Pavilion 14"],
      },
      risks: [
        { kind: "continuity", status: "pass", description: "100% compliant with established Dhaka timeline and Boi Mela schedule." },
        { kind: "causality", status: "pass", description: "All character motives stem directly from Chapter 3's print shop dispute." },
        { kind: "character", status: "safe", description: "Tanvir remains reflective and humble, matching established voice profile." },
      ],
    },
    {
      branchId: "branch-2",
      title: "Branch B — Dramatic Escalation",
      tagline: "Underground Print Syndicate & Direct-to-Reader Guerrilla Launch",
      premise: "Blocked by bureaucratic red tape, Tanvir bypasses traditional gatekeepers, deploying an open-source decentralized book press across Nilkhet.",
      intentAlignment: 88,
      intentRationale: "High dramatic stakes, accelerating narrative pace while maintaining technological realism.",
      beats: [
        { chapter: currentChapter + 1, title: "Midnight at Nilkhet", summary: "Guerrilla nighttime plate printing across 4 decentralized offset presses in Babupura." },
        { chapter: currentChapter + 2, title: "The Rogue Broadside", summary: "Leaked digital excerpts go viral across Dhaka tech communities, sparking public debate." },
        { chapter: currentChapter + 3, title: "Pavilion Confrontation", summary: "Dramatic face-off with regulatory inspectors outside the Amar Ekushey gate." },
      ],
      characterDecisions: [
        { character: "Tanvir (Author)", decision: "Rejects the Guild's restrictive copyright contract in favor of Open Creative Commons.", irreversible: true },
        { character: "Ayesha (Distributor)", decision: "Reroutes 5,000 copies via decentralized courier lockers across Dhaka.", irreversible: true },
      ],
      projectedChanges: {
        characters: ["Tanvir becomes an underground literary icon", "Guild blacklists official entry"],
        relationships: ["Strain with conservative family members; deep bond with young student press fleet"],
        world: ["F-Commerce merchants adopt peer-to-peer book drop networks"],
        suspenseHooks: ["Regulatory raid threatened on the primary Nilkhet warehouse"],
      },
      risks: [
        { kind: "continuity", status: "pass", description: "Matches Dhaka logistical infrastructure (Pathao/Steadfast lockboxes)." },
        { kind: "causality", status: "pass", description: "High-friction conflict is directly motivated by guild fee extortion." },
        { kind: "character", status: "caution", description: "Requires Tanvir to act more defiantly than his early introspective self." },
      ],
    },
    {
      branchId: "branch-3",
      title: "Branch C — Subversive Epistemic Twist",
      tagline: "Lost Manuscript Anomaly & Historical Parallel",
      premise: "While fine-tuning the model on 1952 language movement archives, Tanvir discovers an unpublished handwritten manuscript by a forgotten poet.",
      intentAlignment: 84,
      intentRationale: "Enriches the literary depth with historical mystery, elevating the manuscript from tech novel to timeless tribute.",
      beats: [
        { chapter: currentChapter + 1, title: "The Watermarked Folio", summary: "Extracting faded ink signatures from a 1952 archival ledger in Old Dhaka." },
        { chapter: currentChapter + 2, title: "Echoes of 1952", summary: "The AI reconstructs missing verses that mirror Tanvir's contemporary struggles." },
        { chapter: currentChapter + 3, title: "The Dual Dedication", summary: "Publishing a dual-tone heritage edition that honors the forgotten language martyr." },
      ],
      characterDecisions: [
        { character: "Tanvir (Author)", decision: "Surrenders solo royalties to fund an archival preservation foundation.", irreversible: true },
        { character: "Dr. Kabir (Archivist)", decision: "Authenticates the historical provenance despite political risks.", irreversible: true },
      ],
      projectedChanges: {
        characters: ["Tanvir's quest transforms from personal ambition to historic duty"],
        relationships: ["Deep intellectual partnership with national archives team"],
        world: ["Rediscovery of a lost literary movement in Bengali history"],
        suspenseHooks: ["A private collector attempts to purchase and bury the original manuscript"],
      },
      risks: [
        { kind: "continuity", status: "pass", description: "Historical dates and archival references verified against National Museum records." },
        { kind: "causality", status: "pass", description: "Model training anomaly directly connects to earlier OCR pipeline." },
        { kind: "character", status: "safe", description: "Deeply reinforces Tanvir's love for Bengali linguistic heritage." },
      ],
    },
  ];

  const activeBranch = branches.find((b) => b.branchId === selectedBranchId) || branches[0];

  const handleSimulateForecast = () => {
    setIsForecasting(true);
    setTimeout(() => {
      setIsForecasting(false);
    }, 800);
  };

  const handleAdopt = (branch: ForecastBranch) => {
    setAdoptedBranchId(branch.branchId);
    if (onAdoptBranch) {
      onAdoptBranch(branch);
    }
  };

  const handleCopyPlan = () => {
    const text = `# InkOS Narrative Forecast: ${activeBranch.title}\n\n**Premise**: ${activeBranch.premise}\n**Intent Alignment**: ${activeBranch.intentAlignment}%\n\n### Projected Chapter Beats:\n${activeBranch.beats.map((b) => `- **Chapter ${b.chapter}: ${b.title}** — ${b.summary}`).join("\n")}\n\n### Character Decisions:\n${activeBranch.characterDecisions.map((c) => `- **${c.character}**: ${c.decision} (${c.irreversible ? "Irreversible" : "Reversible"})`).join("\n")}\n\n### Risk & Continuity Audit:\n${activeBranch.risks.map((r) => `- [${r.kind.toUpperCase()}] (${r.status.toUpperCase()}) ${r.description}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden select-none relative">
      {/* ── Top Header Toolbar ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/80 bg-card/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shrink-0">
            <GitBranch className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground truncate">InkOS 3-Scenario Narrative Forecast</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
                v1.7 Canon Guard
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              Simulating Chapters {currentChapter + 1}–{currentChapter + 3} · Non-Canonical Planning Sandbox
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSimulateForecast}
            disabled={isForecasting}
            className="h-7 px-2.5 text-[11px] font-semibold gap-1.5 cursor-pointer bg-indigo-600/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-600/20"
          >
            <RefreshCw className={cn("h-3 w-3", isForecasting && "animate-spin")} />
            <span>{isForecasting ? "Forecasting..." : "Re-Simulate"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyPlan}
            className="h-7 px-2.5 text-[11px] font-semibold gap-1 cursor-pointer"
            title="Copy Forecast Plan Markdown"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy Plan"}</span>
          </Button>

          {onClose && (
            <button
              onClick={onClose}
              className="h-7 w-7 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer text-xs"
              title="Close Forecast Dock"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── 3-Branch Selector Strip (Side-by-Side Cards) ── */}
      <div className="grid grid-cols-3 gap-2.5 p-3.5 border-b border-border/80 bg-muted/20 shrink-0">
        {branches.map((branch) => {
          const isSelected = selectedBranchId === branch.branchId;
          const isAdopted = adoptedBranchId === branch.branchId;
          return (
            <div
              key={branch.branchId}
              onClick={() => setSelectedBranchId(branch.branchId)}
              className={cn(
                "group relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-card border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                  : "bg-card/40 border-border/70 hover:border-border hover:bg-card/70"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                    {branch.branchId}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {branch.intentAlignment}% Match
                  </span>
                </div>
                <h4 className="text-xs font-bold text-foreground line-clamp-1">{branch.title}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{branch.tagline}</p>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/40 text-[9px] font-mono text-muted-foreground">
                <span>{branch.beats.length} Beats Planned</span>
                {isAdopted && (
                  <span className="flex items-center gap-0.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Adopted
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Active Branch Deep Exploration Canvas ── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* Premise & Author Intent Alignment */}
        <div className="p-3.5 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Core Narrative Premise
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              Intent Score: {activeBranch.intentAlignment}/100
            </span>
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed font-serif italic">"{activeBranch.premise}"</p>
          <p className="text-[10px] text-muted-foreground font-mono pt-1">
            <strong>Alignment Analysis:</strong> {activeBranch.intentRationale}
          </p>
        </div>

        {/* Projected Chapter Beats Timeline */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Projected Chapter Beats Roadmap
          </h4>
          <div className="space-y-2">
            {activeBranch.beats.map((beat) => (
              <div
                key={beat.chapter}
                className="flex items-start gap-3 p-2.5 rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono font-bold text-[10px] shrink-0 mt-0.5">
                  Ch.{beat.chapter}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-bold text-foreground">{beat.title}</h5>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{beat.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Character Decisions & Irreversible Choices */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Irreversible Character Decisions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {activeBranch.characterDecisions.map((dec, i) => (
              <div key={i} className="p-2.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">{dec.character}</span>
                  <span
                    className={cn(
                      "text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold",
                      dec.irreversible
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                    )}
                  >
                    {dec.irreversible ? "Irreversible Choice" : "Reversible"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{dec.decision}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk & Continuity Canon Audit */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Canon Integrity & Risk Audit
          </h4>
          <div className="space-y-1.5">
            {activeBranch.risks.map((risk, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 p-2 rounded-lg border border-border/50 bg-card/40 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-bold shrink-0">
                    {risk.kind}
                  </span>
                  <span className="text-[10px] text-foreground truncate">{risk.description}</span>
                </div>
                <span
                  className={cn(
                    "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0",
                    risk.status === "pass" && "text-emerald-400 bg-emerald-500/10",
                    risk.status === "safe" && "text-cyan-400 bg-cyan-500/10",
                    risk.status === "caution" && "text-amber-400 bg-amber-500/10"
                  )}
                >
                  {risk.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Action Footer (Adopt Plan) ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-border/80 bg-card/80 backdrop-blur-md shrink-0">
        <div className="text-[10px] text-muted-foreground font-mono">
          <span>Target: </span>
          <strong className="text-foreground">{activeBranch.title}</strong>
          <span className="opacity-60"> · Non-destructive plan injection</span>
        </div>

        <Button
          size="sm"
          onClick={() => handleAdopt(activeBranch)}
          className={cn(
            "h-8 px-4 text-xs font-bold gap-1.5 cursor-pointer shadow-lg transition-all",
            adoptedBranchId === activeBranch.branchId
              ? "bg-emerald-600 hover:bg-emerald-500 text-white"
              : "bg-indigo-600 hover:bg-indigo-500 text-white"
          )}
        >
          {adoptedBranchId === activeBranch.branchId ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Branch Plan Adopted</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" />
              <span>Adopt This Branch Plan</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
