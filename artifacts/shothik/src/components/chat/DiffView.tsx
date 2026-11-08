import React, { memo, useState } from "react";
import { Check, Copy, ChevronDown, ChevronRight, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

export interface DiffLine {
  type: "add" | "del" | "context" | "hunk";
  text: string;
  oldLine?: number;
  newLine?: number;
}

export interface ParsedDiff {
  lines: DiffLine[];
  additions: number;
  deletions: number;
  hasLineNumbers: boolean;
}

/**
 * Parses unified diff text into typed lines with line numbers and addition/deletion counts.
 */
export function parseUnifiedDiff(diff: string): ParsedDiff {
  if (!diff || !diff.trim()) {
    return { lines: [], additions: 0, deletions: 0, hasLineNumbers: false };
  }

  const lines: DiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let hasLineNumbers = false;
  let oldLine: number | undefined;
  let newLine: number | undefined;
  let inHunk = false;

  const rawLines = diff.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");

  for (const raw of rawLines) {
    if (!inHunk && (raw.startsWith("--- ") || raw.startsWith("+++ "))) {
      continue;
    }
    if (raw.startsWith("\\")) {
      continue;
    }
    const hunk = HUNK_HEADER.exec(raw);
    if (hunk) {
      inHunk = true;
      oldLine = Number(hunk[1]);
      newLine = Number(hunk[2]);
      hasLineNumbers = true;
      lines.push({ type: "hunk", text: raw });
      continue;
    }
    if (raw === "@@") {
      inHunk = true;
      oldLine = undefined;
      newLine = undefined;
      lines.push({ type: "hunk", text: "" });
      continue;
    }
    if (raw.startsWith("+")) {
      additions += 1;
      lines.push({ type: "add", text: raw.slice(1), newLine });
      newLine = newLine == null ? undefined : newLine + 1;
      continue;
    }
    if (raw.startsWith("-")) {
      deletions += 1;
      lines.push({ type: "del", text: raw.slice(1), oldLine });
      oldLine = oldLine == null ? undefined : oldLine + 1;
      continue;
    }
    lines.push({
      type: "context",
      text: raw.startsWith(" ") ? raw.slice(1) : raw,
      oldLine,
      newLine,
    });
    oldLine = oldLine == null ? undefined : oldLine + 1;
    newLine = newLine == null ? undefined : newLine + 1;
  }

  return { lines, additions, deletions, hasLineNumbers };
}

interface DiffRowProps {
  type: DiffLine["type"];
  text: string;
  num?: number;
  hasLineNumbers: boolean;
}

const DiffRow = memo(function DiffRow({ type, text, num, hasLineNumbers }: DiffRowProps) {
  if (type === "hunk") {
    if (!text) {
      return <div className="border-border/60 mx-3 my-1.5 border-t" />;
    }
    return (
      <div className="text-muted-foreground/60 text-[10px] px-3 py-0.5 select-none font-mono bg-muted/20">
        {text}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex font-mono text-xs leading-5 hover:bg-muted/30 transition-colors",
        type === "add" && "bg-emerald-500/10 text-emerald-900 dark:text-emerald-200",
        type === "del" && "bg-rose-500/10 text-rose-900 dark:text-rose-200",
      )}
    >
      {hasLineNumbers && (
        <span className="text-muted-foreground/40 text-[10px] w-9 shrink-0 pe-2 text-end select-none">
          {num ?? ""}
        </span>
      )}
      <span
        className={cn(
          "shrink-0 text-center font-bold select-none w-5",
          type === "add" && "text-emerald-600 dark:text-emerald-400",
          type === "del" && "text-rose-600 dark:text-rose-400",
          type === "context" && "text-muted-foreground/40",
        )}
      >
        {type === "add" ? "+" : type === "del" ? "-" : " "}
      </span>
      <span className="min-w-0 flex-1 pe-3 break-words whitespace-pre-wrap">
        {text || " "}
      </span>
    </div>
  );
});

export interface DiffViewProps {
  diffText: string;
  fileName?: string;
  className?: string;
}

/**
 * Visual unified diff viewer adapted from LibreChat.
 * Shows additions in green, deletions in red, hunk markers, and line counts.
 */
export function DiffView({ diffText, fileName, className }: DiffViewProps) {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const parsed = React.useMemo(() => parseUnifiedDiff(diffText), [diffText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "my-2 rounded-xl border border-border/80 bg-zinc-950/90 text-zinc-100 overflow-hidden shadow-sm",
        className,
      )}
    >
      {/* Diff Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-1.5 text-xs">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 font-medium text-foreground hover:text-brand transition"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          <FileCode className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{fileName || "Changes"}</span>
          <span className="flex items-center gap-1.5 text-[10px] font-mono pl-1">
            <span className="text-emerald-500 font-bold">+{parsed.additions}</span>
            <span className="text-rose-500 font-bold">-{parsed.deletions}</span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy Diff"}</span>
          </button>
        </div>
      </div>

      {/* Diff Body */}
      {!collapsed && (
        <div className="max-h-80 overflow-y-auto py-1 custom-scrollbar">
          {parsed.lines.map((line, index) => (
            <DiffRow
              key={index}
              type={line.type}
              text={line.text}
              num={line.type === "del" ? line.oldLine : (line.newLine ?? line.oldLine)}
              hasLineNumbers={parsed.hasLineNumbers}
            />
          ))}
        </div>
      )}
    </div>
  );
}
