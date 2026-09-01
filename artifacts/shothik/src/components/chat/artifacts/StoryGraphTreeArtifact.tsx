"use client";

import React, { useState } from "react";
import {
  GitFork,
  Play,
  Sparkles,
  Download,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  BookOpen,
  Layers,
  Flag,
  User,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Trophy,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StoryNode {
  id: string;
  title: string;
  type: "root" | "choice" | "ending";
  pov: string;
  chapter: number;
  wordCount: number;
  summary: string;
  dialoguePreview: string;
  choices: {
    id: string;
    text: string;
    targetNodeId: string;
    requiredFlag?: string;
  }[];
  variablesDelta?: { key: string; value: string }[];
}

export function StoryGraphTreeArtifact({
  initialTitle = "Ekushey 1952: The Lost Folio — Branching Narrative Tree",
}: {
  initialTitle?: string;
}) {
  const [zoom, setZoom] = useState(100);
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-1");
  const [copied, setCopied] = useState(false);
  const [playerMode, setPlayerMode] = useState(false);
  const [activePlayerNodeId, setActivePlayerNodeId] = useState<string>("node-1");
  const [inventory, setInventory] = useState<Record<string, string>>({
    guild_pass: "Active",
    reputation: "+15",
    manuscript_ink: "Archival Iron Gall",
  });

  const nodes: StoryNode[] = [
    {
      id: "node-1",
      title: "Scene 1: Midnight Discovery at Nilkhet",
      type: "root",
      pov: "Tanvir (Author)",
      chapter: 1,
      wordCount: 1420,
      summary: "In a dimly lit alley behind Babupura Market, Tanvir examines a watermarked letterpress folio dated February 21, 1952.",
      dialoguePreview: '"Master Rafiq, look at this watermark. It bears the seal of the Old Dhaka Student Action Committee."',
      choices: [
        { id: "c1", text: "Take the folio directly to Bangla Academy Archivists", targetNodeId: "node-2" },
        { id: "c2", text: "Digitize and publish the verses as a guerrilla web edition", targetNodeId: "node-3" },
      ],
      variablesDelta: [{ key: "discovered_folio", value: "true" }],
    },
    {
      id: "node-2",
      title: "Scene 2A: The Institutional Guild Hall",
      type: "choice",
      pov: "Dr. Kabir (Archivist)",
      chapter: 2,
      wordCount: 1680,
      summary: "Bangla Academy scholars verify the ink chemistry. Conservative board members demand exclusive copyright ownership.",
      dialoguePreview: '"If this goes into the public domain, Tanvir, the commercial presses will misattribute the martyr\'s legacy."',
      choices: [
        { id: "c3", text: "Sign the institutional deed to preserve official state honors", targetNodeId: "node-4" },
        { id: "c4", text: "Refuse exclusivity and demand open public heritage licensing", targetNodeId: "node-5" },
      ],
      variablesDelta: [{ key: "institutional_trust", value: "+30" }],
    },
    {
      id: "node-3",
      title: "Scene 2B: Guerrilla Press Network",
      type: "choice",
      pov: "Ayesha (Distributor)",
      chapter: 2,
      wordCount: 1850,
      summary: "Using 4 offset presses across Babupura, student typographers print 3,000 broadsheets distributed overnight via courier lockers.",
      dialoguePreview: '"By sunrise, every book stall on Nilkhet road will have the authentic verses in their window."',
      choices: [
        { id: "c5", text: "Organize a public reading at the Central Shaheed Minar", targetNodeId: "node-6" },
        { id: "c6", text: "Deliver the printed batches to Boi Mela Pavilion 14", targetNodeId: "node-5" },
      ],
      variablesDelta: [{ key: "underground_standing", value: "+40" }],
    },
    {
      id: "node-4",
      title: "Ending A: The Gilded State Laureate",
      type: "ending",
      pov: "Tanvir",
      chapter: 3,
      wordCount: 2100,
      summary: "The manuscript is enshrined in the National Museum. Tanvir is awarded the Ekushey Padak for literary heritage recovery.",
      dialoguePreview: '"The preservation is complete, but the living voice belongs to the glass case now."',
      choices: [],
      variablesDelta: [{ key: "ending_type", value: "Institutional Canonization" }],
    },
    {
      id: "node-5",
      title: "Ending B: The People's Ekushey Renaissance",
      type: "ending",
      pov: "Tanvir & Master Rafiq",
      chapter: 3,
      wordCount: 2400,
      summary: "The open edition becomes the highest-selling monograph in Boi Mela history, printed by 50 independent Nilkhet presses simultaneously.",
      dialoguePreview: '"Words written for freedom can never be locked behind private gates."',
      choices: [],
      variablesDelta: [{ key: "ending_type", value: "Universal Public Commons" }],
    },
    {
      id: "node-6",
      title: "Ending C: The Midnight Vigil",
      type: "ending",
      pov: "Ayesha",
      chapter: 3,
      wordCount: 1950,
      summary: "Thousands of students and poets gather under candle flame at Shaheed Minar, reciting the recovered verses into the night.",
      dialoguePreview: '"Listen to Dhaka breathing. The language martyrs speak once more."',
      choices: [],
      variablesDelta: [{ key: "ending_type", value: "Cultural Revolution" }],
    },
  ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const activePlayerNode = nodes.find((n) => n.id === activePlayerNodeId) || nodes[0];

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(nodes, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayerChoice = (targetNodeId: string) => {
    setActivePlayerNodeId(targetNodeId);
    setSelectedNodeId(targetNodeId);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden select-none relative">
      {/* ── Top Header Toolbar ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/80 bg-card/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
            <GitFork className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-foreground truncate">{initialTitle}</h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                InkOS Interactive Tree
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate">
              {nodes.length} Story Nodes · 3 Ending Branches · Variable Invariants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPlayerMode(!playerMode)}
            className={cn(
              "h-7 px-2.5 text-[11px] font-semibold gap-1.5 cursor-pointer transition",
              playerMode
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-emerald-600/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/20"
            )}
          >
            <Play className="h-3 w-3" />
            <span>{playerMode ? "Exit Player" : "Play Story"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.max(70, z - 10))}
            className="h-7 w-7 p-0 rounded-lg"
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <span className="text-[10px] font-mono text-muted-foreground px-1">{zoom}%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom((z) => Math.min(130, z + 10))}
            className="h-7 w-7 p-0 rounded-lg"
          >
            <ZoomIn className="h-3 w-3" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyJSON}
            className="h-7 px-2.5 text-[11px] font-semibold gap-1 cursor-pointer"
            title="Copy Story Graph JSON"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "JSON"}</span>
          </Button>
        </div>
      </div>

      {/* ── Main Canvas View: Interactive Story Player vs SVG Tree ── */}
      {playerMode ? (
        <div className="flex-1 min-h-0 p-6 overflow-y-auto bg-card/40 flex flex-col items-center justify-center custom-scrollbar">
          <div className="w-full max-w-xl p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Chapter {activePlayerNode.chapter} · POV: {activePlayerNode.pov}
              </span>
              <span
                className={cn(
                  "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full",
                  activePlayerNode.type === "root" && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
                  activePlayerNode.type === "choice" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
                  activePlayerNode.type === "ending" && "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                )}
              >
                {activePlayerNode.type.toUpperCase()}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-foreground">{activePlayerNode.title}</h3>
              <p className="text-xs text-foreground/90 leading-relaxed font-serif">{activePlayerNode.summary}</p>
              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 font-serif italic text-xs text-foreground/80">
                {activePlayerNode.dialoguePreview}
              </div>
            </div>

            {/* Interactive Player Choices */}
            {activePlayerNode.choices.length > 0 ? (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                  Select Narrative Branch:
                </span>
                <div className="space-y-2">
                  {activePlayerNode.choices.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handlePlayerChoice(c.targetNodeId)}
                      className="w-full text-left p-3 rounded-xl border border-border/80 bg-card hover:border-emerald-500/80 hover:bg-emerald-500/10 transition flex items-center justify-between group cursor-pointer"
                    >
                      <span className="text-xs font-medium text-foreground group-hover:text-emerald-300">
                        {c.text}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-400 shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-center space-y-2">
                <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
                <h4 className="text-xs font-bold text-amber-300">Story Resolution Reached!</h4>
                <p className="text-[11px] text-amber-200/80 font-serif">
                  You completed this branching path. State variables and achievement badges have been recorded.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setActivePlayerNodeId("node-1")}
                  className="mt-2 text-xs font-semibold gap-1 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Replay Story from Scene 1
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Visual Graph Tree View */
        <div className="flex-1 min-h-0 p-6 overflow-auto bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] custom-scrollbar flex items-center justify-center">
          <div
            style={{ transform: `scale(${zoom / 100})` }}
            className="w-full max-w-3xl space-y-4 transition-transform duration-200"
          >
            {nodes.map((node, i) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeId(node.id)}
                  className={cn(
                    "p-3.5 rounded-2xl border bg-card/80 backdrop-blur-xl shadow-lg transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-emerald-500/80 bg-emerald-500/10 ring-1 ring-emerald-500/30 shadow-emerald-500/10"
                      : "border-border/80 hover:border-emerald-500/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-lg font-mono font-bold text-xs shrink-0",
                          node.type === "root" && "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30",
                          node.type === "choice" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
                          node.type === "ending" && "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        )}
                      >
                        0{i + 1}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate">{node.title}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          POV: {node.pov} · {node.wordCount} Words
                        </span>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase shrink-0",
                        node.type === "root" && "text-indigo-400 bg-indigo-500/10",
                        node.type === "choice" && "text-emerald-400 bg-emerald-500/10",
                        node.type === "ending" && "text-amber-400 bg-amber-500/10"
                      )}
                    >
                      {node.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground font-serif line-clamp-1 mt-2">{node.summary}</p>

                  {/* Branching choices pills */}
                  {node.choices.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-border/50">
                      {node.choices.map((c) => (
                        <span
                          key={c.id}
                          className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/40"
                        >
                          ➔ {c.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Node Inspector Bottom Drawer ── */}
      {!playerMode && selectedNode && (
        <div className="border-t border-border/80 bg-card/95 backdrop-blur-xl p-3.5 shrink-0 space-y-1.5 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Node Inspection: {selectedNode.title}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              Chapter {selectedNode.chapter} · {selectedNode.wordCount} words
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{selectedNode.summary}</p>
          <div className="p-2 rounded-lg border border-border/60 bg-muted/20 font-serif italic text-xs text-foreground/80">
            {selectedNode.dialoguePreview}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground pt-1">
            <span>POV: <strong className="text-foreground">{selectedNode.pov}</strong></span>
            <span>•</span>
            <span>Choices: <strong className="text-emerald-400">{selectedNode.choices.length} Branches</strong></span>
            <span>•</span>
            <span>Canon Guard: <strong className="text-cyan-400">100% Invariant Compliant</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
