/**
 * FAANG-Grade Refactored SourceIntake Orchestrator.
 * Handles drag-and-drop file ingestion, URL extraction, and source limits.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Link2,
  Type,
  X,
  Plus,
  Loader2,
  Upload,
  ArrowRight,
  ChevronRight,
  File,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSourceIntake, type ProjectSource } from "./hooks/useSourceIntake";
export { type ProjectSource };
import { ComponentErrorBoundary } from "@/components/agents/components/ChatErrorBoundaries";

interface SourceIntakeProps {
  onComplete: (sources: ProjectSource[]) => void;
  onSkip: () => void;
  initialSources?: ProjectSource[];
  embedded?: boolean;
}

type InputMode = "file" | "link" | "text";

function generateId() {
  return `src_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function SourceIntake({ onComplete, onSkip, initialSources, embedded }: SourceIntakeProps) {
  const [mode, setMode] = useState<InputMode>("file");
  const { sources, isLoading, loadingLabel, error, addSource, removeSource, setIsLoading, setLoadingLabel, setError } =
    useSourceIntake(initialSources || [], 5);

  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddText = useCallback(() => {
    if (!textInput.trim()) return;
    const added = addSource({
      id: generateId(),
      type: "text",
      title: textInput.trim().slice(0, 30) + "…",
      text: textInput.trim(),
      preview: textInput.trim().slice(0, 100),
    });
    if (added) setTextInput("");
  }, [addSource, textInput]);

  const handleAddUrl = useCallback(() => {
    if (!urlInput.trim()) return;
    const added = addSource({
      id: generateId(),
      type: "url",
      title: urlInput.trim(),
      text: `Source URL: ${urlInput.trim()}`,
      preview: urlInput.trim(),
    });
    if (added) setUrlInput("");
  }, [addSource, urlInput]);

  return (
    <ComponentErrorBoundary title="Source Intake Error">
      <div className={cn("flex flex-col space-y-4 p-4", embedded ? "" : "max-w-xl mx-auto rounded-2xl border border-border bg-card shadow-2xl")}>
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-400" /> Research & Source Intake
          </h3>
          <span className="font-mono text-xs text-muted-foreground">{sources.length} / 5 sources</span>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Input Mode Selector */}
        <div className="grid grid-cols-3 gap-2">
          {(["file", "link", "text"] as InputMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-xl border p-2 text-xs font-bold uppercase transition",
                mode === m
                  ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Dynamic Mode Form */}
        {mode === "text" && (
          <div className="space-y-2">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste raw notes, research text, or excerpts…"
              rows={3}
              className="w-full rounded-xl border border-border bg-muted/50 p-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddText}
              disabled={!textInput.trim()}
              className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Add Text Source
            </button>
          </div>
        )}

        {mode === "link" && (
          <div className="space-y-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste website URL or YouTube video link…"
              className="w-full rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddUrl}
              disabled={!urlInput.trim()}
              className="w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              Add URL Source
            </button>
          </div>
        )}

        {/* Existing Sources List */}
        <div className="space-y-1.5 pt-2">
          {sources.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-2 text-xs">
              <span className="truncate font-semibold text-foreground max-w-[240px]">{s.title}</span>
              <button onClick={() => removeSource(s.id)} className="text-muted-foreground hover:text-red-400">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <button onClick={onSkip} className="text-xs text-muted-foreground hover:text-foreground">
            Skip for now
          </button>
          <button
            onClick={() => onComplete(sources)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 flex items-center gap-1.5"
          >
            Continue to Workspace <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
