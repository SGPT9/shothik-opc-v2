"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Presentation,
  Table2,
  BookOpen,
  FileText,
  Brain,
  Mic,
  CreditCard,
  Truck,
  Sparkles,
  Layers,
  Zap,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useModalA11y } from "@/hooks/ui/useModalA11y";

interface CommandPaletteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAction?: (action: string) => void;
}

interface CommandItem {
  id: string;
  category: "Studios" | "Autonomous Twin" | "Logistics & MFS" | "Tools" | "Developer Sandbox";
  title: string;
  subtitle: string;
  icon: any;
  shortcut?: string;
  badge?: string;
  action: () => void;
}

export function CommandPaletteModal({
  open,
  onOpenChange,
  onSelectAction,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useModalA11y({
    isOpen: open,
    onClose: () => onOpenChange(false),
  });

  const commands: CommandItem[] = useMemo(() => [
    {
      id: "slides",
      category: "Studios",
      title: "Slide Studio",
      subtitle: "Generate 4-8 slide pitch decks with VTuber stage",
      icon: Presentation,
      shortcut: "S",
      action: () => {
        onSelectAction?.("slides");
        onOpenChange(false);
      },
    },
    {
      id: "sheet",
      category: "Studios",
      title: "Financial Spreadsheet",
      subtitle: "3-scenario financial modeling with live formula evaluation",
      icon: Table2,
      shortcut: "F",
      action: () => {
        onSelectAction?.("sheet");
        onOpenChange(false);
      },
    },
    {
      id: "research",
      category: "Studios",
      title: "Deep Web Research",
      subtitle: "Multi-source market intelligence and verified citations",
      icon: BookOpen,
      shortcut: "R",
      action: () => {
        onSelectAction?.("research");
        onOpenChange(false);
      },
    },
    {
      id: "doc",
      category: "Studios",
      title: "Document Canvas",
      subtitle: "Executive memos, reports, and AI chapter drafting",
      icon: FileText,
      shortcut: "D",
      action: () => {
        onSelectAction?.("doc");
        onOpenChange(false);
      },
    },
    {
      id: "twin_cockpit",
      category: "Autonomous Twin",
      title: "Digital Twin Cockpit",
      subtitle: "Autonomous company roadmap, tasks, and telemetry",
      icon: Sparkles,
      badge: "Autonomous",
      action: () => {
        if (typeof window !== "undefined") window.location.href = "/twin";
        onOpenChange(false);
      },
    },
    {
      id: "second_me",
      category: "Autonomous Twin",
      title: "SecondMe Memory Vault",
      subtitle: "Inspect learned episodic decisions, founder rules & traits",
      icon: Brain,
      action: () => {
        onSelectAction?.("second_me");
        onOpenChange(false);
      },
    },
    {
      id: "voice",
      category: "Tools",
      title: "Spoken Voice Commander",
      subtitle: "Hands-free Banglish voice assistant with 3D avatar orb",
      icon: Mic,
      shortcut: "V",
      action: () => {
        onSelectAction?.("voice");
        onOpenChange(false);
      },
    },
    {
      id: "mfs",
      category: "Logistics & MFS",
      title: "bKash & Nagad MFS Ledger",
      subtitle: "Real-time 10-digit TrxID matching and checkout settlement",
      icon: CreditCard,
      action: () => {
        onSelectAction?.("mfs");
        onOpenChange(false);
      },
    },
    {
      id: "courier",
      category: "Logistics & MFS",
      title: "Steadfast & Pathao Logistics",
      subtitle: "Auto-book parcels and check 64-district COD reconciliation",
      icon: Truck,
      action: () => {
        onSelectAction?.("courier");
        onOpenChange(false);
      },
    },
    {
      id: "webhook_sandbox",
      category: "Developer Sandbox",
      title: "Logistics & MFS Webhook Sandbox",
      subtitle: "Simulate inbound bKash, Steadfast, and Pathao webhook events",
      icon: Zap,
      shortcut: "W",
      action: () => {
        onSelectAction?.("webhook_sandbox");
        onOpenChange(false);
      },
    },
  ], [onOpenChange, onSelectAction]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.subtitle.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside command palette
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, selectedIndex]);

  if (!open) return null;

  return (
    <div
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer select-none"
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border/80 bg-popover/95 p-3 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150 space-y-3 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2 border-b border-border/50">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to studio... (↑ ↓ Enter)"
            aria-label="Search tools and commands"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border/60 bg-muted/60 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div role="listbox" aria-label="Available commands" className="max-h-[340px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No matching tools or commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer group min-h-[44px]",
                    isSelected
                      ? "bg-brand/15 text-foreground font-semibold border border-brand/30 shadow-xs"
                      : "hover:bg-muted/60 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 transition",
                        isSelected
                          ? "bg-brand text-white border-brand"
                          : "bg-muted/60 text-muted-foreground border-border/40 group-hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-500 text-[9px] font-mono font-semibold border border-emerald-500/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded border border-border/50 bg-muted/40 text-[10px] font-mono text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className={cn("w-3.5 h-3.5 text-muted-foreground/60 transition", isSelected && "text-brand translate-x-0.5")} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
