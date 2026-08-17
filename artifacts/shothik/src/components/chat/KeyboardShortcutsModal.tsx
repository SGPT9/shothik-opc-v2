"use client";

import React, { useEffect } from "react";
import { X, Command, Keyboard, Sparkles } from "lucide-react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutCategory {
  title: string;
  items: { key: string; label: string; desc: string }[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Composer & Navigation",
    items: [
      { key: "/", label: "Focus / Slash Menu", desc: "Jump to composer and open specialized skill tools" },
      { key: "Ctrl + Shift + O", label: "New Chat Session", desc: "Start a fresh conversation thread immediately" },
      { key: "↑", label: "Prompt History Recall", desc: "Recall previous prompt when composer is empty" },
      { key: "Enter", label: "Send Message", desc: "Submit active prompt to AI engine" },
      { key: "Shift + Enter", label: "New Line", desc: "Insert a line break without sending" },
    ],
  },
  {
    title: "Workspace & Tools",
    items: [
      { key: "Esc", label: "Dismiss Surfaces", desc: "Close details drawer, dropdowns, and modal dialogs" },
      { key: "Ctrl + Shift + E", label: "Export Session", desc: "Download conversation as Markdown or JSON" },
      { key: "?", label: "Keyboard Cheat Sheet", desc: "Toggle this shortcut cheatsheet from anywhere" },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-popover/95 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-150 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand/15 text-brand border border-brand/30">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Keyboard Shortcuts</h2>
              <p className="text-xs text-muted-foreground">Power shortcuts for high-speed agentic workflows</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
          {SHORTCUT_CATEGORIES.map((cat) => (
            <div key={cat.title} className="space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                {cat.title}
              </div>
              <div className="space-y-1.5">
                {cat.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-2 rounded-xl bg-card/60 border border-border/40 hover:bg-muted/40 transition"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="text-xs font-semibold text-foreground">{item.label}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{item.desc}</div>
                    </div>
                    <kbd className="shrink-0 px-2 py-1 rounded-lg bg-background border border-border/80 shadow-xs font-mono text-[11px] font-semibold text-foreground">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-[11px] text-muted-foreground font-mono">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">Esc</kbd> to close</span>
          <span className="flex items-center gap-1 text-brand font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Shothik Core v2.4</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsModal;
